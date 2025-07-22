# Database Reset & Ghana Tourism Data Seeding Plan

## Overview
This plan outlines the process to reset the Travel Addicts database and populate it with authentic Ghanaian tourist destinations, tours, and supporting data to enable realistic testing of the search functionality.

## 🎯 Goals
- Reset database to clean state
- Seed with **20+ authentic Ghanaian tourist destinations**
- Create **30+ realistic tour packages**
- Include real images and accurate information
- Provide diverse data for comprehensive search testing

## 📋 Phase 1: Database Reset & Preparation

### 1.1 Reset Database
```bash
# Reset Prisma database
npx prisma migrate reset --force

# Generate fresh Prisma client
npx prisma generate

# Verify database is clean
npx prisma studio
```

### 1.2 Prepare Seed Infrastructure
- Create comprehensive seed script: `src/prisma/seed-ghana.ts`
- Set up image handling for destinations and tours
- Prepare data validation utilities

## 🇬🇭 Phase 2: Ghana Tourism Data Collection

### 2.1 Authentic Ghanaian Destinations (20+)

#### **Greater Accra Region**
1. **Accra City** - Capital city tours, Independence Square, National Museum
2. **Labadi Beach** - Popular beach destination with resorts
3. **Kokrobite Beach** - Surfing and beach culture
4. **Aburi Botanical Gardens** - Mountain gardens and nature walks
5. **Shai Hills** - Wildlife reserve and hiking trails

#### **Ashanti Region**  
6. **Kumasi** - Cultural capital, Manhyia Palace, Kejetia Market
7. **Lake Bosomtwe** - Sacred crater lake
8. **Bonwire** - Traditional Kente weaving village
9. **Ejisu** - Historical sites and traditional crafts

#### **Western Region**
10. **Cape Coast** - Historical slave castles and museums
11. **Elmina** - UNESCO World Heritage castle
12. **Kakum National Park** - Canopy walkway and rainforest
13. **Busua Beach** - Surfing and beach resort
14. **Ankasa Conservation Area** - Pristine rainforest

#### **Central Region**
15. **Cape Coast Castle** - UNESCO World Heritage site
16. **Elmina Castle** - Historical fortress
17. **Hans Cottage Botel** - Unique crocodile pond hotel

#### **Volta Region**
18. **Wli Waterfalls** - Highest waterfall in West Africa  
19. **Lake Volta** - Largest artificial lake in the world
20. **Tafi Atome Monkey Sanctuary** - Mona monkey conservation
21. **Mount Afadja** - Highest peak in Ghana

#### **Northern Regions**
22. **Mole National Park** - Elephant and wildlife safari
23. **Larabanga Mosque** - Ancient Sudanese-style mosque
24. **Paga Crocodile Pond** - Sacred crocodile sanctuary

### 2.2 Image Sources & Management
- **Unsplash API**: High-quality tourism photos
- **Local Tourism Board**: Official destination images  
- **Creative Commons**: Authentic Ghana photos
- **Placeholder Service**: Backup images during development

```javascript
// Image URL structure
const imageUrls = {
  destinations: `https://images.unsplash.com/photo-{id}?w=800&h=600&fit=crop`,
  tours: `https://images.unsplash.com/photo-{id}?w=600&h=400&fit=crop`,
  gallery: `https://images.unsplash.com/photo-{id}?w=400&h=300&fit=crop`
};
```

## 🎒 Phase 3: Tour Package Creation (30+)

### 3.1 Tour Categories & Packages

#### **Cultural & Historical Tours (8 tours)**
1. **Accra Heritage Walk** (2 days) - $180
2. **Cape Coast Slave Route** (3 days) - $320  
3. **Kumasi Royal Experience** (4 days) - $450
4. **Kente & Crafts Trail** (3 days) - $280
5. **Northern Ghana Cultural Safari** (7 days) - $850
6. **Ashanti Kingdom Discovery** (5 days) - $520
7. **Colonial History Tour** (4 days) - $380
8. **Traditional Villages Circuit** (6 days) - $680

#### **Nature & Wildlife Tours (8 tours)**
9. **Kakum Canopy Adventure** (2 days) - $220
10. **Mole Safari Experience** (4 days) - $480
11. **Wli Falls & Volta Region** (3 days) - $350
12. **Lake Bosomtwe Retreat** (3 days) - $290
13. **Ankasa Rainforest Trek** (5 days) - $580
14. **Shai Hills Wildlife Walk** (1 day) - $120
15. **Monkey Sanctuary & Falls** (2 days) - $240
16. **Volta Lake Cruise** (3 days) - $320

#### **Beach & Coastal Tours (6 tours)**
17. **Labadi Beach Resort** (3 days) - $380
18. **Busua Surf & Beach** (4 days) - $420
19. **Kokrobite Beach Culture** (2 days) - $180
20. **Cape Coast Beach & Castle** (3 days) - $350
21. **Western Coast Explorer** (5 days) - $550
22. **Coastal Fishing Villages** (4 days) - $380

#### **Adventure & Outdoor Tours (5 tours)**
23. **Mount Afadja Hiking** (2 days) - $280
24. **Volta Region Adventure** (6 days) - $720
25. **Northern Ghana Expedition** (8 days) - $950
26. **Multi-Region Discovery** (10 days) - $1200
27. **Ghana Grand Tour** (14 days) - $1800

#### **City & Urban Tours (3 tours)**
28. **Accra City Break** (2 days) - $200
29. **Kumasi Market & Culture** (2 days) - $180
30. **Tamale Northern Gateway** (3 days) - $320

### 3.2 Tour Details Structure
```typescript
interface TourData {
  title: string;
  slug: string;
  destination: string;
  description: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  duration: number; // days
  groupSizeMax: number;
  difficulty: 'EASY' | 'MODERATE' | 'CHALLENGING';
  priceFrom: number; // in pesewas (GHS * 100)
  images: string[];
  featured: boolean;
  category: string;
  season: string;
  bestTime: string;
}
```

## 🗄️ Phase 4: Supporting Data

### 4.1 Countries & Geographic Data
```typescript
const countries = [
  {
    name: 'Ghana',
    code: 'GH', 
    continent: 'Africa'
  }
];
```

### 4.2 User Accounts for Testing
- **Admin User**: Full system access
- **Content Manager**: Tour/destination management
- **Customer Users**: Booking and review testing

### 4.3 Sample Reviews & Ratings
- Generate 100+ authentic reviews
- Distribute ratings realistically (3.5-5.0 average)
- Include both positive and constructive feedback

## 🚀 Phase 5: Implementation Steps

### 5.1 Create Seed Script
```bash
# Create the main seeding script
touch src/prisma/seed-ghana.ts

# Create data files
mkdir src/prisma/data
touch src/prisma/data/destinations.ts
touch src/prisma/data/tours.ts
touch src/prisma/data/reviews.ts
```

### 5.2 Seed Script Structure
```typescript
// src/prisma/seed-ghana.ts
import { PrismaClient } from '@prisma/client';
import { destinations } from './data/destinations';
import { tours } from './data/tours';
import { reviews } from './data/reviews';

const prisma = new PrismaClient();

async function main() {
  console.log('🇬🇭 Seeding Ghana Tourism Database...');
  
  // 1. Reset database
  await resetDatabase();
  
  // 2. Seed countries
  await seedCountries();
  
  // 3. Seed destinations  
  await seedDestinations();
  
  // 4. Seed tours
  await seedTours();
  
  // 5. Seed users
  await seedUsers();
  
  // 6. Seed reviews
  await seedReviews();
  
  console.log('✅ Ghana Tourism Database seeded successfully!');
}
```

### 5.3 Execute Seeding
```bash
# Run the seeding script
npm run db:seed:ghana

# Verify data in Prisma Studio
npm run db:studio

# Test search functionality
npm test -- --testPathPattern=api
```

## 📊 Phase 6: Data Validation & Testing

### 6.1 Data Quality Checks
- ✅ All destinations have valid images
- ✅ Tours have realistic pricing (GHS 100-2000)
- ✅ Geographic data is accurate
- ✅ Descriptions are authentic and informative
- ✅ All required fields are populated

### 6.2 Search Functionality Testing
```bash
# Test all search parameters
npm test -- searchTours

# Test with real data
npm run test:integration

# Performance testing
npm run test:performance
```

### 6.3 Expected Results
- **20+ destinations** across all Ghana regions
- **30+ tour packages** in various categories  
- **100+ reviews** with realistic ratings
- **Full search functionality** working with real data
- **Performance benchmarks** under 500ms for most queries

## 🎯 Success Criteria

### ✅ Database Reset Complete
- [x] Clean database state
- [x] Fresh Prisma migrations applied
- [x] All test data removed

### ✅ Ghana Tourism Data Seeded
- [ ] 20+ authentic destinations with real images
- [ ] 30+ realistic tour packages
- [ ] Accurate geographic and cultural information
- [ ] Diverse price ranges (GHS 100-2000)
- [ ] Multiple difficulty levels and durations

### ✅ Search Functionality Verified
- [ ] Text search working across titles/descriptions
- [ ] Geographic filtering (regions, destinations)
- [ ] Price range filtering accurate
- [ ] Duration and group size filtering
- [ ] Rating and feature filtering
- [ ] Pagination and sorting working
- [ ] Performance under 500ms

### ✅ Data Quality Assured
- [ ] All images loading correctly
- [ ] Pricing in correct currency (GHS/pesewas)
- [ ] Descriptions authentic and informative
- [ ] No missing required fields
- [ ] Reviews and ratings realistic

## 📝 Next Steps After Completion

1. **Frontend Integration**: Update frontend to work with new data structure
2. **Image Optimization**: Implement image caching and optimization
3. **Performance Monitoring**: Set up query performance tracking
4. **Content Management**: Create admin interface for data management
5. **User Testing**: Conduct real user testing with authentic data

## 🛠️ Technical Notes

### Database Schema Considerations
- Ensure all Prisma models support the new data structure
- Add indexes for search performance
- Consider adding full-text search capabilities

### Image Management
- Implement image upload and storage system
- Add image optimization pipeline
- Consider CDN integration for better performance

### Data Maintenance
- Create scripts for regular data updates
- Implement data validation checks
- Set up automated backups

---

**Estimated Timeline**: 2-3 days for complete implementation
**Priority**: High - Required for realistic search testing
**Dependencies**: Prisma setup, image hosting solution

This plan ensures we have authentic, comprehensive Ghanaian tourism data that will enable thorough testing of our search functionality while providing a realistic user experience.
