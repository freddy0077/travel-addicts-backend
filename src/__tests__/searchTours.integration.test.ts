import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PrismaClient } from '@prisma/client';
import { typeDefs } from '../graphql/schema';
import resolvers from '../graphql/resolvers';

// Real integration tests with actual database
describe('searchTours API Integration Tests', () => {
  let yoga: any;
  let prisma: PrismaClient;
  let testTourIds: string[] = [];

  beforeAll(async () => {
    // Initialize Prisma with test database
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL
        }
      }
    });

    // Create GraphQL Yoga server for testing
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    yoga = createYoga({
      schema,
      context: { prisma, user: null }, // No authentication for public queries
    });

    // Seed test data
    await seedTestData();
  });

  afterAll(async () => {
    // Clean up test data
    await cleanupTestData();
    await prisma.$disconnect();
  });

  const seedTestData = async () => {
    try {
      // Create test countries
      const switzerland = await prisma.country.upsert({
        where: { code: 'CH' },
        update: {},
        create: {
          name: 'Switzerland',
          code: 'CH',
          continent: 'Europe'
        }
      });

      const ghana = await prisma.country.upsert({
        where: { code: 'GH' },
        update: {},
        create: {
          name: 'Ghana',
          code: 'GH',
          continent: 'Africa'
        }
      });

      // Create test destinations
      const swissAlps = await prisma.destination.upsert({
        where: { slug: 'swiss-alps-test' },
        update: {},
        create: {
          name: 'Swiss Alps Test',
          slug: 'swiss-alps-test',
          countryId: switzerland.id,
          type: 'Mountain',
          season: 'Summer',
          description: 'Test Swiss Alps destination for integration testing',
          highlights: ['Mountain views', 'Alpine hiking', 'Scenic railways'],
          image: '/test-image.jpg',
          gallery: ['/test-image.jpg'],
          rating: 4.5,
          reviewCount: 0,
          priceFrom: 300000, // 3000 GHS in pesewas
          duration: '7-10 days',
          bestTime: 'June to September',
          climate: 'Alpine climate with cool summers',
          activities: ['Hiking', 'Skiing', 'Sightseeing'],
          featured: true
        }
      });

      const accra = await prisma.destination.upsert({
        where: { slug: 'accra-test' },
        update: {},
        create: {
          name: 'Accra Test',
          slug: 'accra-test',
          countryId: ghana.id,
          type: 'City',
          season: 'Year-round',
          description: 'Test Accra destination for integration testing',
          highlights: ['Historical sites', 'Cultural experiences', 'Local markets'],
          image: '/test-accra.jpg',
          gallery: ['/test-accra.jpg'],
          rating: 4.2,
          reviewCount: 0,
          priceFrom: 150000, // 1500 GHS in pesewas
          duration: '3-5 days',
          bestTime: 'November to March',
          climate: 'Tropical climate with dry and wet seasons',
          activities: ['City tours', 'Cultural visits', 'Market visits'],
          featured: true
        }
      });

      // Create test tours
      const tour1 = await prisma.tour.create({
        data: {
          title: 'Swiss Alps Adventure Test',
          slug: 'swiss-alps-adventure-test',
          destinationId: swissAlps.id,
          description: 'Experience the majestic Swiss Alps with scenic train rides and mountain hiking',
          highlights: ['Matterhorn viewing', 'Glacier Express', 'Alpine hiking'],
          inclusions: ['All meals included', 'Professional guide', 'Transportation'],
          exclusions: ['International flights', 'Travel insurance'],
          duration: 8,
          groupSizeMax: 8,
          difficulty: 'MODERATE',
          priceFrom: 520000, // 5200 GHS in pesewas
          images: ['/test-swiss.jpg'],
          featured: true,
          status: 'PUBLISHED'
        }
      });

      const tour2 = await prisma.tour.create({
        data: {
          title: 'Accra Heritage & Culture Experience Test',
          slug: 'accra-heritage-culture-test',
          destinationId: accra.id,
          description: 'Immerse yourself in Ghana\'s rich history and vibrant culture',
          highlights: ['Independence Square', 'Kwame Nkrumah Mausoleum', 'Makola Market'],
          inclusions: ['Local meals', 'Expert guide', 'City transport'],
          exclusions: ['International flights'],
          duration: 4,
          groupSizeMax: 12,
          difficulty: 'EASY',
          priceFrom: 180000, // 1800 GHS in pesewas
          images: ['/test-accra.jpg'],
          featured: true,
          status: 'PUBLISHED'
        }
      });

      const tour3 = await prisma.tour.create({
        data: {
          title: 'Budget Swiss Tour Test',
          slug: 'budget-swiss-tour-test',
          destinationId: swissAlps.id,
          description: 'Affordable Swiss experience with basic accommodation',
          highlights: ['Mountain views', 'Local transport'],
          inclusions: ['Basic meals', 'Local guide'],
          exclusions: ['Luxury accommodation', 'Premium transport'],
          duration: 3,
          groupSizeMax: 15,
          difficulty: 'EASY',
          priceFrom: 120000, // 1200 GHS in pesewas
          images: ['/test-budget.jpg'],
          featured: false,
          status: 'PUBLISHED'
        }
      });

      testTourIds = [tour1.id, tour2.id, tour3.id];

      // Add some test reviews
      await prisma.review.createMany({
        data: [
          {
            tourId: tour1.id,
            customerId: 'test-customer-1',
            rating: 5,
            title: 'Amazing Swiss Adventure!',
            content: 'Incredible experience in the Alps',
            status: 'APPROVED'
          },
          {
            tourId: tour1.id,
            customerId: 'test-customer-2',
            rating: 4,
            title: 'Great tour',
            content: 'Really enjoyed the mountain views',
            status: 'APPROVED'
          },
          {
            tourId: tour2.id,
            customerId: 'test-customer-3',
            rating: 5,
            title: 'Cultural immersion',
            content: 'Learned so much about Ghanaian culture',
            status: 'APPROVED'
          }
        ]
      });

      console.log('Test data seeded successfully');
    } catch (error) {
      console.error('Error seeding test data:', error);
      throw error;
    }
  };

  const cleanupTestData = async () => {
    try {
      // Delete in reverse order of dependencies
      await prisma.review.deleteMany({
        where: {
          tourId: { in: testTourIds }
        }
      });

      await prisma.tour.deleteMany({
        where: {
          slug: {
            in: [
              'swiss-alps-adventure-test',
              'accra-heritage-culture-test',
              'budget-swiss-tour-test'
            ]
          }
        }
      });

      await prisma.destination.deleteMany({
        where: {
          slug: {
            in: ['swiss-alps-test', 'accra-test']
          }
        }
      });

      console.log('Test data cleaned up successfully');
    } catch (error) {
      console.error('Error cleaning up test data:', error);
    }
  };

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

  describe('Basic Search Functionality', () => {
    it('should return all published tours when no filters provided', async () => {
      const query = `
        query SearchTours($limit: Int, $offset: Int) {
          searchTours(limit: $limit, offset: $offset) {
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

      const result = await executeGraphQL(query, { limit: 10, offset: 0 });

      expect(result.errors).toBeUndefined();
      expect(result.data).toBeDefined();
      expect(result.data.searchTours).toBeDefined();
      expect(result.data.searchTours.tours).toHaveLength(3);
      expect(result.data.searchTours.totalCount).toBe(3);
      expect(result.data.searchTours.hasMore).toBe(false);

      // Verify featured tours come first
      const tours = result.data.searchTours.tours;
      expect(tours[0].featured).toBe(true);
      expect(tours[1].featured).toBe(true);
      expect(tours[2].featured).toBe(false);
    });

    it('should handle pagination correctly', async () => {
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
      expect(result.data.searchTours.tours).toHaveLength(2);
      expect(result.data.searchTours.totalCount).toBe(3);
      expect(result.data.searchTours.hasMore).toBe(true);

      // Test second page
      const result2 = await executeGraphQL(query, { limit: 2, offset: 2 });
      expect(result2.data.searchTours.tours).toHaveLength(1);
      expect(result2.data.searchTours.hasMore).toBe(false);
    });
  });

  describe('Text Search Filtering', () => {
    it('should filter tours by text query in title', async () => {
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

      const result = await executeGraphQL(query, { query: 'Swiss' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(2); // 2 Swiss tours
      expect(result.data.searchTours.totalCount).toBe(2);
      
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.title.toLowerCase()).toContain('swiss');
      });
    });

    it('should filter tours by text query in description', async () => {
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

      const result = await executeGraphQL(query, { query: 'culture' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(1);
      expect(result.data.searchTours.tours[0].description.toLowerCase()).toContain('culture');
    });
  });

  describe('Geographic Filtering', () => {
    it('should filter tours by continent', async () => {
      const query = `
        query SearchTours($continent: String) {
          searchTours(continent: $continent) {
            tours {
              id
              title
              destination {
                country {
                  continent
                }
              }
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { continent: 'Europe' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(2); // 2 European tours
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.destination.country.continent).toBe('Europe');
      });
    });

    it('should filter tours by country', async () => {
      const query = `
        query SearchTours($country: String) {
          searchTours(country: $country) {
            tours {
              id
              title
              destination {
                country {
                  name
                }
              }
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { country: 'Ghana' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(1);
      expect(result.data.searchTours.tours[0].destination.country.name).toBe('Ghana');
    });

    it('should filter tours by destination', async () => {
      const query = `
        query SearchTours($destination: String) {
          searchTours(destination: $destination) {
            tours {
              id
              title
              destination {
                name
              }
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { destination: 'Accra' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(1);
      expect(result.data.searchTours.tours[0].destination.name).toContain('Accra');
    });
  });

  describe('Price Range Filtering', () => {
    it('should filter tours by minimum price', async () => {
      const query = `
        query SearchTours($minPrice: Int) {
          searchTours(minPrice: $minPrice) {
            tours {
              id
              title
              priceFrom
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { minPrice: 200000 }); // 2000 GHS

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(2); // Swiss Adventure and Accra tours
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.priceFrom).toBeGreaterThanOrEqual(200000);
      });
    });

    it('should filter tours by maximum price', async () => {
      const query = `
        query SearchTours($maxPrice: Int) {
          searchTours(maxPrice: $maxPrice) {
            tours {
              id
              title
              priceFrom
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { maxPrice: 200000 }); // 2000 GHS

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(2); // Budget and Accra tours
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.priceFrom).toBeLessThanOrEqual(200000);
      });
    });

    it('should filter tours by price range', async () => {
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
        minPrice: 150000, // 1500 GHS
        maxPrice: 300000  // 3000 GHS
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(1); // Only Accra tour
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.priceFrom).toBeGreaterThanOrEqual(150000);
        expect(tour.priceFrom).toBeLessThanOrEqual(300000);
      });
    });
  });

  describe('Duration and Group Size Filtering', () => {
    it('should filter tours by duration', async () => {
      const query = `
        query SearchTours($duration: String) {
          searchTours(duration: $duration) {
            tours {
              id
              title
              duration
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { duration: '4' });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(1); // Accra tour
      expect(result.data.searchTours.tours[0].duration).toBe(4);
    });

    it('should filter tours by group size (adults)', async () => {
      const query = `
        query SearchTours($adults: Int) {
          searchTours(adults: $adults) {
            tours {
              id
              title
              groupSizeMax
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, { adults: 10 });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(2); // Accra and Budget tours
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.groupSizeMax).toBeGreaterThanOrEqual(10);
      });
    });
  });

  describe('Field Resolvers Integration', () => {
    it('should calculate rating and review count correctly', async () => {
      const query = `
        query SearchTours {
          searchTours {
            tours {
              id
              title
              rating
              reviewCount
            }
          }
        }
      `;

      const result = await executeGraphQL(query);

      expect(result.errors).toBeUndefined();
      const tours = result.data.searchTours.tours;
      
      // Find Swiss Alps tour (has 2 reviews: 5 and 4)
      const swissTour = tours.find((t: any) => t.title.includes('Swiss Alps Adventure'));
      expect(swissTour.rating).toBe(4.5); // (5 + 4) / 2
      expect(swissTour.reviewCount).toBe(2);

      // Find Accra tour (has 1 review: 5)
      const accraTour = tours.find((t: any) => t.title.includes('Accra Heritage'));
      expect(accraTour.rating).toBe(5);
      expect(accraTour.reviewCount).toBe(1);

      // Find Budget tour (has 0 reviews)
      const budgetTour = tours.find((t: any) => t.title.includes('Budget'));
      expect(budgetTour.rating).toBe(0);
      expect(budgetTour.reviewCount).toBe(0);
    });

    it('should derive category and features correctly', async () => {
      const query = `
        query SearchTours {
          searchTours {
            tours {
              id
              title
              category
              features
            }
          }
        }
      `;

      const result = await executeGraphQL(query);

      expect(result.errors).toBeUndefined();
      const tours = result.data.searchTours.tours;
      
      const swissTour = tours.find((t: any) => t.title.includes('Adventure'));
      expect(swissTour.category).toBe('Adventure');
      expect(swissTour.features).toContain('Meals Included');
      expect(swissTour.features).toContain('Professional Guide');
      expect(swissTour.features).toContain('Transportation');

      const cultureTour = tours.find((t: any) => t.title.includes('Culture'));
      expect(cultureTour.category).toBe('Cultural');
    });
  });

  describe('Complex Multi-Filter Scenarios', () => {
    it('should handle multiple filters simultaneously', async () => {
      const query = `
        query SearchTours(
          $query: String
          $continent: String
          $minPrice: Int
          $maxPrice: Int
          $adults: Int
        ) {
          searchTours(
            query: $query
            continent: $continent
            minPrice: $minPrice
            maxPrice: $maxPrice
            adults: $adults
          ) {
            tours {
              id
              title
              priceFrom
              groupSizeMax
              destination {
                country {
                  continent
                }
              }
            }
            totalCount
          }
        }
      `;

      const result = await executeGraphQL(query, {
        query: 'Swiss',
        continent: 'Europe',
        minPrice: 100000,
        maxPrice: 600000,
        adults: 5
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours.tours).toHaveLength(2); // Both Swiss tours
      
      result.data.searchTours.tours.forEach((tour: any) => {
        expect(tour.title.toLowerCase()).toContain('swiss');
        expect(tour.destination.country.continent).toBe('Europe');
        expect(tour.priceFrom).toBeGreaterThanOrEqual(100000);
        expect(tour.priceFrom).toBeLessThanOrEqual(600000);
        expect(tour.groupSizeMax).toBeGreaterThanOrEqual(5);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid GraphQL queries gracefully', async () => {
      const invalidQuery = `
        query {
          searchTours {
            invalidField
          }
        }
      `;

      const result = await executeGraphQL(invalidQuery);

      expect(result.errors).toBeDefined();
      expect(result.errors[0].message).toContain('Cannot query field "invalidField"');
    });

    it('should handle invalid filter values gracefully', async () => {
      const query = `
        query SearchTours($duration: String, $adults: Int) {
          searchTours(duration: $duration, adults: $adults) {
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
        adults: -5
      });

      // Should not crash and return results (invalid values ignored)
      expect(result.errors).toBeUndefined();
      expect(result.data.searchTours).toBeDefined();
    });
  });
});
