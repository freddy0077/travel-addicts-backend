import resolvers from '../graphql/resolvers';

// Mock the entire Prisma module
jest.mock('@prisma/client', () => {
  const mockTours = [
    {
      id: '1',
      title: 'Swiss Alps Adventure',
      slug: 'swiss-alps-adventure',
      destination: {
        id: '1',
        name: 'Swiss Alps',
        season: 'Summer',
        country: {
          id: '1',
          name: 'Switzerland',
          code: 'CH',
          continent: 'Europe'
        }
      },
      description: 'Experience the majestic Swiss Alps with scenic train rides',
      highlights: ['Matterhorn viewing', 'Glacier Express', 'Alpine hiking'],
      inclusions: ['Meals', 'Professional Guide', 'Transportation'],
      exclusions: ['Flights', 'Insurance'],
      duration: 8,
      groupSizeMax: 8,
      difficulty: 'MODERATE',
      priceFrom: 520000,
      images: ['/api/placeholder/600/400'],
      featured: true,
      status: 'PUBLISHED',
      itinerary: [],
      pricing: [],
      reviews: [
        { id: '1', rating: 5, title: 'Amazing!', content: 'Great tour', customer: { firstName: 'John', lastName: 'Doe' }, createdAt: '2024-01-01' },
        { id: '2', rating: 4, title: 'Good', content: 'Nice experience', customer: { firstName: 'Jane', lastName: 'Smith' }, createdAt: '2024-01-02' }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Accra Heritage & Culture Experience',
      slug: 'accra-heritage-culture',
      destination: {
        id: '2',
        name: 'Accra',
        season: 'Year-round',
        country: {
          id: '2',
          name: 'Ghana',
          code: 'GH',
          continent: 'Africa'
        }
      },
      description: 'Immerse yourself in Ghana\'s rich history and vibrant culture',
      highlights: ['Independence Square', 'Kwame Nkrumah Mausoleum', 'Makola Market'],
      inclusions: ['Meals', 'Local Guide', 'Transportation'],
      exclusions: ['International flights'],
      duration: 4,
      groupSizeMax: 12,
      difficulty: 'EASY',
      priceFrom: 180000,
      images: ['/api/placeholder/600/400'],
      featured: true,
      status: 'PUBLISHED',
      itinerary: [],
      pricing: [],
      reviews: [],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    }
  ];

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      tour: {
        findMany: jest.fn().mockResolvedValue(mockTours),
        count: jest.fn().mockResolvedValue(mockTours.length),
      },
      $disconnect: jest.fn(),
    })),
  };
});

describe('searchTours Query - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should return search results with correct structure', async () => {
      const args = { limit: 10, offset: 0 };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toHaveProperty('tours');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('hasMore');
      expect(Array.isArray(result.tours)).toBe(true);
      expect(typeof result.totalCount).toBe('number');
      expect(typeof result.hasMore).toBe('boolean');
    });

    it('should handle pagination parameters', async () => {
      const args = { limit: 1, offset: 0 };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result.tours).toBeDefined();
      expect(result.totalCount).toBeGreaterThan(0);
    });

    it('should handle empty search parameters', async () => {
      const args = {};
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
      expect(result.tours).toBeDefined();
    });
  });

  describe('Search Parameters', () => {
    it('should accept text query parameter', async () => {
      const args = { query: 'Swiss', limit: 10, offset: 0 };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
      // The actual filtering logic is tested at the database level
    });

    it('should accept geographic filters', async () => {
      const args = { 
        continent: 'Europe',
        country: 'Switzerland',
        destination: 'Swiss Alps',
        limit: 10, 
        offset: 0 
      };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
    });

    it('should accept price range filters', async () => {
      const args = { 
        minPrice: 100000,
        maxPrice: 600000,
        limit: 10, 
        offset: 0 
      };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
    });

    it('should accept traveler count filters', async () => {
      const args = { 
        adults: 2,
        children: 1,
        limit: 10, 
        offset: 0 
      };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
    });

    it('should accept duration and category filters', async () => {
      const args = { 
        duration: '7',
        category: 'Adventure',
        limit: 10, 
        offset: 0 
      };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
    });

    it('should accept date and feature filters', async () => {
      const args = { 
        startDate: '2024-08-01',
        endDate: '2024-08-07',
        features: ['Meals', 'Guide'],
        season: 'Summer',
        minRating: 4.0,
        limit: 10, 
        offset: 0 
      };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toBeDefined();
    });
  });

  describe('Field Resolvers', () => {
    const mockTour = {
      id: '1',
      title: 'Swiss Alps Adventure',
      destination: {
        season: 'Summer',
        type: 'Mountain'
      },
      description: 'Experience the majestic Swiss Alps with scenic train rides',
      inclusions: ['All meals included', 'Professional guide', 'Transportation provided'],
      reviews: [
        { rating: 5 },
        { rating: 4 },
        { rating: 5 }
      ]
    };

    it('should calculate rating correctly', () => {
      const rating = resolvers.Tour.rating(mockTour);
      expect(rating).toBe(4.666666666666667); // (5 + 4 + 5) / 3
    });

    it('should return 0 rating for tours with no reviews', () => {
      const tourWithNoReviews = { ...mockTour, reviews: [] };
      const rating = resolvers.Tour.rating(tourWithNoReviews);
      expect(rating).toBe(0);
    });

    it('should calculate review count correctly', () => {
      const reviewCount = resolvers.Tour.reviewCount(mockTour);
      expect(reviewCount).toBe(3);
    });

    it('should derive category from title keywords', () => {
      const category = resolvers.Tour.category(mockTour);
      expect(category).toBe('Adventure');
    });

    it('should derive category from destination type', () => {
      const tourWithDestinationType = {
        ...mockTour,
        title: 'Regular Tour',
        destination: { type: 'Beach Resort' }
      };
      const category = resolvers.Tour.category(tourWithDestinationType);
      expect(category).toBe('Beach Resort');
    });

    it('should map inclusions to features correctly', () => {
      const features = resolvers.Tour.features(mockTour);
      expect(features).toContain('Meals Included');
      expect(features).toContain('Professional Guide');
      expect(features).toContain('Transportation');
    });

    it('should return destination season', () => {
      const season = resolvers.Tour.season(mockTour);
      expect(season).toBe('Summer');
    });

    it('should return year-round as fallback season', () => {
      const tourWithoutSeason = {
        ...mockTour,
        destination: { ...mockTour.destination, season: undefined }
      };
      const season = resolvers.Tour.season(tourWithoutSeason);
      expect(season).toBe('Year-round');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid duration gracefully', async () => {
      const args = { duration: 'invalid-duration', limit: 10, offset: 0 };
      
      // Should not throw an error
      const result = await resolvers.Query.searchTours(null, args);
      expect(result).toBeDefined();
    });

    it('should handle zero or negative pagination values', async () => {
      const args = { limit: 0, offset: -1 };
      
      const result = await resolvers.Query.searchTours(null, args);
      expect(result).toBeDefined();
    });
  });
});

// Additional unit tests for specific business logic
describe('searchTours Business Logic', () => {
  describe('Category Classification', () => {
    const testCases = [
      { title: 'Amazing Safari Adventure', expected: 'Wildlife Safari' },
      { title: 'Cultural Heritage Tour', expected: 'Cultural' },
      { title: 'Beach Paradise Getaway', expected: 'Beach & Coast' },
      { title: 'City Break in London', expected: 'City Break' },
      { title: 'Mountain Hiking Adventure', expected: 'Adventure' },
      { title: 'Regular Tour Package', expected: 'General' }
    ];

    testCases.forEach(({ title, expected }) => {
      it(`should classify "${title}" as "${expected}"`, () => {
        const mockTour = { title, description: '', destination: {} };
        const category = resolvers.Tour.category(mockTour);
        expect(category).toBe(expected);
      });
    });
  });

  describe('Feature Mapping', () => {
    const testCases = [
      { inclusions: ['Breakfast included', 'Lunch provided'], expected: ['Meals Included'] },
      { inclusions: ['Professional tour guide', 'Local guide'], expected: ['Professional Guide'] },
      { inclusions: ['Airport transfers', 'Transportation'], expected: ['Transportation'] },
      { inclusions: ['Hotel accommodation', 'Lodge stay'], expected: ['Accommodation'] },
      { inclusions: ['Free WiFi', 'Internet access'], expected: ['WiFi'] },
      { inclusions: ['Equipment provided', 'Gear rental'], expected: ['Equipment Provided'] }
    ];

    testCases.forEach(({ inclusions, expected }) => {
      it(`should map ${inclusions.join(', ')} to correct features`, () => {
        const mockTour = { inclusions };
        const features = resolvers.Tour.features(mockTour);
        expected.forEach(feature => {
          expect(features).toContain(feature);
        });
      });
    });
  });
});
