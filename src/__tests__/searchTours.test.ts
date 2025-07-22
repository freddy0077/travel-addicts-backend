import { PrismaClient } from '@prisma/client';
import resolvers from '../graphql/resolvers';

// Mock data for testing
const mockTours = [
  {
    id: '1',
    title: 'Swiss Alps Adventure',
    slug: 'swiss-alps-adventure',
    destination: {
      id: '1',
      name: 'Swiss Alps',
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
    priceFrom: 520000, // 5200 GHS in pesewas
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
    priceFrom: 180000, // 1800 GHS in pesewas
    images: ['/api/placeholder/600/400'],
    featured: true,
    status: 'PUBLISHED',
    itinerary: [],
    pricing: [],
    reviews: [],
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    title: 'Safari Wildlife Adventure',
    slug: 'safari-wildlife-adventure',
    destination: {
      id: '3',
      name: 'Serengeti',
      country: {
        id: '3',
        name: 'Tanzania',
        code: 'TZ',
        continent: 'Africa'
      }
    },
    description: 'Experience the wild beauty of Africa on this amazing safari',
    highlights: ['Big Five', 'Migration', 'Camping under stars'],
    inclusions: ['All meals', 'Safari guide', '4WD vehicle'],
    exclusions: ['Flights', 'Travel insurance'],
    duration: 7,
    groupSizeMax: 6,
    difficulty: 'MODERATE',
    priceFrom: 350000, // 3500 GHS in pesewas
    images: ['/api/placeholder/600/400'],
    featured: false,
    status: 'PUBLISHED',
    itinerary: [],
    pricing: [],
    reviews: [
      { id: '3', rating: 5, title: 'Incredible!', content: 'Best safari ever', customer: { firstName: 'Mike', lastName: 'Johnson' }, createdAt: '2024-01-03' }
    ],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

describe('searchTours Resolver', () => {
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Create mock Prisma instance
    mockPrisma = {
      tour: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as any;

    // Mock Prisma responses
    mockPrisma.tour.findMany.mockResolvedValue(mockTours);
    mockPrisma.tour.count.mockResolvedValue(mockTours.length);
  });

  describe('Basic Search Functionality', () => {
    it('should return all tours when no filters are provided', async () => {
      const args = { limit: 10, offset: 0 };
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result).toEqual({
        tours: mockTours,
        totalCount: mockTours.length,
        hasMore: false
      });
      
      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith({
        where: { status: 'PUBLISHED' },
        include: expect.any(Object),
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ],
        skip: 0,
        take: 10
      });
    });

    it('should handle pagination correctly', async () => {
      const args = { limit: 2, offset: 1 };
      const paginatedTours = mockTours.slice(1, 3);
      
      mockPrisma.tour.findMany.mockResolvedValue(paginatedTours);
      
      const result = await resolvers.Query.searchTours(null, args);

      expect(result.hasMore).toBe(false); // 1 + 2 = 3, which equals total count
      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 1,
          take: 2
        })
      );
    });
  });

  describe('Text Search Filtering', () => {
    it('should filter tours by text query', async () => {
      const args = { query: 'Swiss', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'Swiss', mode: 'insensitive' } },
              { description: { contains: 'Swiss', mode: 'insensitive' } },
              { destination: { name: { contains: 'Swiss', mode: 'insensitive' } } }
            ]
          })
        })
      );
    });

    it('should handle empty query strings', async () => {
      const args = { query: '', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'PUBLISHED' }
        })
      );
    });
  });

  describe('Geographic Filtering', () => {
    it('should filter tours by continent', async () => {
      const args = { continent: 'Europe', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            destination: expect.objectContaining({
              country: expect.objectContaining({
                continent: 'Europe'
              })
            })
          })
        })
      );
    });

    it('should filter tours by country', async () => {
      const args = { country: 'Switzerland', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            destination: expect.objectContaining({
              country: expect.objectContaining({
                name: { contains: 'Switzerland', mode: 'insensitive' }
              })
            })
          })
        })
      );
    });

    it('should filter tours by destination', async () => {
      const args = { destination: 'Accra', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            destination: expect.objectContaining({
              name: { contains: 'Accra', mode: 'insensitive' }
            })
          })
        })
      );
    });
  });

  describe('Price Range Filtering', () => {
    it('should filter tours by minimum price', async () => {
      const args = { minPrice: 200000, limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priceFrom: expect.objectContaining({
              gte: 200000
            })
          })
        })
      );
    });

    it('should filter tours by maximum price', async () => {
      const args = { maxPrice: 400000, limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priceFrom: expect.objectContaining({
              lte: 400000
            })
          })
        })
      );
    });

    it('should filter tours by price range', async () => {
      const args = { minPrice: 200000, maxPrice: 400000, limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priceFrom: expect.objectContaining({
              gte: 200000,
              lte: 400000
            })
          })
        })
      );
    });
  });

  describe('Duration and Group Size Filtering', () => {
    it('should filter tours by duration', async () => {
      const args = { duration: '7', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            duration: 7
          })
        })
      );
    });

    it('should filter tours by group size (adults)', async () => {
      const args = { adults: 4, limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            groupSizeMax: expect.objectContaining({
              gte: 4
            })
          })
        })
      );
    });

    it('should filter tours by total travelers (adults + children)', async () => {
      const args = { adults: 3, children: 2, limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            groupSizeMax: expect.objectContaining({
              gte: 5 // 3 adults + 2 children
            })
          })
        })
      );
    });
  });

  describe('Category Filtering', () => {
    it('should filter tours by category', async () => {
      const args = { category: 'Adventure', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Adventure'
          })
        })
      );
    });
  });

  describe('Complex Filtering', () => {
    it('should handle multiple filters simultaneously', async () => {
      const args = {
        query: 'Alps',
        continent: 'Europe',
        minPrice: 300000,
        maxPrice: 600000,
        adults: 2,
        duration: '8',
        limit: 10,
        offset: 0
      };
      
      await resolvers.Query.searchTours(null, args);

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PUBLISHED',
            OR: [
              { title: { contains: 'Alps', mode: 'insensitive' } },
              { description: { contains: 'Alps', mode: 'insensitive' } },
              { destination: { name: { contains: 'Alps', mode: 'insensitive' } } }
            ],
            destination: expect.objectContaining({
              country: expect.objectContaining({
                continent: 'Europe'
              })
            }),
            priceFrom: expect.objectContaining({
              gte: 300000,
              lte: 600000
            }),
            duration: 8,
            groupSizeMax: expect.objectContaining({
              gte: 2
            })
          })
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.tour.findMany.mockRejectedValue(new Error('Database connection failed'));
      
      const args = { limit: 10, offset: 0 };
      
      await expect(resolvers.Query.searchTours(null, args)).rejects.toThrow('Database connection failed');
    });

    it('should handle invalid duration values', async () => {
      const args = { duration: 'invalid', limit: 10, offset: 0 };
      
      await resolvers.Query.searchTours(null, args);

      // Should not include duration filter when invalid
      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            duration: expect.anything()
          })
        })
      );
    });
  });

  describe('Field Resolvers', () => {
    it('should calculate rating correctly', () => {
      const tour = mockTours[0]; // Has 2 reviews with ratings 5 and 4
      const rating = resolvers.Tour.rating(tour);
      expect(rating).toBe(4.5); // (5 + 4) / 2
    });

    it('should return 0 rating for tours with no reviews', () => {
      const tour = mockTours[1]; // Has no reviews
      const rating = resolvers.Tour.rating(tour);
      expect(rating).toBe(0);
    });

    it('should calculate review count correctly', () => {
      const tour = mockTours[0]; // Has 2 reviews
      const reviewCount = resolvers.Tour.reviewCount(tour);
      expect(reviewCount).toBe(2);
    });

    it('should derive category from title keywords', () => {
      const tour = mockTours[0]; // Title contains "Adventure"
      const category = resolvers.Tour.category(tour);
      expect(category).toBe('Adventure');
    });

    it('should derive category from description keywords', () => {
      const tour = mockTours[1]; // Description contains "culture"
      const category = resolvers.Tour.category(tour);
      expect(category).toBe('Cultural');
    });

    it('should map inclusions to features correctly', () => {
      const tour = mockTours[0]; // Has "Meals", "Professional Guide", "Transportation"
      const features = resolvers.Tour.features(tour);
      expect(features).toContain('Meals Included');
      expect(features).toContain('Professional Guide');
      expect(features).toContain('Transportation');
    });

    it('should return year-round season as fallback', () => {
      const tour = { ...mockTours[0], destination: { ...mockTours[0].destination, season: undefined } };
      const season = resolvers.Tour.season(tour);
      expect(season).toBe('Year-round');
    });
  });
});
