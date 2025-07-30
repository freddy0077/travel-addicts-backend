import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { paystackService } from '../services/paystack';
import { mediaService } from '../services/mediaService';

const prisma = new PrismaClient();

// GraphQL Context Type
interface Context {
  prisma: PrismaClient;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Authentication helper
interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

const generateToken = (user: any): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const payload = { id: user.id, email: user.email, role: user.role };
  const options = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
  
  return (jwt.sign as any)(payload, secret, options);
};

// GraphQL Resolvers
const resolvers = {
  Query: {
    // Authentication
    me: async (_: any, __: any, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      
      return await prisma.user.findUnique({
        where: { id: context.user.id }
      });
    },

    // Destinations
    destinations: async (_: any, { featured }: { featured?: boolean }) => {
      const where = featured !== undefined ? { featured } : {};
      
      return await prisma.destination.findMany({
        where,
        include: {
          country: true,
          tours: {
            where: { status: 'PUBLISHED' },
            select: { id: true }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    },

    destination: async (_: any, { id }: { id: string }) => {
      return await prisma.destination.findUnique({
        where: { id },
        include: {
          country: true,
          tours: {
            where: { status: 'PUBLISHED' },
            include: {
              reviews: {
                where: { status: 'APPROVED' },
                select: { rating: true }
              }
            }
          }
        }
      });
    },

    destinationBySlug: async (_: any, { slug }: { slug: string }) => {
      return await prisma.destination.findUnique({
        where: { slug },
        include: {
          country: true,
          tours: {
            where: { status: 'PUBLISHED' },
            include: {
              destination: true,
              reviews: true
            }
          }
        }
      });
    },

    searchDestinations: async (_: any, args: {
      query?: string;
      continent?: string;
      country?: string;
      type?: string;
      season?: string;
      minPrice?: number;
      maxPrice?: number;
      duration?: string;
      minRating?: number;
      features?: string[];
      limit?: number;
      offset?: number;
    }) => {
      const {
        query,
        continent,
        country,
        type,
        season,
        minPrice,
        maxPrice,
        duration,
        minRating,
        features,
        limit = 20,
        offset = 0
      } = args;

      // Build where clause
      const where: any = {};

      // Text search across name and description
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { 
            country: { 
              name: { contains: query, mode: 'insensitive' } 
            } 
          }
        ];
      }

      // Filter by continent
      if (continent) {
        where.country = {
          ...where.country,
          continent: { equals: continent, mode: 'insensitive' }
        };
      }

      // Filter by country
      if (country) {
        where.country = {
          ...where.country,
          name: { equals: country, mode: 'insensitive' }
        };
      }

      // Filter by type
      if (type) {
        where.type = { equals: type, mode: 'insensitive' };
      }

      // Filter by season
      if (season) {
        where.season = { equals: season, mode: 'insensitive' };
      }

      // Filter by price range
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.priceFrom = {};
        if (minPrice !== undefined) where.priceFrom.gte = minPrice;
        if (maxPrice !== undefined) where.priceFrom.lte = maxPrice;
      }

      // Filter by duration
      if (duration) {
        where.duration = { contains: duration, mode: 'insensitive' };
      }

      // Filter by rating
      if (minRating !== undefined) {
        where.rating = { gte: minRating };
      }

      // Filter by features/activities
      if (features && features.length > 0) {
        where.activities = {
          hasSome: features
        };
      }

      console.log('🔍 Searching destinations with filters:', where);

      // Execute search query
      const [destinations, totalCount] = await Promise.all([
        prisma.destination.findMany({
          where,
          include: {
            country: true
          },
          orderBy: [
            { featured: 'desc' },
            { rating: 'desc' },
            { createdAt: 'desc' }
          ],
          take: limit,
          skip: offset
        }),
        prisma.destination.count({ where })
      ]);

      console.log(`📍 Found ${destinations.length} destinations out of ${totalCount} total`);

      return {
        destinations,
        totalCount,
        hasMore: totalCount > offset + destinations.length
      };
    },

    // Tours
    tours: async (_: any, { destinationId, featured }: { destinationId?: string; featured?: boolean }, context: Context) => {
      const where: any = {};
      
      if (destinationId) {
        where.destinationId = destinationId;
      }
      
      if (featured !== undefined) {
        where.featured = featured;
      }

      return await prisma.tour.findMany({
        where,
        include: {
          destination: {
            include: {
              country: true
            }
          },
          itinerary: true,
          reviews: {
            include: {
              customer: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },

    tour: async (_: any, { id }: { id: string }) => {
      return await prisma.tour.findUnique({
        where: { id },
        include: {
          destination: {
            include: {
              country: true
            }
          },
          itinerary: {
            orderBy: { dayNumber: 'asc' }
          },
          reviews: {
            where: { status: 'APPROVED' },
            include: {
              customer: {
                select: { firstName: true, lastName: true }
              },
              user: {
                select: { name: true }
              }
            }
          }
        }
      });
    },

    tourBySlug: async (_: any, { slug }: { slug: string }) => {
      return await prisma.tour.findUnique({
        where: { slug },
        include: {
          destination: {
            include: {
              country: true
            }
          },
          itinerary: {
            orderBy: { dayNumber: 'asc' }
          },
          reviews: {
            where: { status: 'APPROVED' },
            include: {
              customer: {
                select: { firstName: true, lastName: true }
              },
              user: {
                select: { name: true }
              }
            }
          }
        }
      });
    },

    tourPricing: async (_: any, { tourId }: { tourId: string }) => {
      return await prisma.tourPricing.findMany({
        where: { tourId },
        orderBy: { season: 'asc' }
      });
    },

    searchTours: async (_: any, args: {
      query?: string;
      continent?: string;
      country?: string;
      destination?: string;
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      duration?: string;
      minRating?: number;
      features?: string[];
      season?: string;
      startDate?: string;
      endDate?: string;
      adults?: number;
      children?: number;
      limit?: number;
      offset?: number;
    }) => {
      const {
        query,
        continent,
        country,
        destination,
        category,
        minPrice,
        maxPrice,
        duration,
        minRating,
        features,
        season,
        startDate,
        endDate,
        adults,
        children,
        limit = 12,
        offset = 0
      } = args;

      // Build Prisma where clause
      const where: any = {
        status: 'PUBLISHED' // Only show published tours
      };

      // Text search across title, description, slug, and destination
      if (query && query.trim()) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { destination: { name: { contains: query, mode: 'insensitive' } } }
        ];
      }

      // Geographic filters
      if (continent) {
        where.destination = {
          ...where.destination,
          country: {
            ...where.destination?.country,
            continent: continent
          }
        };
      }

      if (country) {
        where.destination = {
          ...where.destination,
          country: {
            ...where.destination?.country,
            name: { contains: country, mode: 'insensitive' }
          }
        };
      }

      if (destination) {
        where.destination = {
          ...where.destination,
          name: { contains: destination, mode: 'insensitive' }
        };
      }

      // Category filter (assuming you have a category field)
      if (category) {
        where.category = category;
      }

      // Price range filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.priceFrom = {};
        if (minPrice !== undefined) {
          where.priceFrom.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.priceFrom.lte = maxPrice;
        }
      }

      // Duration filter
      if (duration) {
        // Convert duration string to number for comparison
        const durationDays = parseInt(duration);
        if (!isNaN(durationDays)) {
          where.duration = durationDays;
        }
      }

      // Group size filter based on adults and children
      if (adults !== undefined || children !== undefined) {
        const totalTravelers = (adults || 0) + (children || 0);
        where.groupSizeMax = {
          gte: totalTravelers
        };
      }

      // Get total count for pagination
      const totalCount = await prisma.tour.count({ where });

      // Fetch tours with filters
      let tours = await prisma.tour.findMany({
        where,
        include: {
          destination: {
            include: {
              country: true
            }
          },
          itinerary: true,
          reviews: {
            include: {
              customer: true
            }
          }
        },
        orderBy: [
          { featured: 'desc' }, // Featured tours first
          { createdAt: 'desc' }  // Then by creation date
        ],
        skip: offset,
        take: limit
      });

      // Apply additional filtering that's harder to do in Prisma
      if (minRating !== undefined) {
        tours = tours.filter(tour => {
          // Calculate average rating from reviews
          if (!tour.reviews || tour.reviews.length === 0) return false;
          const avgRating = tour.reviews.reduce((sum, review) => sum + review.rating, 0) / tour.reviews.length;
          return avgRating >= minRating;
        });
      }

      // Features filter (if you store features as JSON or array)
      if (features && features.length > 0) {
        tours = tours.filter(tour => {
          // Assuming features are stored in a JSON field or you have a relation
          // This is a simplified check - adjust based on your schema
          return features.some(feature => 
            tour.inclusions.some(inclusion => 
              inclusion.toLowerCase().includes(feature.toLowerCase())
            )
          );
        });
      }

      // Season filter (based on destination season or tour-specific season)
      if (season) {
        tours = tours.filter(tour => 
          tour.destination && tour.destination.season && 
          tour.destination.season.toLowerCase().includes(season.toLowerCase())
        );
      }

      // Date availability filter (simplified - in production you'd check actual availability)
      if (startDate || endDate) {
        tours = tours.filter(tour => {
          // For now, just check if it's a reasonable travel season
          // In production, you'd check actual availability calendar
          return true; // Placeholder - implement based on your availability system
        });
      }

      const hasMore = offset + tours.length < totalCount;

      return {
        tours,
        totalCount,
        hasMore
      };
    },

    // Blog Posts
    blogPosts: async (_: any, { status, featured }: { status?: string; featured?: boolean }) => {
      const where: any = {};
      if (status) where.status = status;
      if (featured !== undefined) where.featured = featured;

      return await prisma.blogPost.findMany({
        where,
        include: {
          author: {
            select: { name: true, email: true }
          },
          category: true
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    },

    blogPost: async (_: any, { id }: { id: string }) => {
      return await prisma.blogPost.findUnique({
        where: { id },
        include: {
          author: {
            select: { name: true, email: true }
          },
          category: true
        }
      });
    },

    // Bookings
    bookings: async (parent: any, { status }: { status?: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const whereClause = status ? { status: status as any } : {};
      
      return await context.prisma.booking.findMany({
        where: whereClause,
        include: {
          tour: {
            include: {
              destination: {
                include: {
                  country: true
                }
              }
            }
          },
          customer: true,
          user: true,
          travelers: true,
          payments: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },

    booking: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      return await prisma.booking.findUnique({
        where: { id },
        include: {
          tour: {
            include: {
              destination: {
                include: { country: true }
              },
              itinerary: {
                orderBy: { dayNumber: 'asc' }
              }
            }
          },
          customer: true,
          travelers: true,
          payments: true
        }
      });
    },

    // Analytics
    analytics: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      if (!['SUPER_ADMIN', 'CONTENT_MANAGER', 'MARKETING'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get total bookings and revenue
        const totalBookings = await prisma.booking.count({
          where: { status: { not: 'CANCELLED' } }
        });

        const totalRevenueResult = await prisma.booking.aggregate({
          where: { 
            status: { not: 'CANCELLED' },
            paymentStatus: 'PAID'
          },
          _sum: { totalPrice: true }
        });
        const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

        // Get total customers
        const totalCustomers = await prisma.customer.count();

        // Get this month's data
        const thisMonthBookings = await prisma.booking.count({
          where: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: startOfMonth }
          }
        });

        const thisMonthRevenueResult = await prisma.booking.aggregate({
          where: {
            status: { not: 'CANCELLED' },
            paymentStatus: 'PAID',
            createdAt: { gte: startOfMonth }
          },
          _sum: { totalPrice: true }
        });
        const thisMonthRevenue = thisMonthRevenueResult._sum.totalPrice || 0;

        const thisMonthCustomers = await prisma.customer.count({
          where: { createdAt: { gte: startOfMonth } }
        });

        // Get last month's data for growth calculation
        const lastMonthBookings = await prisma.booking.count({
          where: {
            status: { not: 'CANCELLED' },
            createdAt: { 
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          }
        });

        const lastMonthRevenueResult = await prisma.booking.aggregate({
          where: {
            status: { not: 'CANCELLED' },
            paymentStatus: 'PAID',
            createdAt: { 
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          },
          _sum: { totalPrice: true }
        });
        const lastMonthRevenue = lastMonthRevenueResult._sum.totalPrice || 1; // Avoid division by zero

        const lastMonthCustomers = await prisma.customer.count({
          where: {
            createdAt: { 
              gte: startOfLastMonth,
              lte: endOfLastMonth
            }
          }
        });

        // Calculate growth percentages
        const bookingsGrowth = lastMonthBookings > 0 
          ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
          : thisMonthBookings > 0 ? 100 : 0;

        const revenueGrowth = lastMonthRevenue > 0 
          ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
          : thisMonthRevenue > 0 ? 100 : 0;

        const customersGrowth = lastMonthCustomers > 0 
          ? ((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100 
          : thisMonthCustomers > 0 ? 100 : 0;

        // Calculate average booking value
        const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        // Get popular destinations with booking counts and revenue
        const popularDestinationsData = await prisma.booking.groupBy({
          by: ['tourId'],
          where: { status: { not: 'CANCELLED' } },
          _count: { id: true },
          _sum: { totalPrice: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5
        });

        const popularDestinations = await Promise.all(
          popularDestinationsData.map(async (item) => {
            const tour = await prisma.tour.findUnique({
              where: { id: item.tourId },
              include: { destination: true }
            });

            // Calculate real growth based on last month's data
            const lastMonthBookings = await prisma.booking.count({
              where: {
                tourId: item.tourId,
                status: { not: 'CANCELLED' },
                createdAt: { 
                  gte: startOfLastMonth,
                  lte: endOfLastMonth
                }
              }
            });

            const thisMonthBookings = await prisma.booking.count({
              where: {
                tourId: item.tourId,
                status: { not: 'CANCELLED' },
                createdAt: { gte: startOfMonth }
              }
            });

            const growth = lastMonthBookings > 0 
              ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100 
              : thisMonthBookings > 0 ? 100 : 0;
            
            return {
              id: tour?.destination?.id || '',
              name: tour?.destination?.name || 'Unknown',
              bookings: item._count.id,
              revenue: item._sum.totalPrice || 0,
              growth: Math.round(growth * 10) / 10 // Round to 1 decimal place
            };
          })
        );

        // Get recent bookings
        const recentBookings = await prisma.booking.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            tour: {
              include: {
                destination: {
                  include: { country: true }
                }
              }
            }
          }
        });

        // Get monthly stats for the last 6 months
        const monthlyStats: Array<{
          month: string;
          bookings: number;
          revenue: number;
          customers: number;
        }> = [];
        for (let i = 5; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

          const monthBookings = await prisma.booking.count({
            where: {
              status: { not: 'CANCELLED' },
              createdAt: { gte: monthStart, lte: monthEnd }
            }
          });

          const monthRevenueResult = await prisma.booking.aggregate({
            where: {
              status: { not: 'CANCELLED' },
              paymentStatus: 'PAID',
              createdAt: { gte: monthStart, lte: monthEnd }
            },
            _sum: { totalPrice: true }
          });

          const monthCustomers = await prisma.customer.count({
            where: {
              createdAt: { gte: monthStart, lte: monthEnd }
            }
          });

          monthlyStats.push({
            month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            bookings: monthBookings,
            revenue: monthRevenueResult._sum.totalPrice || 0,
            customers: monthCustomers
          });
        }

        // Get top performing tours
        const topPerformingToursData = await prisma.booking.groupBy({
          by: ['tourId'],
          where: { status: { not: 'CANCELLED' } },
          _count: { id: true },
          _sum: { totalPrice: true },
          orderBy: { _sum: { totalPrice: 'desc' } },
          take: 5
        });

        const topPerformingTours = await Promise.all(
          topPerformingToursData.map(async (item) => {
            const tour = await prisma.tour.findUnique({
              where: { id: item.tourId }
            });

            return {
              id: tour?.id || '',
              title: tour?.title || 'Unknown Tour',
              bookings: item._count.id,
              revenue: item._sum.totalPrice || 0,
              averageRating: 4.5 // Default rating since Tour model doesn't have rating field
            };
          })
        );

        // Get customer insights
        const newCustomersThisMonth = thisMonthCustomers;
        const returningCustomersResult = await prisma.booking.groupBy({
          by: ['customerId'],
          where: { status: { not: 'CANCELLED' } },
          _count: { id: true },
          having: { id: { _count: { gt: 1 } } }
        });
        const returningCustomers = returningCustomersResult.length;

        const averageCustomerValue = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

        // Get top nationalities (mock data for now)
        const topNationalities = [
          { nationality: 'Ghana', count: Math.round(totalCustomers * 0.6), percentage: 60.0 },
          { nationality: 'Nigeria', count: Math.round(totalCustomers * 0.15), percentage: 15.0 },
          { nationality: 'USA', count: Math.round(totalCustomers * 0.10), percentage: 10.0 },
          { nationality: 'UK', count: Math.round(totalCustomers * 0.08), percentage: 8.0 },
          { nationality: 'Germany', count: Math.round(totalCustomers * 0.07), percentage: 7.0 }
        ];

        return {
          totalBookings,
          totalRevenue,
          totalCustomers,
          conversionRate: 3.2, // Mock conversion rate
          averageBookingValue,
          monthlyGrowth: {
            bookings: Math.round(bookingsGrowth * 10) / 10,
            revenue: Math.round(revenueGrowth * 10) / 10,
            customers: Math.round(customersGrowth * 10) / 10
          },
          popularDestinations,
          recentBookings: recentBookings.map(booking => ({
            id: booking.id,
            customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
            tour: booking.tour,
            createdAt: booking.createdAt,
            status: booking.status,
            totalPrice: booking.totalPrice
          })),
          monthlyStats,
          topPerformingTours,
          customerInsights: {
            totalCustomers,
            newCustomersThisMonth,
            returningCustomers,
            averageCustomerValue,
            topNationalities
          }
        };
      } catch (error: any) {
        console.error('❌ Analytics query failed:', error);
        throw new Error(`Failed to fetch analytics: ${error?.message || 'Unknown error'}`);
      }
    },

    adminStats: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const [totalUsers, totalBookings, totalCustomers, totalRevenueResult] = await Promise.all([
          prisma.user.count(),
          prisma.booking.count({ where: { status: { not: 'CANCELLED' } } }),
          prisma.customer.count(),
          prisma.booking.aggregate({
            where: { 
              status: { not: 'CANCELLED' },
              paymentStatus: 'PAID'
            },
            _sum: { totalPrice: true }
          })
        ]);

        return {
          totalUsers,
          totalBookings,
          totalRevenue: totalRevenueResult._sum.totalPrice || 0,
          totalCustomers
        };
      } catch (error: any) {
        console.error('Error fetching admin stats:', error);
        throw new Error(`Failed to fetch admin stats: ${error?.message || 'Unknown error'}`);
      }
    },

    systemHealth: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN'].includes(context.user.role)) {
        throw new Error('Super admin access required');
      }

      try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        
        return {
          serverStatus: 'healthy',
          databaseStatus: 'connected',
          storageStatus: 'available'
        };
      } catch (error: any) {
        console.error('System health check failed:', error);
        return {
          serverStatus: 'degraded',
          databaseStatus: 'error',
          storageStatus: 'unknown'
        };
      }
    },

    userActivity: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        // For now, return recent bookings as user activity
        // In a real implementation, you'd have an audit log table
        const recentBookings = await prisma.booking.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: true,
            tour: true
          }
        });

        return recentBookings.map(booking => ({
          id: booking.id,
          userId: booking.customer.id,
          action: `Booked tour: ${booking.tour.title}`,
          timestamp: booking.createdAt
        }));
      } catch (error: any) {
        console.error('Error fetching user activity:', error);
        throw new Error(`Failed to fetch user activity: ${error?.message || 'Unknown error'}`);
      }
    },

    contentStats: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const [totalTours, totalDestinations, totalBlogPosts] = await Promise.all([
          prisma.tour.count(),
          prisma.destination.count(),
          prisma.blogPost.count()
        ]);

        return {
          totalTours,
          totalDestinations,
          totalBlogPosts
        };
      } catch (error: any) {
        console.error('Error fetching content stats:', error);
        throw new Error(`Failed to fetch content stats: ${error?.message || 'Unknown error'}`);
      }
    },

    financialSummary: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const [totalBookings, totalRevenueResult] = await Promise.all([
          prisma.booking.count({
            where: { status: { not: 'CANCELLED' } }
          }),
          prisma.booking.aggregate({
            where: { 
              status: { not: 'CANCELLED' },
              paymentStatus: 'PAID'
            },
            _sum: { totalPrice: true }
          })
        ]);

        const totalRevenue = totalRevenueResult._sum.totalPrice || 0;
        const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

        // Calculate conversion rate (mock for now)
        const conversionRate = 0.12; // 12% conversion rate

        return {
          totalRevenue,
          totalBookings,
          averageBookingValue,
          conversionRate
        };
      } catch (error: any) {
        console.error('Error fetching financial summary:', error);
        throw new Error(`Failed to fetch financial summary: ${error?.message || 'Unknown error'}`);
      }
    },

    performanceMetrics: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN'].includes(context.user.role)) {
        throw new Error('Super admin access required');
      }

      try {
        const startTime = Date.now();
        
        // Test database query performance
        await prisma.booking.count();
        const dbQueryTime = Date.now() - startTime;

        return {
          serverResponseTime: 45.2, // Mock server response time in ms
          databaseQueryTime: dbQueryTime,
          storageUsage: 67.8 // Mock storage usage percentage
        };
      } catch (error: any) {
        console.error('Error fetching performance metrics:', error);
        throw new Error(`Failed to fetch performance metrics: ${error?.message || 'Unknown error'}`);
      }
    },

    allUsers: async (_: any, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        return await prisma.user.findMany({
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' }
        });
      } catch (error: any) {
        console.error('Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error?.message || 'Unknown error'}`);
      }
    },

    userById: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        return await prisma.user.findUnique({
          where: { id }
        });
      } catch (error: any) {
        console.error('Error fetching user:', error);
        throw new Error(`Failed to fetch user: ${error?.message || 'Unknown error'}`);
      }
    },

    userStats: async (_: any, { userId }: { userId: string }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          throw new Error('User not found');
        }

        const [totalBookings, totalSpentResult] = await Promise.all([
          prisma.booking.count({
            where: { 
              userId: userId,
              status: { not: 'CANCELLED' }
            }
          }),
          prisma.booking.aggregate({
            where: { 
              userId: userId,
              status: { not: 'CANCELLED' },
              paymentStatus: 'PAID'
            },
            _sum: { totalPrice: true }
          })
        ]);

        return {
          totalBookings,
          totalSpent: totalSpentResult._sum.totalPrice || 0,
          joinDate: user.createdAt,
          lastActivity: user.updatedAt
        };
      } catch (error: any) {
        console.error('Error fetching user stats:', error);
        throw new Error(`Failed to fetch user stats: ${error?.message || 'Unknown error'}`);
      }
    },

    recentContent: async (_: any, __: any, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const [recentTours, recentDestinations, recentBlogPosts] = await Promise.all([
          prisma.tour.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              destination: {
                include: { country: true }
              }
            }
          }),
          prisma.destination.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { country: true }
          }),
          prisma.blogPost.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { author: true, category: true }
          })
        ]);

        return {
          recentTours,
          recentDestinations,
          recentBlogPosts
        };
      } catch (error: any) {
        console.error('Error fetching recent content:', error);
        throw new Error(`Failed to fetch recent content: ${error?.message || 'Unknown error'}`);
      }
    },

    contentByStatus: async (_: any, { status }: { status: string }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        // For now, return mock data since we don't have status fields on all content types
        return {
          published: 45,
          draft: 12,
          archived: 8
        };
      } catch (error: any) {
        console.error('Error fetching content by status:', error);
        throw new Error(`Failed to fetch content by status: ${error?.message || 'Unknown error'}`);
      }
    },

    mediaFiles: async (_: any, { limit = 50, offset = 0 }: { limit?: number; offset?: number }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        return await prisma.mediaFile.findMany({
          take: limit,
          skip: offset,
          orderBy: { createdAt: 'desc' }
        });
      } catch (error: any) {
        console.error('Error fetching media files:', error);
        throw new Error(`Failed to fetch media files: ${error?.message || 'Unknown error'}`);
      }
    },

    // Gallery Images
    galleryImages: async (_: any, { filters, limit = 50, offset = 0 }: any, context: Context) => {
      try {
        const where: any = {};

        if (filters) {
          if (filters.category) {
            where.category = filters.category;
          }
          if (filters.featured !== undefined) {
            where.featured = filters.featured;
          }
          if (filters.published !== undefined) {
            where.published = filters.published;
          }
          if (filters.tags && filters.tags.length > 0) {
            where.tags = {
              hasSome: filters.tags
            };
          }
          if (filters.search) {
            where.OR = [
              { title: { contains: filters.search, mode: 'insensitive' } },
              { description: { contains: filters.search, mode: 'insensitive' } },
              { location: { contains: filters.search, mode: 'insensitive' } },
              { photographer: { contains: filters.search, mode: 'insensitive' } }
            ];
          }
        }

        const galleryImages = await prisma.galleryImage.findMany({
          where,
          include: {
            uploadedBy: true
          },
          orderBy: [
            { featured: 'desc' },
            { sortOrder: 'asc' },
            { createdAt: 'desc' }
          ],
          take: limit,
          skip: offset
        });

        return galleryImages;
      } catch (error: any) {
        console.error('❌ Error fetching gallery images:', error);
        throw new Error(`Failed to fetch gallery images: ${error?.message || 'Unknown error'}`);
      }
    },

    galleryImage: async (_: any, { id }: any, context: Context) => {
      try {
        const galleryImage = await prisma.galleryImage.findUnique({
          where: { id },
          include: {
            uploadedBy: true
          }
        });

        if (!galleryImage) {
          throw new Error('Gallery image not found');
        }

        return galleryImage;
      } catch (error: any) {
        console.error('❌ Error fetching gallery image:', error);
        throw new Error(`Failed to fetch gallery image: ${error?.message || 'Unknown error'}`);
      }
    },
  },

  Mutation: {
    // Authentication
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.password) {
        throw new Error('Invalid credentials');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    },

    logout: () => {
      // In a stateless JWT setup, logout is handled client-side
      return true;
    },

    // Destinations
    createDestination: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      // Find or create country
      let country = await prisma.country.findFirst({
        where: { name: input.country }
      });

      if (!country) {
        // Create country if it doesn't exist
        country = await prisma.country.create({
          data: {
            name: input.country,
            code: input.country.substring(0, 2).toUpperCase(),
            continent: input.continent || 'Unknown'
          }
        });
      }

      const destination = await prisma.destination.create({
        data: {
          name: input.name,
          type: input.type,
          season: input.season,
          image: input.image,
          gallery: input.gallery || [],
          description: input.description,
          highlights: input.highlights || [],
          duration: input.duration,
          bestTime: input.bestTime,
          climate: input.climate,
          activities: input.activities || [],
          featured: input.featured || false,
          countryId: country.id,
          slug: input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          priceFrom: Math.round(input.priceFrom), // Store price as entered (no conversion to pesewas)
        },
        include: {
          country: true
        }
      });

      return destination;
    },

    updateDestination: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const updateData: any = { ...input };
      
      // Convert price to pesewas if provided
      if (input.priceFrom) {
        updateData.priceFrom = Math.round(input.priceFrom);
      }

      // Handle country relationship
      if (input.country && input.continent) {
        // Find or create the country
        let country = await prisma.country.findFirst({
          where: { name: input.country }
        });

        if (!country) {
          // Create new country if it doesn't exist
          country = await prisma.country.create({
            data: {
              name: input.country,
              code: input.country.substring(0, 2).toUpperCase(), // Simple code generation
              continent: input.continent
            }
          });
        } else if (country.continent !== input.continent) {
          // Update continent if it's different
          country = await prisma.country.update({
            where: { id: country.id },
            data: { continent: input.continent }
          });
        }

        // Use the country ID instead of the country name
        updateData.countryId = country.id;
        delete updateData.country;
        delete updateData.continent;
      }

      const destination = await prisma.destination.update({
        where: { id },
        data: updateData,
        include: {
          country: true
        }
      });

      return destination;
    },

    deleteDestination: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user || context.user.role !== 'SUPER_ADMIN') {
        throw new Error('Insufficient permissions');
      }

      // Check if destination has tours
      const toursCount = await prisma.tour.count({
        where: { destinationId: id }
      });

      if (toursCount > 0) {
        throw new Error('Cannot delete destination with existing tours');
      }

      await prisma.destination.delete({
        where: { id }
      });

      return true;
    },

    // Tours
    createTour: async (_: any, { input }: { input: any }, context: Context) => {
      // if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
      //   throw new Error('Insufficient permissions');
      // }

      const { itinerary, ...tourData } = input;

      const tour = await prisma.tour.create({
        data: {
          ...tourData,
          slug: input.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          priceFrom: Math.round(input.priceFrom), // Store price as entered (no conversion to pesewas)
        },
        include: {
          destination: {
            include: { country: true }
          }
        }
      });

      // Create itinerary if provided
      if (itinerary && itinerary.length > 0) {
        await prisma.tourItinerary.createMany({
          data: itinerary.map((day: any, index: number) => ({
            ...day,
            tourId: tour.id,
            dayNumber: index + 1
          }))
        });
      }

      return tour;
    },

    updateTour: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const updateData: any = { ...input, status: input.status || 'PUBLISHED' };
      
      // Convert price to pesewas if provided
      if (input.priceFrom) {
        updateData.priceFrom = Math.round(input.priceFrom);
      }

      // Handle destinationId field mapping for Prisma relation
      if (input.destinationId) {
        updateData.destination = {
          connect: { id: input.destinationId }
        };
        delete updateData.destinationId; // Remove the raw destinationId field
      }

      const tour = await prisma.tour.update({
        where: { id },
        data: updateData,
        include: {
          destination: {
            include: { country: true }
          },
          itinerary: {
            orderBy: { dayNumber: 'asc' }
          }
        }
      });

      return tour;
    },

    deleteTour: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user || context.user.role !== 'SUPER_ADMIN') {
        throw new Error('Insufficient permissions');
      }

      // Check if tour has bookings
      const bookingsCount = await prisma.booking.count({
        where: { tourId: id }
      });

      if (bookingsCount > 0) {
        throw new Error('Cannot delete tour with existing bookings');
      }

      await prisma.tour.delete({
        where: { id }
      });

      return true;
    },

    // Itinerary Management
    createTourItinerary: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Verify the tour exists
      const tour = await prisma.tour.findUnique({
        where: { id: input.tourId }
      });

      if (!tour) {
        throw new Error('Tour not found');
      }

      // Check if day number already exists for this tour
      const existingDay = await prisma.tourItinerary.findUnique({
        where: {
          tourId_dayNumber: {
            tourId: input.tourId,
            dayNumber: input.dayNumber
          }
        }
      });

      if (existingDay) {
        throw new Error(`Day ${input.dayNumber} already exists for this tour`);
      }

      return await prisma.tourItinerary.create({
        data: {
          tourId: input.tourId,
          dayNumber: input.dayNumber,
          title: input.title,
          description: input.description,
          meals: input.meals,
          accommodation: input.accommodation,
          activities: input.activities
        }
      });
    },

    updateTourItinerary: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Verify the itinerary exists
      const existingItinerary = await prisma.tourItinerary.findUnique({
        where: { id }
      });

      if (!existingItinerary) {
        throw new Error('Itinerary day not found');
      }

      // If updating day number, check for conflicts
      if (input.dayNumber && input.dayNumber !== existingItinerary.dayNumber) {
        const conflictingDay = await prisma.tourItinerary.findUnique({
          where: {
            tourId_dayNumber: {
              tourId: existingItinerary.tourId,
              dayNumber: input.dayNumber
            }
          }
        });

        if (conflictingDay) {
          throw new Error(`Day ${input.dayNumber} already exists for this tour`);
        }
      }

      return await prisma.tourItinerary.update({
        where: { id },
        data: {
          ...(input.dayNumber && { dayNumber: input.dayNumber }),
          ...(input.title && { title: input.title }),
          ...(input.description && { description: input.description }),
          ...(input.meals && { meals: input.meals }),
          ...(input.accommodation !== undefined && { accommodation: input.accommodation }),
          ...(input.activities && { activities: input.activities })
        }
      });
    },

    deleteTourItinerary: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Verify the itinerary exists
      const existingItinerary = await prisma.tourItinerary.findUnique({
        where: { id }
      });

      if (!existingItinerary) {
        throw new Error('Itinerary day not found');
      }

      await prisma.tourItinerary.delete({
        where: { id }
      });

      return true;
    },

    // Blog Posts
    createBlogPost: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER', 'MARKETING'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const blogPost = await prisma.blogPost.create({
        data: {
          ...input,
          authorId: context.user.id,
          slug: input.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          publishedAt: input.status === 'PUBLISHED' ? new Date() : null
        },
        include: {
          author: {
            select: { name: true, email: true }
          },
          category: true
        }
      });

      return blogPost;
    },

    updateBlogPost: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER', 'MARKETING'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const updateData: any = { ...input };
      
      // Set publishedAt when status changes to PUBLISHED
      if (input.status === 'PUBLISHED') {
        const existingPost = await prisma.blogPost.findUnique({
          where: { id },
          select: { publishedAt: true }
        });
        
        if (!existingPost?.publishedAt) {
          updateData.publishedAt = new Date();
        }
      }

      const blogPost = await prisma.blogPost.update({
        where: { id },
        data: updateData,
        include: {
          author: {
            select: { name: true, email: true }
          },
          category: true
        }
      });

      return blogPost;
    },

    deleteBlogPost: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      await prisma.blogPost.delete({
        where: { id }
      });

      return true;
    },

    // Booking Status Update
    updateBookingStatus: async (parent: any, { id, status }: { id: string; status: string }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SERVICE'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const booking = await prisma.booking.findUnique({
        where: { id }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      return await prisma.booking.update({
        where: { id },
        data: { status: status as any }, // Cast to avoid enum type issues
        include: {
          tour: {
            include: {
              destination: {
                include: {
                  country: true
                }
              }
            }
          },
          customer: true,
          user: true,
          travelers: true,
          payments: true
        }
      });
    },

    // Create Booking
    createBooking: async (_: any, { input }: { input: any }) => {
      try {
        // Generate unique booking reference
        const bookingReference = `TRA${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Verify tour exists and get pricing
        const tour = await prisma.tour.findUnique({
          where: { id: input.tourId },
          include: {
            destination: {
              include: {
                country: true
              }
            }
          }
        });

        if (!tour) {
          throw new Error('Tour not found');
        }

        // Check if customer already exists by email
        let customer = await prisma.customer.findUnique({
          where: { email: input.customer.email }
        });

        // Create customer if doesn't exist
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              email: input.customer.email,
              firstName: input.customer.firstName,
              lastName: input.customer.lastName,
              phone: input.customer.phone,
              dateOfBirth: input.customer.dateOfBirth || null,
              nationality: input.customer.nationality,
              passportNumber: input.customer.passportNumber || null,
              emergencyContact: input.customer.emergencyContact,
              dietaryRequirements: input.customer.dietaryRequirements || null,
              medicalConditions: input.customer.medicalConditions || null
            }
          });
        }

        // Create booking with travelers
        const booking = await prisma.booking.create({
          data: {
            bookingReference,
            tourId: input.tourId,
            customerId: customer.id,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            adultsCount: input.adultsCount,
            childrenCount: input.childrenCount,
            totalPrice: input.totalPrice,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            travelers: {
              create: input.travelers.map((traveler: any) => ({
                firstName: traveler.firstName,
                lastName: traveler.lastName,
                age: traveler.age,
                passportNumber: traveler.passportNumber,
                dietaryRequirements: traveler.dietaryRequirements
              }))
            }
          },
          include: {
            tour: {
              include: {
                destination: {
                  include: {
                    country: true
                  }
                }
              }
            },
            customer: true,
            travelers: true,
            payments: true
          }
        });

        // Create initial payment record
        await prisma.payment.create({
          data: {
            bookingId: booking.id,
            amount: input.totalPrice,
            paymentMethod: input.paymentMethod, // Fixed field name
            status: 'PENDING',
            paystackReference: `TXN${Date.now()}`, // Use correct field name
            currency: 'GHS'
          }
        });

        console.log(`✅ Booking created: ${bookingReference} for ${customer.firstName} ${customer.lastName}`);

        return booking;
      } catch (error: any) { // Properly type the error
        console.error('❌ Booking creation failed:', error);
        throw new Error(`Failed to create booking: ${error?.message || 'Unknown error'}`);
      }
    },

    // Cancel Booking
    cancelBooking: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Check if user has permission (admin roles)
      const allowedRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SERVICE'];
      if (!allowedRoles.includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      try {
        const booking = await prisma.booking.findUnique({
          where: { id },
          include: {
            tour: {
              include: {
                destination: {
                  include: {
                    country: true
                  }
                }
              }
            },
            customer: true,
            travelers: true,
            payments: true
          }
        });

        if (!booking) {
          throw new Error('Booking not found');
        }

        // Only allow admin or booking owner to cancel
        if (context.user.role !== 'SUPER_ADMIN' && context.user.role !== 'ADMIN' && booking.userId !== context.user.id) {
          throw new Error('Not authorized to cancel this booking');
        }

        // Update booking status to cancelled
        const updatedBooking = await prisma.booking.update({
          where: { id },
          data: {
            status: 'CANCELLED',
            updatedAt: new Date()
          },
          include: {
            tour: {
              include: {
                destination: {
                  include: { country: true }
                },
                itinerary: {
                  orderBy: { dayNumber: 'asc' }
                }
              }
            },
            customer: true,
            travelers: true,
            payments: true
          }
        });

        return updatedBooking;
      } catch (error: any) {
        console.error('Error cancelling booking:', error);
        throw new Error(`Failed to cancel booking: ${error.message}`);
      }
    },

    // Paystack Payment Initialization
    paystackInitialize: async (_: any, { input }: { input: any }) => {
      try {
        console.log('🔄 Initializing Paystack payment:', input);

        const response = await paystackService.initializeTransaction({
          email: input.email,
          amount: input.amount, // Amount should be in kobo
          currency: input.currency || 'GHS',
          reference: input.reference,
          callback_url: input.callback_url,
          metadata: input.metadata ? JSON.parse(input.metadata) : undefined
        });

        return {
          success: response.status,
          message: response.message,
          data: response.status ? {
            authorization_url: response.data.authorization_url,
            access_code: response.data.access_code,
            reference: response.data.reference
          } : null
        };
      } catch (error: any) {
        console.error('❌ Paystack initialization error:', error);
        return {
          success: false,
          message: error.message || 'Payment initialization failed',
          data: null
        };
      }
    },

    // Paystack Payment Verification
    paystackVerify: async (_: any, { reference }: { reference: string }) => {
      try {
        console.log('🔍 Verifying Paystack payment:', reference);

        const response = await paystackService.verifyTransaction(reference);

        return {
          success: response.status,
          message: response.message,
          data: response.status ? {
            reference: response.data.reference,
            amount: response.data.amount,
            status: response.data.status,
            gateway_response: response.data.gateway_response,
            paid_at: response.data.paid_at,
            created_at: response.data.created_at,
            channel: response.data.channel,
            currency: response.data.currency,
            customer: {
              id: response.data.customer.id,
              first_name: response.data.customer.first_name,
              last_name: response.data.customer.last_name,
              email: response.data.customer.email,
              phone: response.data.customer.phone
            }
          } : null
        };
      } catch (error: any) {
        console.error('❌ Paystack verification error:', error);
        return {
          success: false,
          message: error.message || 'Payment verification failed',
          data: null
        };
      }
    },

    // Media
    generatePresignedUploadUrl: async (_: any, { input }: { input: any }, context: Context) => {
      // if (!context.user) {
      //   throw new Error('Authentication required');
      // }

      const { filename, contentType, folder } = input;

      // Validate file type
      if (!mediaService.isValidImageType(contentType)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      try {
        // Generate folder path if not provided
        const folderPath = folder || mediaService.getFolderPath('general');

        const result = await mediaService.generatePresignedUploadUrl(
          filename,
          contentType,
          folderPath
        );

        return result;
      } catch (error) {
        console.error('Error generating presigned URL:', error);
        throw new Error('Failed to generate upload URL');
      }
    },

    createMediaFile: async (_: any, { input }: { input: any }, context: Context) => {
      // if (!context.user) {
      //   throw new Error('Authentication required');
      // }

      try {
        const mediaFile = await prisma.mediaFile.create({
          data: {
            filename: input.filename,
            originalName: input.originalName,
            filePath: input.url, // Store the full URL as filePath
            url: input.url,
            key: input.key,
            size: input.size,
            contentType: input.contentType,
            folder: input.folder,
          }
        });

        return mediaFile;
      } catch (error) {
        console.error('Error creating media file record:', error);
        throw new Error('Failed to create media file record');
      }
    },

    deleteMediaFile: async (_: any, { id }: { id: string }, context: Context) => {
      // if (!context.user) {
      //   throw new Error('Authentication required');
      // }

      try {
        // Get the media file record
        const mediaFile = await prisma.mediaFile.findUnique({
          where: { id }
        });

        if (!mediaFile) {
          throw new Error('Media file not found');
        }

        // Delete from S3
        if (mediaFile.key) {
          await mediaService.deleteFile(mediaFile.key);
        }

        // Delete from database
        await prisma.mediaFile.delete({
          where: { id }
        });

        return true;
      } catch (error) {
        console.error('Error deleting media file:', error);
        throw new Error('Failed to delete media file');
      }
    },

    serverUploadFile: async (_: any, { input }: { input: any }, context: Context) => {
      // if (!context.user) {
      //   throw new Error('Authentication required');
      // }

      const { filename, contentType, folder, fileData } = input;

      console.log('🔍 Server upload started:', { filename, contentType, folder, fileDataLength: fileData?.length });

      // Validate file type
      if (!mediaService.isValidImageType(contentType)) {
        console.error('❌ Invalid file type:', contentType);
        throw new Error('Invalid file type. Only images are allowed.');
      }

      try {
        // Decode base64 file data
        console.log('📝 Decoding base64 data...');
        const buffer = Buffer.from(fileData, 'base64');
        console.log('✅ Buffer created, size:', buffer.length);
        
        // Validate file size
        if (!mediaService.isValidFileSize(buffer.length)) {
          console.error('❌ File too large:', buffer.length);
          throw new Error('File size too large. Maximum size is 10MB.');
        }

        // Generate folder path if not provided
        const folderPath = folder || mediaService.getFolderPath('general');
        console.log('📁 Using folder path:', folderPath);

        // Upload file directly to S3
        console.log('☁️ Uploading to S3...');
        const uploadResult = await mediaService.uploadFile(
          buffer,
          filename,
          contentType,
          folderPath
        );
        console.log('✅ S3 upload successful:', uploadResult);

        // Create media file record in database
        console.log('💾 Creating database record...');
        const mediaFile = await prisma.mediaFile.create({
          data: {
            filename: uploadResult.filename,
            originalName: filename,
            filePath: uploadResult.url, // Store the full URL as filePath
            url: uploadResult.url,
            key: uploadResult.key,
            size: uploadResult.size,
            contentType: uploadResult.contentType,
            folder: folderPath,
          }
        });
        console.log('✅ Database record created:', mediaFile.id);

        return mediaFile;
      } catch (error: any) {
        console.error('💥 Error in server upload:', error);
        console.error('Error details:', {
          message: error?.message,
          stack: error?.stack,
          name: error?.name
        });
        throw new Error(`Failed to upload file: ${error?.message || 'Unknown error'}`);
      }
    },

    // Tour Pricing Mutations
    createTourPricing: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      // Convert prices to pesewas (multiply by 100)
      const data = {
        ...input,
        priceAdult: Math.round(input.priceAdult * 100),
        priceChild: Math.round(input.priceChild * 100),
      };

      return await prisma.tourPricing.create({
        data
      });
    },

    updateTourPricing: async (_: any, { id, input }: { id: string; input: any }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      const updateData: any = { ...input };

      // Convert prices to pesewas if provided
      if (input.priceAdult) {
        updateData.priceAdult = Math.round(input.priceAdult * 100);
      }
      if (input.priceChild) {
        updateData.priceChild = Math.round(input.priceChild * 100);
      }

      return await prisma.tourPricing.update({
        where: { id },
        data: updateData
      });
    },

    deleteTourPricing: async (_: any, { id }: { id: string }, context: Context) => {
      if (!context.user || !['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      await prisma.tourPricing.delete({
        where: { id }
      });

      return true;
    },
    // Create Manual Booking (Admin Only)
    createManualBooking: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Check if user has permission (admin roles)
      const allowedRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SERVICE'];
      if (!allowedRoles.includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      try {
        // Generate unique booking reference
        const bookingReference = `TRA${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Verify tour exists and get pricing
        const tour = await prisma.tour.findUnique({
          where: { id: input.tourId },
          include: {
            destination: {
              include: {
                country: true
              }
            }
          }
        });

        if (!tour) {
          throw new Error('Tour not found');
        }

        // Check if customer already exists by email
        let customer = await prisma.customer.findUnique({
          where: { email: input.customerDetails.email }
        });

        // Create customer if doesn't exist (simplified for manual bookings)
        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              email: input.customerDetails.email,
              firstName: input.customerDetails.firstName,
              lastName: input.customerDetails.lastName,
              phone: input.customerDetails.phone || '',
              // Set defaults for required fields
              dateOfBirth: null,
              nationality: null,
              passportNumber: null,
              emergencyContact: null,
              dietaryRequirements: null,
              medicalConditions: null
            }
          });
        }

        // Create booking without travelers (simplified for manual bookings)
        const booking = await prisma.booking.create({
          data: {
            bookingReference,
            tourId: input.tourId,
            customerId: customer.id,
            userId: context.user.id, // Associate with admin user who created it
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            adultsCount: input.adultsCount,
            childrenCount: input.childrenCount,
            totalPrice: input.totalPrice,
            status: input.status || 'PENDING',
            paymentStatus: input.paymentStatus || 'PENDING',
            specialRequests: input.specialRequests || null
          },
          include: {
            tour: {
              include: {
                destination: {
                  include: {
                    country: true
                  }
                }
              }
            },
            customer: true,
            travelers: true,
            payments: true,
            user: true
          }
        });

        // Create payment record with offline payment details
        const paymentData: any = {
          bookingId: booking.id,
          amount: input.paidAmount || input.totalPrice,
          paymentMethod: input.paymentMethod || 'BANK_TRANSFER',
          status: input.paymentStatus || 'PENDING',
          currency: 'GHS'
        };

        // Add offline payment specific fields
        if (input.paymentReference) {
          paymentData.paystackReference = input.paymentReference;
        } else {
          paymentData.paystackReference = `MANUAL${Date.now()}`;
        }

        // Add payment notes if provided
        if (input.paymentNotes) {
          paymentData.metadata = JSON.stringify({
            notes: input.paymentNotes,
            paymentDate: input.paymentDate,
            createdBy: context.user.email,
            isOfflinePayment: true
          });
        }

        await prisma.payment.create({
          data: paymentData
        });

        console.log(`✅ Manual booking created by admin ${context.user.email}: ${bookingReference} for ${customer.firstName} ${customer.lastName}`);
        console.log(`💰 Payment details: ${input.paymentMethod || 'BANK_TRANSFER'} - ${input.paidAmount || input.totalPrice} pesewas`);

        return booking;
      } catch (error: any) {
        console.error('❌ Manual booking creation failed:', error);
        throw new Error(`Failed to create manual booking: ${error?.message || 'Unknown error'}`);
      }
    },

    // Record Payment for Existing Booking (Admin Only)
    recordPayment: async (_: any, { input }: { input: any }, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      // Check if user has permission (admin roles)
      const allowedRoles = ['SUPER_ADMIN', 'CONTENT_MANAGER', 'CUSTOMER_SERVICE'];
      if (!allowedRoles.includes(context.user.role)) {
        throw new Error('Insufficient permissions');
      }

      try {
        // Verify booking exists
        const booking = await prisma.booking.findUnique({
          where: { id: input.bookingId },
          include: {
            payments: true,
            customer: true,
            tour: {
              include: {
                destination: true
              }
            }
          }
        });

        if (!booking) {
          throw new Error('Booking not found');
        }

        // Calculate total paid so far
        const totalPaid = booking.payments
          .filter(p => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);

        // Validate payment amount
        const remainingAmount = booking.totalPrice - totalPaid;
        if (input.amount > remainingAmount) {
          throw new Error(`Payment amount (${input.amount}) exceeds remaining balance (${remainingAmount})`);
        }

        // Create payment record
        const payment = await prisma.payment.create({
          data: {
            bookingId: input.bookingId,
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            status: 'PAID', // Offline payments are marked as paid when recorded
            currency: 'GHS',
            paystackReference: input.reference || `OFFLINE${Date.now()}`,
            metadata: JSON.stringify({
              notes: input.notes || '',
              paymentDate: input.paymentDate || new Date().toISOString(),
              recordedBy: context.user.email,
              isOfflinePayment: true
            })
          }
        });

        // Update booking payment status
        const newTotalPaid = totalPaid + input.amount;
        let newPaymentStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED' = 'PENDING';
        
        if (newTotalPaid >= booking.totalPrice) {
          newPaymentStatus = 'PAID';
        } else if (newTotalPaid > 0) {
          newPaymentStatus = 'PARTIALLY_PAID';
        }

        await prisma.booking.update({
          where: { id: input.bookingId },
          data: {
            paymentStatus: newPaymentStatus
          }
        });

        console.log(`✅ Payment recorded by admin ${context.user.email} for booking ${booking.bookingReference}`);
        console.log(`💰 Payment: ${input.paymentMethod} - ${input.amount} pesewas - New status: ${newPaymentStatus}`);

        return payment;
      } catch (error: any) {
        console.error('❌ Payment recording failed:', error);
        throw new Error(`Failed to record payment: ${error?.message || 'Unknown error'}`);
      }
    },

    // Gallery Images
    createGalleryImage: async (_: any, { input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      if (!['SUPER_ADMIN', 'CONTENT_MANAGER', 'MARKETING'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const galleryImage = await prisma.galleryImage.create({
          data: {
            ...input,
            uploadedById: context.user.id
          },
          include: {
            uploadedBy: true
          }
        });

        console.log(`✅ Gallery image created by admin ${context.user.email}: ${galleryImage.title}`);
        return galleryImage;
      } catch (error: any) {
        console.error('❌ Gallery image creation failed:', error);
        throw new Error(`Failed to create gallery image: ${error?.message || 'Unknown error'}`);
      }
    },

    updateGalleryImage: async (_: any, { id, input }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      if (!['SUPER_ADMIN', 'CONTENT_MANAGER', 'MARKETING'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const existingImage = await prisma.galleryImage.findUnique({
          where: { id }
        });

        if (!existingImage) {
          throw new Error('Gallery image not found');
        }

        const galleryImage = await prisma.galleryImage.update({
          where: { id },
          data: input,
          include: {
            uploadedBy: true
          }
        });

        console.log(`✅ Gallery image updated by admin ${context.user.email}: ${galleryImage.title}`);
        return galleryImage;
      } catch (error: any) {
        console.error('❌ Gallery image update failed:', error);
        throw new Error(`Failed to update gallery image: ${error?.message || 'Unknown error'}`);
      }
    },

    deleteGalleryImage: async (_: any, { id }: any, context: Context) => {
      if (!context.user) {
        throw new Error('Authentication required');
      }

      if (!['SUPER_ADMIN', 'CONTENT_MANAGER'].includes(context.user.role)) {
        throw new Error('Admin access required');
      }

      try {
        const existingImage = await prisma.galleryImage.findUnique({
          where: { id }
        });

        if (!existingImage) {
          throw new Error('Gallery image not found');
        }

        await prisma.galleryImage.delete({
          where: { id }
        });

        console.log(`✅ Gallery image deleted by admin ${context.user.email}: ${existingImage.title}`);
        return true;
      } catch (error: any) {
        console.error('❌ Gallery image deletion failed:', error);
        throw new Error(`Failed to delete gallery image: ${error?.message || 'Unknown error'}`);
      }
    },
    submitCustomBooking: async (_: any, { input }: { input: { name: string; email: string; phone?: string; destination: string; travelDates: string; travelers: number; budget: number; message: string; } }) => {
      try {
        console.log('Received custom booking request:', input);

        const customBooking = await prisma.customBooking.create({
          data: {
            name: input.name,
            email: input.email,
            phone: input.phone,
            destination: input.destination,
            travelDates: input.travelDates,
            travelers: input.travelers,
            budget: input.budget,
            message: input.message,
          },
        });

        console.log('Successfully saved custom booking:', customBooking.id);

        // Optional: Here you could trigger an email notification to the admin or user

        return {
          success: true,
          message: 'Your custom trip request has been submitted successfully. We will get back to you shortly!',
        };
      } catch (error) {
        console.error('Error submitting custom booking:', error);
        return {
          success: false,
          message: 'An error occurred while submitting your request. Please try again.',
        };
      }
    },
  },

  Tour: {
    // Computed field: category based on tour title/description
    category(parent: any) {
      const title = parent.title?.toLowerCase() || '';
      const description = parent.description?.toLowerCase() || '';
      
      if (title.includes('cultural') || title.includes('heritage') || title.includes('history') || 
          title.includes('slave') || title.includes('castle') || description.includes('cultural')) {
        return 'Cultural';
      }
      if (title.includes('beach') || title.includes('coast') || description.includes('beach')) {
        return 'Beach';
      }
      if (title.includes('nature') || title.includes('wildlife') || title.includes('park') || 
          title.includes('forest') || description.includes('nature')) {
        return 'Nature';
      }
      if (title.includes('adventure') || title.includes('hiking') || title.includes('expedition') || 
          description.includes('adventure')) {
        return 'Adventure';
      }
      if (title.includes('city') || title.includes('urban') || title.includes('market') || 
          description.includes('city')) {
        return 'City';
      }
      return 'Cultural'; // Default category
    },

    // Computed field: features based on inclusions
    features(parent: any) {
      const features: string[] = [];
      const inclusions = parent.inclusions || [];
      
      inclusions.forEach((inclusion: string) => {
        const lower = inclusion.toLowerCase();
        if (lower.includes('meal') || lower.includes('lunch') || lower.includes('breakfast')) {
          features.push('All Meals');
        }
        if (lower.includes('transport') || lower.includes('transfer') || lower.includes('pickup')) {
          features.push('Airport Transfers');
        }
        if (lower.includes('guide') || lower.includes('expert')) {
          features.push('Professional Guide');
        }
        if (lower.includes('accommodation') || lower.includes('hotel')) {
          features.push('Luxury Accommodation');
        }
        if (lower.includes('small') || lower.includes('intimate')) {
          features.push('Small Groups');
        }
      });
      
      // Remove duplicates and return unique features
      return [...new Set(features)];
    },

    // Computed field: season based on destination or tour-specific data
    season(parent: any) {
      if (parent.destination?.season) {
        return parent.destination.season;
      }
      // Default season logic based on tour type
      const title = parent.title?.toLowerCase() || '';
      if (title.includes('beach') || title.includes('coast')) {
        return 'Dry Season';
      }
      return 'All Year';
    },

    // Computed field: rating from reviews
    rating(parent: any) {
      if (!parent.reviews || parent.reviews.length === 0) {
        return 0;
      }
      const totalRating = parent.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      return Math.round((totalRating / parent.reviews.length) * 10) / 10; // Round to 1 decimal
    },

    // Computed field: review count
    reviewCount(parent: any) {
      return parent.reviews ? parent.reviews.length : 0;
    },

    // Provide empty pricing array for now (can be enhanced later)
    pricing() {
      return [];
    }
  }
};

export default resolvers;
