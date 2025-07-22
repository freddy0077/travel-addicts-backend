import { PrismaClient, GalleryCategory } from '@prisma/client';

const prisma = new PrismaClient();

const galleryImages = [
  {
    title: 'Serengeti Safari Experience',
    description: 'Witness the great migration and incredible wildlife in their natural habitat.',
    imageUrl: '/images/destinations/serengeti-migration.jpg',
    altText: 'Majestic African Safari with wildlife in the Serengeti',
    location: 'Serengeti National Park, Tanzania',
    category: GalleryCategory.WILDLIFE,
    tags: ['safari', 'wildlife', 'migration', 'nature', 'serengeti'],
    photographer: 'Travel Addicts Team',
    featured: true,
    published: true,
    sortOrder: 1
  },
  {
    title: 'Masai Mara Hot Air Balloon Safari',
    description: 'Experience the African savanna from above with breathtaking balloon safaris.',
    imageUrl: '/images/destinations/masai-mara-balloon.jpg',
    altText: 'Hot air balloon safari over Masai Mara landscape',
    location: 'Maasai Mara, Kenya',
    category: GalleryCategory.ACTIVITIES,
    tags: ['balloon', 'safari', 'masai mara', 'adventure', 'aerial'],
    photographer: 'Travel Addicts Team',
    featured: true,
    published: true,
    sortOrder: 2
  },
  {
    title: 'Cape Town Table Mountain',
    description: 'Iconic Table Mountain overlooking the beautiful city of Cape Town.',
    imageUrl: '/images/destinations/cape-town-table-mountain.jpg',
    altText: 'Table Mountain and Cape Town cityscape',
    location: 'Cape Town, South Africa',
    category: GalleryCategory.LANDSCAPES,
    tags: ['table mountain', 'cape town', 'landscape', 'city', 'south africa'],
    photographer: 'Travel Addicts Team',
    featured: false,
    published: true,
    sortOrder: 3
  },
  {
    title: 'Pristine Zanzibar Beach',
    description: 'Crystal clear waters and pristine beaches of the Zanzibar archipelago.',
    imageUrl: '/images/destinations/zanzibar-beach.jpg',
    altText: 'Beautiful Zanzibar beach with crystal clear waters',
    location: 'Zanzibar, Tanzania',
    category: GalleryCategory.LANDSCAPES,
    tags: ['beach', 'zanzibar', 'ocean', 'paradise', 'tanzania'],
    photographer: 'Travel Addicts Team',
    featured: true,
    published: true,
    sortOrder: 4
  },
  {
    title: 'Sahara Desert Morocco',
    description: 'The vast golden dunes of the Sahara Desert in Morocco.',
    imageUrl: '/images/destinations/sahara-desert-morocco.jpg',
    altText: 'Golden sand dunes of the Sahara Desert',
    location: 'Sahara Desert, Morocco',
    category: GalleryCategory.LANDSCAPES,
    tags: ['desert', 'sahara', 'morocco', 'dunes', 'adventure'],
    photographer: 'Travel Addicts Team',
    featured: false,
    published: true,
    sortOrder: 5
  },
  {
    title: 'Victoria Falls Wonder',
    description: 'One of the world\'s most spectacular waterfalls on the Zambezi River.',
    imageUrl: '/images/destinations/victoria-falls.jpg',
    altText: 'Magnificent Victoria Falls cascading down',
    location: 'Victoria Falls, Zambia/Zimbabwe',
    category: GalleryCategory.LANDSCAPES,
    tags: ['waterfall', 'victoria falls', 'zambezi', 'wonder', 'nature'],
    photographer: 'Travel Addicts Team',
    featured: true,
    published: true,
    sortOrder: 6
  },
  {
    title: 'Kilimanjaro Sunrise',
    description: 'Breathtaking sunrise over Mount Kilimanjaro, Africa\'s highest peak.',
    imageUrl: '/images/destinations/kilimanjaro-sunrise.jpg',
    altText: 'Stunning sunrise over Mount Kilimanjaro',
    location: 'Mount Kilimanjaro, Tanzania',
    category: GalleryCategory.LANDSCAPES,
    tags: ['kilimanjaro', 'mountain', 'sunrise', 'peak', 'tanzania'],
    photographer: 'Travel Addicts Team',
    featured: false,
    published: true,
    sortOrder: 7
  },
  {
    title: 'Kruger National Park Wildlife',
    description: 'Incredible wildlife encounters in one of Africa\'s premier game reserves.',
    imageUrl: '/images/destinations/kruger-national-park.jpg',
    altText: 'Wildlife in Kruger National Park',
    location: 'Kruger National Park, South Africa',
    category: GalleryCategory.WILDLIFE,
    tags: ['kruger', 'wildlife', 'game reserve', 'safari', 'south africa'],
    photographer: 'Travel Addicts Team',
    featured: false,
    published: true,
    sortOrder: 8
  },
  {
    title: 'Sossusvlei Red Dunes',
    description: 'The iconic red sand dunes of Sossusvlei in the Namib Desert.',
    imageUrl: '/images/destinations/sossusvlei-dunes.jpg',
    altText: 'Red sand dunes of Sossusvlei in Namibia',
    location: 'Sossusvlei, Namibia',
    category: GalleryCategory.LANDSCAPES,
    tags: ['sossusvlei', 'dunes', 'namibia', 'desert', 'red sand'],
    photographer: 'Travel Addicts Team',
    featured: false,
    published: true,
    sortOrder: 9
  },
  {
    title: 'Pyramids of Giza',
    description: 'The ancient wonders of the Pyramids of Giza standing majestically in Egypt.',
    imageUrl: '/images/destinations/pyramids-giza-egypt.jpg',
    altText: 'Ancient Pyramids of Giza in Egypt',
    location: 'Giza, Egypt',
    category: GalleryCategory.CULTURE,
    tags: ['pyramids', 'giza', 'egypt', 'ancient', 'wonder'],
    photographer: 'Travel Addicts Team',
    featured: true,
    published: true,
    sortOrder: 10
  }
];

async function seedGallery() {
  console.log('🌱 Seeding gallery images...');

  try {
    // Find or create a user to associate with the images
    let user = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'admin@traveladdicts.com',
          name: 'Travel Addicts Admin',
          role: 'SUPER_ADMIN',
          password: 'hashed_password_here' // In real app, this would be properly hashed
        }
      });
      console.log('✅ Created admin user for gallery images');
    }

    // Clear existing gallery images
    await prisma.galleryImage.deleteMany({});
    console.log('🗑️ Cleared existing gallery images');

    // Create gallery images
    for (const imageData of galleryImages) {
      await prisma.galleryImage.create({
        data: {
          ...imageData,
          uploadedById: user.id
        }
      });
    }

    console.log(`✅ Created ${galleryImages.length} gallery images`);
    console.log('🎉 Gallery seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding gallery:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedGallery()
    .catch((error) => {
      console.error('❌ Gallery seeding failed:', error);
      process.exit(1);
    });
}

export default seedGallery;
