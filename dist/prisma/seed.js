"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
    // Create Ghana Country
    console.log('📍 Creating Ghana country...');
    const ghana = await prisma.country.create({
        data: {
            name: 'Ghana',
            code: 'GH',
            continent: 'Africa'
        }
    });
    // Create Admin Users
    console.log('👤 Creating admin users...');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@traveladdict.com',
            name: 'Travel Addict Admin',
            role: client_1.UserRole.SUPER_ADMIN,
            password: await bcryptjs_1.default.hash('admin123', 10),
            phone: '+233 24 123 4567'
        }
    });
    // Create Ghana Destinations
    console.log('🏛️ Creating Ghana destinations...');
    const accra = await prisma.destination.create({
        data: {
            name: 'Accra',
            slug: 'accra-ghana',
            countryId: ghana.id,
            type: 'City',
            season: 'All Year',
            description: 'Ghana\'s vibrant capital city, blending colonial history with modern African culture. Discover Independence Square, Kwame Nkrumah Memorial Park, bustling markets, and the historic Jamestown district.',
            highlights: ['Independence Square', 'Kwame Nkrumah Memorial Park', 'National Museum', 'Jamestown', 'Makola Market'],
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'],
            rating: 4.3,
            reviewCount: 89,
            priceFrom: 15000,
            duration: '1-3 days',
            bestTime: 'November - March',
            climate: 'Tropical savanna',
            activities: ['City Tours', 'Museums', 'Markets', 'Historical Sites', 'Cultural Experiences'],
            featured: true
        }
    });
    const capeCoast = await prisma.destination.create({
        data: {
            name: 'Cape Coast',
            slug: 'cape-coast-ghana',
            countryId: ghana.id,
            type: 'Historical',
            season: 'All Year',
            description: 'Historic coastal city home to Cape Coast Castle, a UNESCO World Heritage Site. Experience the profound history of the Atlantic slave trade.',
            highlights: ['Cape Coast Castle', 'UNESCO World Heritage', 'Slave Trade History', 'Coastal Views', 'Cultural Heritage'],
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'],
            rating: 4.8,
            reviewCount: 156,
            priceFrom: 18000,
            duration: '1-2 days',
            bestTime: 'November - March',
            climate: 'Tropical coastal',
            activities: ['Historical Tours', 'Castle Tours', 'Cultural Experiences', 'Beach Activities', 'Museums'],
            featured: true
        }
    });
    const kakumNationalPark = await prisma.destination.create({
        data: {
            name: 'Kakum National Park',
            slug: 'kakum-national-park',
            countryId: ghana.id,
            type: 'Nature',
            season: 'Dry Season',
            description: 'Famous for its canopy walkway suspended 40 meters above the tropical rainforest floor. Experience Ghana\'s rich biodiversity.',
            highlights: ['Canopy Walkway', 'Tropical Rainforest', 'Wildlife', 'Bird Watching', 'Nature Trails'],
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop'],
            rating: 4.9,
            reviewCount: 203,
            priceFrom: 25000,
            duration: '1-2 days',
            bestTime: 'November - April',
            climate: 'Tropical rainforest',
            activities: ['Canopy Walk', 'Nature Trails', 'Bird Watching', 'Wildlife Viewing', 'Photography'],
            featured: true
        }
    });
    const kumasi = await prisma.destination.create({
        data: {
            name: 'Kumasi',
            slug: 'kumasi-ghana',
            countryId: ghana.id,
            type: 'Cultural',
            season: 'All Year',
            description: 'The cultural heart of Ghana and seat of the Ashanti Kingdom. Explore Manhyia Palace Museum and vibrant Kejetia Market.',
            highlights: ['Manhyia Palace Museum', 'Kejetia Market', 'Ashanti Culture', 'Traditional Crafts', 'Kente Weaving'],
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'],
            rating: 4.4,
            reviewCount: 98,
            priceFrom: 14000,
            duration: '1-3 days',
            bestTime: 'November - March',
            climate: 'Tropical forest',
            activities: ['Cultural Tours', 'Palace Visits', 'Market Tours', 'Craft Workshops', 'Traditional Ceremonies'],
            featured: true
        }
    });
    const wliFalls = await prisma.destination.create({
        data: {
            name: 'Wli Waterfalls',
            slug: 'wli-waterfalls-volta',
            countryId: ghana.id,
            type: 'Nature',
            season: 'Wet Season',
            description: 'West Africa\'s tallest waterfall, cascading through lush tropical forest. Trek through pristine wilderness.',
            highlights: ['Tallest Waterfall in West Africa', 'Forest Trekking', 'Natural Pools', 'Bat Colony', 'Wildlife'],
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'],
            rating: 4.6,
            reviewCount: 87,
            priceFrom: 22000,
            duration: '1-2 days',
            bestTime: 'May - October',
            climate: 'Tropical forest',
            activities: ['Waterfall Trekking', 'Swimming', 'Wildlife Viewing', 'Photography', 'Nature Walks'],
            featured: true
        }
    });
    const busuaBeach = await prisma.destination.create({
        data: {
            name: 'Busua Beach',
            slug: 'busua-beach-western',
            countryId: ghana.id,
            type: 'Beach',
            season: 'Dry Season',
            description: 'Ghana\'s premier surf destination with excellent waves, beachside relaxation, and vibrant surfing community.',
            highlights: ['Surfing', 'Beach Relaxation', 'Seafood Dining', 'Surf Community', 'Coastal Beauty'],
            image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop'],
            rating: 4.4,
            reviewCount: 112,
            priceFrom: 28000,
            duration: '2-5 days',
            bestTime: 'November - April',
            climate: 'Tropical coastal',
            activities: ['Surfing', 'Beach Activities', 'Seafood Dining', 'Relaxation', 'Water Sports'],
            featured: true
        }
    });
    const moleNationalPark = await prisma.destination.create({
        data: {
            name: 'Mole National Park',
            slug: 'mole-national-park',
            countryId: ghana.id,
            type: 'Wildlife',
            season: 'Dry Season',
            description: 'Ghana\'s largest wildlife refuge, home to elephants, antelopes, baboons, and over 300 bird species.',
            highlights: ['Elephant Viewing', 'Safari Drives', 'Bird Watching', 'Wildlife Photography', 'African Savanna'],
            image: 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
            gallery: ['https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop'],
            rating: 4.8,
            reviewCount: 145,
            priceFrom: 45000,
            duration: '2-4 days',
            bestTime: 'November - April',
            climate: 'Tropical savanna',
            activities: ['Safari Drives', 'Wildlife Viewing', 'Bird Watching', 'Photography', 'Nature Walks'],
            featured: true
        }
    });
    console.log('🎯 Creating Ghana tour packages...');
    // Cape Coast Slave Route Tour
    const capeCoastSlaveTour = await prisma.tour.create({
        data: {
            title: 'Cape Coast Slave Route Historical Experience',
            slug: 'cape-coast-slave-route',
            destinationId: capeCoast.id,
            description: 'A deeply moving journey through the castles that served as the last African soil for millions of enslaved people. Walk through the dungeons, visit the Door of No Return, and participate in an ancestral reverence ceremony.',
            highlights: [
                'Cape Coast Castle guided tour',
                'Elmina Castle historical exploration',
                'Door of No Return ceremony',
                'West African Historical Museum visit',
                'Traditional fishing village interaction',
                'Ancestral reverence ceremony'
            ],
            inclusions: [
                'Expert historical guide',
                'Transportation between sites',
                'All castle entrance fees',
                'Museum admission',
                'Traditional lunch',
                'Ceremonial participation',
                'Hotel pickup and drop-off'
            ],
            exclusions: [
                'Personal expenses',
                'Additional meals',
                'Alcoholic beverages',
                'Tips and gratuities'
            ],
            duration: 1,
            groupSizeMax: 15,
            difficulty: client_1.DifficultyLevel.EASY,
            priceFrom: 18000,
            images: [
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    // Accra Heritage Tour
    const accraCityTour = await prisma.tour.create({
        data: {
            title: 'Accra Heritage & Culture Day Tour',
            slug: 'accra-heritage-culture-tour',
            destinationId: accra.id,
            description: 'Discover Ghana\'s capital through its most significant historical and cultural sites. Visit Independence Square, Kwame Nkrumah Memorial Park, National Museum, and the vibrant Jamestown district.',
            highlights: [
                'Independence Square and Black Star Gate',
                'Kwame Nkrumah Memorial Park and Mausoleum',
                'National Museum of Ghana',
                'Jamestown district and lighthouse',
                'Makola Market cultural experience',
                'Local lunch at traditional restaurant'
            ],
            inclusions: [
                'Professional tour guide',
                'Transportation in air-conditioned vehicle',
                'All entrance fees',
                'Traditional Ghanaian lunch',
                'Bottled water',
                'Hotel pickup and drop-off'
            ],
            exclusions: [
                'Personal expenses',
                'Tips and gratuities',
                'Alcoholic beverages',
                'Souvenirs'
            ],
            duration: 1,
            groupSizeMax: 12,
            difficulty: client_1.DifficultyLevel.EASY,
            priceFrom: 18000,
            images: [
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    // Kakum Canopy Walk Tour
    const kakumCanopyTour = await prisma.tour.create({
        data: {
            title: 'Kakum Canopy Walk & Rainforest Experience',
            slug: 'kakum-canopy-walk-rainforest',
            destinationId: kakumNationalPark.id,
            description: 'Experience Ghana\'s most famous canopy walkway, suspended 40 meters above the rainforest floor. Enjoy guided nature walks, bird watching, and learn about tropical rainforest conservation.',
            highlights: [
                'Canopy walkway adventure (40m high)',
                'Guided rainforest nature walk',
                'Bird watching with expert guide',
                'Tropical plant identification',
                'Conservation education',
                'Wildlife spotting opportunities'
            ],
            inclusions: [
                'Professional nature guide',
                'Transportation',
                'Park entrance fees',
                'Canopy walk access',
                'Nature walk',
                'Lunch',
                'Bottled water'
            ],
            exclusions: [
                'Personal expenses',
                'Tips',
                'Camera fees',
                'Additional snacks'
            ],
            duration: 1,
            groupSizeMax: 12,
            difficulty: client_1.DifficultyLevel.MODERATE,
            priceFrom: 32000,
            images: [
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    // Kumasi Cultural Tour
    const kumasiCulturalTour = await prisma.tour.create({
        data: {
            title: 'Kumasi Ashanti Kingdom Cultural Experience',
            slug: 'kumasi-ashanti-cultural-tour',
            destinationId: kumasi.id,
            description: 'Explore the cultural heart of Ghana and seat of the Ashanti Kingdom. Visit Manhyia Palace Museum, experience the vibrant Kejetia Market, and learn about traditional Ashanti crafts.',
            highlights: [
                'Manhyia Palace Museum tour',
                'Kejetia Market exploration',
                'Traditional Kente weaving demonstration',
                'Ashanti cultural center visit',
                'Local craft workshops',
                'Traditional Ashanti lunch'
            ],
            inclusions: [
                'Cultural guide',
                'Transportation',
                'Museum entrance fees',
                'Craft workshop participation',
                'Traditional lunch',
                'Hotel transfers'
            ],
            exclusions: [
                'Personal purchases',
                'Tips',
                'Additional meals',
                'Souvenirs'
            ],
            duration: 1,
            groupSizeMax: 15,
            difficulty: client_1.DifficultyLevel.EASY,
            priceFrom: 22000,
            images: [
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    // Wli Waterfalls Trek
    const wliWaterfallsTrek = await prisma.tour.create({
        data: {
            title: 'Wli Waterfalls Trek & Forest Adventure',
            slug: 'wli-waterfalls-trek-adventure',
            destinationId: wliFalls.id,
            description: 'Trek to West Africa\'s tallest waterfall through lush tropical forest. Experience pristine wilderness, natural pools, and possible bat colony sightings.',
            highlights: [
                'Trek to West Africa\'s tallest waterfall',
                'Lush tropical forest walk',
                'Natural swimming pools',
                'Bat colony viewing',
                'Wildlife spotting',
                'Traditional village visit'
            ],
            inclusions: [
                'Professional trekking guide',
                'Transportation',
                'Park entrance fees',
                'Lunch',
                'Bottled water',
                'First aid kit'
            ],
            exclusions: [
                'Personal gear',
                'Tips',
                'Additional snacks',
                'Photography fees'
            ],
            duration: 1,
            groupSizeMax: 10,
            difficulty: client_1.DifficultyLevel.MODERATE,
            priceFrom: 28000,
            images: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    // Busua Beach Surf Experience
    const busuaSurfTour = await prisma.tour.create({
        data: {
            title: 'Busua Beach Surf & Coastal Experience',
            slug: 'busua-beach-surf-coastal',
            destinationId: busuaBeach.id,
            description: 'Experience Ghana\'s premier surf destination with professional surf lessons, beachside relaxation, fresh seafood, and vibrant coastal community culture.',
            highlights: [
                'Professional surf lessons',
                'Beach relaxation time',
                'Fresh seafood lunch',
                'Coastal village tour',
                'Sunset beach walk',
                'Local fishing community interaction'
            ],
            inclusions: [
                'Surf instructor',
                'Surfboard rental',
                'Transportation',
                'Seafood lunch',
                'Beach activities',
                'Hotel transfers'
            ],
            exclusions: [
                'Personal gear',
                'Additional meals',
                'Alcoholic beverages',
                'Tips'
            ],
            duration: 2,
            groupSizeMax: 8,
            difficulty: client_1.DifficultyLevel.MODERATE,
            priceFrom: 45000,
            images: [
                'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    // Mole National Park Safari
    const moleSafariTour = await prisma.tour.create({
        data: {
            title: 'Mole National Park Safari Adventure',
            slug: 'mole-national-park-safari',
            destinationId: moleNationalPark.id,
            description: 'Experience authentic African safari in Ghana\'s largest national park. Encounter elephants, antelopes, baboons, and over 300 bird species in their natural habitat.',
            highlights: [
                'Game drive safari',
                'Elephant viewing at watering holes',
                'Bird watching expedition',
                'Walking safari with ranger',
                'Wildlife photography opportunities',
                'Sunset game drive'
            ],
            inclusions: [
                'Professional safari guide',
                '4x4 safari vehicle',
                'Park entrance fees',
                'All meals',
                'Accommodation (2 nights)',
                'Airport transfers'
            ],
            exclusions: [
                'International flights',
                'Personal expenses',
                'Tips',
                'Alcoholic beverages'
            ],
            duration: 3,
            groupSizeMax: 6,
            difficulty: client_1.DifficultyLevel.MODERATE,
            priceFrom: 85000,
            images: [
                'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop'
            ],
            featured: true,
            status: client_1.TourStatus.PUBLISHED
        }
    });
    console.log('📝 Creating tour itineraries...');
    // Cape Coast Slave Route Itinerary
    await prisma.tourItinerary.create({
        data: {
            tourId: capeCoastSlaveTour.id,
            dayNumber: 1,
            title: 'Cape Coast & Elmina Historical Journey',
            description: 'A deeply moving journey through the castles that served as the last African soil for millions of enslaved people. Walk through the dungeons, visit the Door of No Return, and participate in an ancestral reverence ceremony.',
            activities: [
                'Cape Coast Castle guided tour',
                'Elmina Castle historical exploration',
                'Door of No Return ceremony',
                'West African Historical Museum visit',
                'Traditional fishing village interaction',
                'Ancestral reverence ceremony'
            ],
            meals: ['Lunch'],
            accommodation: null
        }
    });
    console.log('✅ Ghana tourism database seeding completed successfully!');
    console.log(`📊 Created:
  - 1 Country (Ghana)
  - 8 Destinations
  - 7 Tour packages
  - 1 Admin user
  - Complete Ghana tourism ecosystem`);
}
main()
    .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
