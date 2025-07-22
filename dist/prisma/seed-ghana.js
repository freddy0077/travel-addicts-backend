"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const destinations_1 = require("./data/destinations");
const destinations_extended_1 = require("./data/destinations-extended");
const tours_1 = require("./data/tours");
const itineraries_1 = require("./data/itineraries");
const prisma = new client_1.PrismaClient();
async function resetDatabase() {
    console.log('🗑️  Resetting database...');
    // Delete all data in reverse dependency order
    await prisma.payment.deleteMany();
    await prisma.bookingTraveler.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.tourItinerary.deleteMany();
    await prisma.review.deleteMany();
    await prisma.tour.deleteMany();
    await prisma.destination.deleteMany();
    await prisma.country.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.user.deleteMany();
    await prisma.siteSetting.deleteMany();
    await prisma.blogCategory.deleteMany();
    console.log('✅ Database reset complete!');
}
async function main() {
    console.log('🌱 Starting Ghana tourism database seeding...');
    // Reset database first
    await resetDatabase();
    try {
        console.log('🇬🇭 Starting Ghana Tourism Database Seeding...');
        // Step 1: Create Ghana country
        console.log('📍 Creating Ghana country...');
        const ghana = await prisma.country.upsert({
            where: { code: 'GH' },
            update: {},
            create: {
                name: 'Ghana',
                code: 'GH',
                continent: 'Africa'
            }
        });
        console.log('✅ Ghana country created');
        // Step 2: Create destinations
        console.log('🏞️ Creating destinations...');
        const allDestinations = [...destinations_1.ghanaDestinations, ...destinations_extended_1.ghanaDestinationsExtended];
        const createdDestinations = new Map();
        for (const dest of allDestinations) {
            const destination = await prisma.destination.upsert({
                where: { slug: dest.slug },
                update: {},
                create: {
                    name: dest.name,
                    slug: dest.slug,
                    countryId: ghana.id,
                    type: dest.type,
                    season: dest.season,
                    description: dest.description,
                    highlights: dest.highlights,
                    image: dest.image,
                    gallery: dest.gallery,
                    rating: dest.rating,
                    reviewCount: dest.reviewCount,
                    priceFrom: dest.priceFrom,
                    duration: dest.duration,
                    bestTime: dest.bestTime,
                    climate: dest.climate,
                    activities: dest.activities,
                    featured: dest.featured
                }
            });
            createdDestinations.set(dest.slug, destination);
            console.log(`  ✅ Created destination: ${dest.name}`);
        }
        // Step 3: Create tours
        console.log('🎒 Creating tours...');
        for (const tour of tours_1.ghanaTours) {
            const destination = createdDestinations.get(tour.destinationSlug);
            if (!destination) {
                console.log(`  ⚠️ Destination not found for tour: ${tour.title}`);
                continue;
            }
            const createdTour = await prisma.tour.upsert({
                where: { slug: tour.slug },
                update: {},
                create: {
                    title: tour.title,
                    slug: tour.slug,
                    destinationId: destination.id,
                    description: tour.description,
                    highlights: tour.highlights,
                    inclusions: tour.inclusions,
                    exclusions: tour.exclusions,
                    duration: tour.duration,
                    groupSizeMax: tour.groupSizeMax,
                    difficulty: tour.difficulty,
                    priceFrom: tour.priceFrom,
                    images: tour.images,
                    featured: tour.featured,
                    status: tour.status
                }
            });
            console.log(`  ✅ Created tour: ${tour.title}`);
            // Create itinerary records for the tour
            const tourItinerary = itineraries_1.tourItineraries.find(itinerary => itinerary.tourSlug === tour.slug);
            if (tourItinerary) {
                for (const day of tourItinerary.days) {
                    await prisma.tourItinerary.create({
                        data: {
                            tourId: createdTour.id,
                            dayNumber: day.day,
                            title: `Day ${day.day}`,
                            description: day.description,
                            activities: day.activities,
                            accommodation: day.accommodations,
                            meals: day.meals
                        }
                    });
                }
                console.log(`  ✅ Created ${tourItinerary.days.length} itinerary days for: ${tour.title}`);
            }
        }
        // Step 4: Create sample users
        console.log('👥 Creating sample users...');
        // Hash password for admin user
        const hashedPassword = await bcryptjs_1.default.hash('admin123', 12);
        // Admin user
        await prisma.user.upsert({
            where: { email: 'admin@traveladdict.com' },
            update: {},
            create: {
                email: 'admin@traveladdict.com',
                name: 'Travel Addicts Admin',
                role: 'SUPER_ADMIN',
                password: hashedPassword
            }
        });
        // Content manager
        const hashedPasswordContent = await bcryptjs_1.default.hash('admin123', 12);
        await prisma.user.upsert({
            where: { email: 'content@traveladdicts.com' },
            update: {},
            create: {
                email: 'content@traveladdicts.com',
                name: 'Content Manager',
                role: 'CONTENT_MANAGER',
                password: hashedPasswordContent
            }
        });
        // Sample customers
        const customers = [
            { email: 'kwame.asante@email.com', name: 'Kwame Asante' },
            { email: 'ama.osei@email.com', name: 'Ama Osei' },
            { email: 'john.smith@email.com', name: 'John Smith' },
            { email: 'sarah.johnson@email.com', name: 'Sarah Johnson' },
            { email: 'david.brown@email.com', name: 'David Brown' }
        ];
        for (const customer of customers) {
            const hashedPasswordCustomer = await bcryptjs_1.default.hash('admin123', 12);
            await prisma.user.upsert({
                where: { email: customer.email },
                update: {},
                create: {
                    email: customer.email,
                    name: customer.name,
                    role: 'CUSTOMER',
                    password: hashedPasswordCustomer
                }
            });
        }
        console.log('✅ Sample users created');
        // Step 5: Create sample reviews
        console.log('⭐ Creating sample reviews...');
        const tours = await prisma.tour.findMany();
        const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
        const sampleReviews = [
            {
                rating: 5,
                title: 'Amazing Cultural Experience!',
                content: 'This tour exceeded all my expectations. The guide was knowledgeable and the cultural sites were breathtaking. Highly recommended for anyone wanting to understand Ghana\'s rich heritage.'
            },
            {
                rating: 4,
                title: 'Great Adventure',
                content: 'Wonderful experience exploring Ghana\'s natural beauty. The canopy walk was thrilling and the wildlife viewing was incredible. Well organized tour.'
            },
            {
                rating: 5,
                title: 'Perfect Beach Getaway',
                content: 'Beautiful beaches, great surfing conditions, and excellent local food. The perfect way to relax and enjoy Ghana\'s coastal beauty.'
            },
            {
                rating: 4,
                title: 'Educational and Moving',
                content: 'The historical sites were powerful and educational. Our guide provided excellent context and made the experience very meaningful.'
            },
            {
                rating: 5,
                title: 'Wildlife Safari Excellence',
                content: 'Saw elephants up close and many other animals. The park is well maintained and the guides are very professional. A must-do experience in Ghana.'
            },
            {
                rating: 4,
                title: 'Cultural Immersion',
                content: 'Loved learning about traditional crafts and meeting local artisans. The Kente weaving demonstration was fascinating.'
            }
        ];
        // Create reviews for tours
        for (let i = 0; i < Math.min(tours.length, 20); i++) {
            const tour = tours[i];
            const numReviews = Math.floor(Math.random() * 4) + 1; // 1-4 reviews per tour
            for (let j = 0; j < numReviews; j++) {
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomReview = sampleReviews[Math.floor(Math.random() * sampleReviews.length)];
                await prisma.review.create({
                    data: {
                        tourId: tour.id,
                        userId: randomUser.id,
                        rating: randomReview.rating,
                        title: randomReview.title,
                        content: randomReview.content,
                        status: 'APPROVED'
                    }
                });
            }
        }
        console.log('✅ Sample reviews created');
        // Step 6: Update destination and tour statistics
        console.log('📊 Updating statistics...');
        // Update tour statistics based on reviews
        for (const tour of tours) {
            const reviews = await prisma.review.findMany({
                where: { tourId: tour.id, status: 'APPROVED' }
            });
            if (reviews.length > 0) {
                const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
                await prisma.tour.update({
                    where: { id: tour.id },
                    data: {
                    // Note: rating and reviewCount are computed fields in resolvers
                    // but we could store them here if needed for performance
                    }
                });
            }
        }
        console.log('✅ Statistics updated');
        // Step 7: Display summary
        const destinationCount = await prisma.destination.count();
        const tourCount = await prisma.tour.count();
        const userCount = await prisma.user.count();
        const reviewCount = await prisma.review.count();
        console.log('\n🎉 Ghana Tourism Database Seeding Complete!');
        console.log('📈 Summary:');
        console.log(`  🏞️ Destinations: ${destinationCount}`);
        console.log(`  🎒 Tours: ${tourCount}`);
        console.log(`  👥 Users: ${userCount}`);
        console.log(`  ⭐ Reviews: ${reviewCount}`);
        console.log('\n🚀 Ready for testing with authentic Ghana tourism data!');
    }
    catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
