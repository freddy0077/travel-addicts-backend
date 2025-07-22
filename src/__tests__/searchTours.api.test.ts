import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from '../graphql/schema';
import resolvers from '../graphql/resolvers';

// Real API integration tests that work with existing database
describe('searchTours Real API Integration Tests', () => {
  let yoga: any;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Initialize Prisma with actual database
    prisma = new PrismaClient();

    // Create GraphQL Yoga server for testing
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    yoga = createYoga({
      schema,
      context: { prisma, user: null }, // No authentication for public queries
    });

    console.log('🧪 Starting real API integration tests...');
  });

  afterAll(async () => {
    await prisma.$disconnect();
    console.log('✅ Real API integration tests completed');
  });

  const executeGraphQL = async (query: string, variables?: any) => {
    const response = await yoga.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    return await response.json();
  };

  describe('Basic API Functionality', () => {
    it('should successfully execute searchTours query with no parameters', async () => {
      const query = `
        query SearchTours {
          searchTours {
            tours {
              id
              title
              slug
              priceFrom
              duration
              featured
              status
              destination {
                name
                country {
                  name
                  continent
                }
              }
            }
            totalCount
            hasMore
          }
        }
      `;

      const result = await executeGraphQL(query);

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data.searchTours).toBeDefined();
      expect(result.data.searchTours.tours).toBeDefined();
      expect(Array.isArray(result.data.searchTours.tours)).toBe(true);
      expect(typeof result.data.searchTours.totalCount).toBe('number');
      expect(typeof result.data.searchTours.hasMore).toBe('boolean');

      console.log(`✅ Found ${result.data.searchTours.totalCount} tours in database`);
    });

    it('should handle pagination parameters correctly', async () => {
      const query = `
        query SearchTours($limit: Int, $offset: Int) {
          searchTours(limit: $limit, offset: $offset) {
            tours {
              id
              title
            }
            totalCount
            hasMore
          }
        }
      `;

      const result = await executeGraphQL(query, { limit: 2, offset: 0 });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      expect(result.data.searchTours.tours.length).toBeLessThanOrEqual(2);
      expect(typeof result.data.searchTours.totalCount).toBe('number');
      expect(typeof result.data.searchTours.hasMore).toBe('boolean');

      // If there are more than 2 tours, hasMore should be true
      if (result.data.searchTours.totalCount > 2) {
        expect(result.data.searchTours.hasMore).toBe(true);
      }
    });
  });

  describe('Search Parameter Validation', () => {
    it('should accept text query parameter without errors', async () => {
      const query = `
        query SearchTours($query: String) {
          searchTours(query: $query) {
            tours {
              id
              title
              description
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { query: 'adventure' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      expect(typeof result.data.searchTours.totalCount).toBe('number');
    });

    it('should accept geographic filter parameters', async () => {
      const query = `
        query SearchTours($continent: String, $country: String, $destination: String) {
          searchTours(continent: $continent, country: $country, destination: $destination) {
            tours {
              id
              title
              destination {
                name
                country {
                  name
                  continent
                }
              }
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { 
        continent: 'Africa',
        country: 'Ghana',
        destination: 'Accra'
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
    });

    it('should accept price range filter parameters', async () => {
      const query = `
        query SearchTours($minPrice: Int, $maxPrice: Int) {
          searchTours(minPrice: $minPrice, maxPrice: $maxPrice) {
            tours {
              id
              title
              priceFrom
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { 
        minPrice: 100000, // 1000 GHS
        maxPrice: 500000  // 5000 GHS
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      
      // Verify price filtering works if tours are returned
      if (result.data.searchTours.tours.length > 0) {
        result.data.searchTours.tours.forEach((tour: any) => {
          expect(tour.priceFrom).toBeGreaterThanOrEqual(100000);
          expect(tour.priceFrom).toBeLessThanOrEqual(500000);
        });
      }
    });

    it('should accept traveler and duration filter parameters', async () => {
      const query = `
        query SearchTours($adults: Int, $children: Int, $duration: String) {
          searchTours(adults: $adults, children: $children, duration: $duration) {
            tours {
              id
              title
              duration
              groupSizeMax
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { 
        adults: 2,
        children: 1,
        duration: '7'
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
    });

    it('should accept feature and rating filter parameters', async () => {
      const query = `
        query SearchTours($features: [String!], $minRating: Float, $season: String) {
          searchTours(features: $features, minRating: $minRating, season: $season) {
            tours {
              id
              title
              rating
              features
              season
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { 
        features: ['Meals', 'Guide'],
        minRating: 4.0,
        season: 'Summer'
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
    });
  });

  describe('Field Resolvers Integration', () => {
    it('should calculate computed fields correctly', async () => {
      const query = `
        query SearchTours {
          searchTours(limit: 5) {
            tours {
              id
              title
              rating
              reviewCount
              category
              features
              season
            }
          }
        }
      `;

      const result = await executeGraphQL(query);

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      
      if (result.data.searchTours.tours.length > 0) {
        result.data.searchTours.tours.forEach((tour: any) => {
          // Verify computed fields are present and have correct types
          expect(typeof tour.rating).toBe('number');
          expect(typeof tour.reviewCount).toBe('number');
          expect(typeof tour.category).toBe('string');
          expect(Array.isArray(tour.features)).toBe(true);
          expect(typeof tour.season).toBe('string');
          
          // Rating should be between 0 and 5
          expect(tour.rating).toBeGreaterThanOrEqual(0);
          expect(tour.rating).toBeLessThanOrEqual(5);
          
          // Review count should be non-negative
          expect(tour.reviewCount).toBeGreaterThanOrEqual(0);
        });
      }
    });
  });

  describe('Complex Multi-Filter Scenarios', () => {
    it('should handle multiple filters simultaneously without errors', async () => {
      const query = `
        query SearchTours(
          $query: String
          $continent: String
          $minPrice: Int
          $maxPrice: Int
          $adults: Int
          $duration: String
          $minRating: Float
          $limit: Int
        ) {
          searchTours(
            query: $query
            continent: $continent
            minPrice: $minPrice
            maxPrice: $maxPrice
            adults: $adults
            duration: $duration
            minRating: $minRating
            limit: $limit
          ) {
            tours {
              id
              title
              priceFrom
              duration
              groupSizeMax
              rating
              destination {
                country {
                  continent
                }
              }
            }
            totalCount
            hasMore
          }
        }
      `;

      const result = await executeGraphQL(query, {
        query: 'tour',
        continent: 'Africa',
        minPrice: 50000,   // 500 GHS
        maxPrice: 1000000, // 10000 GHS
        adults: 2,
        duration: '7',
        minRating: 3.0,
        limit: 10
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      expect(typeof result.data.searchTours.totalCount).toBe('number');
      expect(typeof result.data.searchTours.hasMore).toBe('boolean');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle invalid GraphQL queries gracefully', async () => {
      const invalidQuery = `
        query {
          searchTours {
            tours {
              invalidField
            }
          }
        }
      `;

      const result = await executeGraphQL(invalidQuery);

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('Cannot query field "invalidField"');
    });

    it('should handle invalid parameter values gracefully', async () => {
      const query = `
        query SearchTours($duration: String, $adults: Int, $minRating: Float) {
          searchTours(duration: $duration, adults: $adults, minRating: $minRating) {
            tours {
              id
              title
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, {
        duration: 'invalid-duration',
        adults: -5,
        minRating: 10.0 // Invalid rating > 5
      });

      // Should not crash and should return results (invalid values ignored)
      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      expect(typeof result.data.searchTours.totalCount).toBe('number');
    });

    it('should handle empty search results gracefully', async () => {
      const query = `
        query SearchTours($query: String) {
          searchTours(query: $query) {
            tours {
              id
              title
            }
            totalCount
            hasMore
          }
        }
      `;

      // Search for something very unlikely to exist
      const result = await executeGraphQL(query, { 
        query: 'xyzabc123nonexistent' 
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      expect(result.data.searchTours.totalCount).toBe(0);
      expect(result.data.searchTours.hasMore).toBe(false);
      expect(result.data.searchTours.tours).toHaveLength(0);
    });
  });

  describe('Performance and Scalability', () => {
    it('should complete search queries within reasonable time', async () => {
      const query = `
        query SearchTours($limit: Int) {
          searchTours(limit: $limit) {
            tours {
              id
              title
              priceFrom
              duration
              rating
              reviewCount
              category
              features
              destination {
                name
                country {
                  name
                  continent
                }
              }
            }
            totalCount
            hasMore
          }
        }
      `;

      const startTime = Date.now();
      const result = await executeGraphQL(query, { limit: 20 });
      const endTime = Date.now();
      const queryTime = endTime - startTime;

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      
      // Query should complete within 5 seconds (reasonable for integration test)
      expect(queryTime).toBeLessThan(5000);
      
      console.log(`⚡ Search query completed in ${queryTime}ms`);
    });

    it('should handle large limit values without crashing', async () => {
      const query = `
        query SearchTours($limit: Int) {
          searchTours(limit: $limit) {
            tours {
              id
              title
            }
            totalCount
            hasMore
          }
        }
      `;

      const result = await executeGraphQL(query, { limit: 100 });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
      expect(result.data.searchTours.tours.length).toBeLessThanOrEqual(100);
    });
  });
});
