import { DifficultyLevel, TourStatus } from '@prisma/client';

export const ghanaTours = [
  // Cultural & Historical Tours
  {
    title: 'Accra Heritage Walk',
    slug: 'accra-heritage-walk',
    destinationSlug: 'accra-ghana',
    description: 'Explore Ghana\'s capital city through its rich history and vibrant culture. Visit Independence Square, the National Museum, Kwame Nkrumah Mausoleum, and experience the bustling Makola Market.',
    highlights: [
      'Independence Square and Black Star Gate',
      'National Museum of Ghana',
      'Kwame Nkrumah Mausoleum and Memorial Park',
      'Makola Market cultural experience',
      'Arts Centre for local crafts',
      'Traditional Ga community visit'
    ],
    inclusions: [
      'Professional local guide',
      'All entrance fees',
      'Traditional lunch',
      'Transportation within Accra',
      'Cultural performance'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Alcoholic beverages'
    ],
    duration: 2,
    groupSizeMax: 12,
    difficulty: DifficultyLevel.EASY,
    priceFrom: 18000, // 180 GHS
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  {
    title: 'Cape Coast Slave Route Experience',
    slug: 'cape-coast-slave-route',
    destinationSlug: 'cape-coast',
    description: 'A profound historical journey through Ghana\'s role in the transatlantic slave trade. Visit Cape Coast and Elmina castles, walk through the Door of No Return, and learn about this important chapter in history.',
    highlights: [
      'Cape Coast Castle UNESCO World Heritage site',
      'Elmina Castle - oldest European building in sub-Saharan Africa',
      'Door of No Return experience',
      'West African Historical Museum',
      'Local fishing community visit',
      'Traditional Fante cultural experience'
    ],
    inclusions: [
      'Expert historical guide',
      'All castle entrance fees',
      'Traditional meals',
      'Comfortable transportation',
      'Accommodation (1 night)',
      'Cultural performances'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Additional meals'
    ],
    duration: 3,
    groupSizeMax: 15,
    difficulty: DifficultyLevel.EASY,
    priceFrom: 32000, // 320 GHS
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  {
    title: 'Kumasi Royal Experience',
    slug: 'kumasi-royal-experience',
    destinationSlug: 'kumasi-ashanti',
    description: 'Immerse yourself in the rich heritage of the Ashanti Kingdom. Visit the Manhyia Palace, explore the world\'s largest open-air market, and witness traditional Kente weaving.',
    highlights: [
      'Manhyia Palace - seat of the Ashanti King',
      'Kejetia Market exploration',
      'Traditional Kente weaving demonstration',
      'Ashanti cultural centre visit',
      'Royal Mausoleum at Breman',
      'Traditional Ashanti ceremony (if available)'
    ],
    inclusions: [
      'Cultural expert guide',
      'All entrance fees',
      'Traditional Ashanti meals',
      'Comfortable accommodation (3 nights)',
      'Airport transfers',
      'Kente cloth souvenir'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal shopping',
      'Additional activities'
    ],
    duration: 4,
    groupSizeMax: 10,
    difficulty: DifficultyLevel.EASY,
    priceFrom: 45000, // 450 GHS
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  // Nature & Wildlife Tours
  {
    title: 'Kakum Canopy Adventure',
    slug: 'kakum-canopy-adventure',
    destinationSlug: 'kakum-national-park',
    description: 'Experience Ghana\'s most famous canopy walkway, suspended 40 meters above the pristine rainforest. Explore diverse wildlife and learn about rainforest conservation.',
    highlights: [
      'Famous canopy walkway experience',
      'Guided rainforest nature walk',
      'Bird watching (300+ species)',
      'Butterfly sanctuary visit',
      'Forest elephant tracking',
      'Conservation education program'
    ],
    inclusions: [
      'Professional nature guide',
      'Park entrance fees',
      'Canopy walkway access',
      'Lunch in the forest',
      'Transportation from Cape Coast',
      'Binoculars for wildlife viewing'
    ],
    exclusions: [
      'Accommodation',
      'International flights',
      'Travel insurance',
      'Personal expenses'
    ],
    duration: 2,
    groupSizeMax: 8,
    difficulty: DifficultyLevel.MODERATE,
    priceFrom: 22000, // 220 GHS
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  {
    title: 'Mole Safari Experience',
    slug: 'mole-safari-experience',
    destinationSlug: 'mole-national-park',
    description: 'Ghana\'s premier wildlife safari experience. Encounter African elephants, antelopes, and diverse bird species in their natural savanna habitat.',
    highlights: [
      'African elephant encounters',
      'Walking safari with armed ranger',
      'Vehicle game drives',
      'Over 300 bird species',
      'Mole Motel wildlife viewing',
      'Traditional northern Ghana culture'
    ],
    inclusions: [
      'Professional safari guide',
      'Park entrance fees',
      'All game drives and walks',
      'Full board accommodation (3 nights)',
      'Transportation from Tamale',
      'Cultural village visit'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Alcoholic beverages',
      'Personal expenses'
    ],
    duration: 4,
    groupSizeMax: 6,
    difficulty: DifficultyLevel.MODERATE,
    priceFrom: 48000, // 480 GHS
    images: [
      'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  {
    title: 'Wli Falls & Volta Region Adventure',
    slug: 'wli-falls-volta-adventure',
    destinationSlug: 'wli-waterfalls',
    description: 'Discover West Africa\'s highest waterfall and explore the scenic Volta Region. Hike to the falls, swim in natural pools, and experience Ewe culture.',
    highlights: [
      'Wli Waterfalls - highest in West Africa',
      'Swimming in natural pools',
      'Hiking through tropical forest',
      'Traditional Ewe village visit',
      'Local craft workshops',
      'Scenic Volta Region landscapes'
    ],
    inclusions: [
      'Experienced hiking guide',
      'All entrance fees',
      'Traditional meals',
      'Comfortable accommodation (2 nights)',
      'Transportation',
      'Cultural performances'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal hiking gear',
      'Additional activities'
    ],
    duration: 3,
    groupSizeMax: 12,
    difficulty: DifficultyLevel.MODERATE,
    priceFrom: 35000, // 350 GHS
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  // Beach & Coastal Tours
  {
    title: 'Labadi Beach Resort Experience',
    slug: 'labadi-beach-resort',
    destinationSlug: 'labadi-beach-accra',
    description: 'Relax at Ghana\'s most popular beach destination. Enjoy golden sands, beach activities, local cuisine, and vibrant weekend entertainment.',
    highlights: [
      'Golden sandy beach relaxation',
      'Beach resort amenities',
      'Horse riding on the beach',
      'Local seafood dining',
      'Live music and entertainment',
      'Water sports activities'
    ],
    inclusions: [
      'Beach resort accommodation (2 nights)',
      'Daily breakfast',
      'Beach activities',
      'Airport transfers',
      'Welcome drink',
      'Beach equipment'
    ],
    exclusions: [
      'International flights',
      'Lunch and dinner',
      'Alcoholic beverages',
      'Spa treatments'
    ],
    duration: 3,
    groupSizeMax: 20,
    difficulty: DifficultyLevel.EASY,
    priceFrom: 38000, // 380 GHS
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  {
    title: 'Busua Surf & Beach Adventure',
    slug: 'busua-surf-beach',
    destinationSlug: 'busua-beach',
    description: 'Ghana\'s premier surfing destination with consistent waves and beautiful beaches. Perfect for surfers and beach lovers alike.',
    highlights: [
      'Professional surf lessons',
      'Consistent waves year-round',
      'Beautiful golden sand beaches',
      'Fresh seafood dining',
      'Beach bonfires and music',
      'Fort Metal Cross visit'
    ],
    inclusions: [
      'Surf lessons and board rental',
      'Beach accommodation (3 nights)',
      'Daily breakfast',
      'Airport transfers',
      'Surfboard and wetsuit',
      'Beach activities'
    ],
    exclusions: [
      'International flights',
      'Lunch and dinner',
      'Travel insurance',
      'Personal expenses'
    ],
    duration: 4,
    groupSizeMax: 8,
    difficulty: DifficultyLevel.MODERATE,
    priceFrom: 42000, // 420 GHS
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  // Adventure Tours
  {
    title: 'Northern Ghana Cultural Safari',
    slug: 'northern-ghana-safari',
    destinationSlug: 'mole-national-park',
    description: 'Explore Ghana\'s northern regions, combining wildlife safari with rich cultural experiences. Visit traditional villages and ancient mosques.',
    highlights: [
      'Mole National Park safari',
      'Larabanga Mosque visit',
      'Traditional village experiences',
      'Local craft workshops',
      'Cultural festivals (seasonal)',
      'Northern Ghana cuisine'
    ],
    inclusions: [
      'Expert cultural guide',
      'All accommodation (6 nights)',
      'Full board meals',
      'Transportation',
      'All entrance fees',
      'Cultural performances'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal shopping',
      'Alcoholic beverages'
    ],
    duration: 7,
    groupSizeMax: 10,
    difficulty: DifficultyLevel.MODERATE,
    priceFrom: 85000, // 850 GHS
    images: [
      'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  },

  {
    title: 'Ghana Grand Discovery Tour',
    slug: 'ghana-grand-tour',
    destinationSlug: 'accra-ghana',
    description: 'The ultimate Ghana experience covering all major regions. From Accra\'s urban culture to northern wildlife and coastal history.',
    highlights: [
      'Comprehensive Ghana experience',
      'All major destinations covered',
      'Cultural and historical sites',
      'Wildlife safari experience',
      'Beach and coastal exploration',
      'Traditional craft workshops'
    ],
    inclusions: [
      'Expert tour guide throughout',
      'All accommodation (13 nights)',
      'Full board meals',
      'Private transportation',
      'All entrance fees',
      'Cultural experiences and performances'
    ],
    exclusions: [
      'International flights',
      'Travel insurance',
      'Personal expenses',
      'Alcoholic beverages'
    ],
    duration: 14,
    groupSizeMax: 8,
    difficulty: DifficultyLevel.MODERATE,
    priceFrom: 180000, // 1800 GHS
    images: [
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=600&h=400&fit=crop'
    ],
    featured: true,
    status: TourStatus.PUBLISHED
  }
];
