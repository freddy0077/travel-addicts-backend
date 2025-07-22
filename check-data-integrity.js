const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDataIntegrity() {
  console.log('🔍 Checking data integrity...');
  
  try {
    // Check all destinations and their countries
    const allDestinations = await prisma.destination.findMany({
      include: {
        country: true
      }
    });
    
    console.log(`📊 Total destinations: ${allDestinations.length}`);
    
    const destinationsWithNullCountry = allDestinations.filter(dest => !dest.country);
    console.log(`❌ Destinations with null country: ${destinationsWithNullCountry.length}`);
    
    if (destinationsWithNullCountry.length > 0) {
      console.log('❌ Found destinations with null country:');
      destinationsWithNullCountry.forEach(dest => {
        console.log(`  - ${dest.name} (ID: ${dest.id}, countryId: ${dest.countryId})`);
      });
      
      console.log('🔧 Fixing destinations with missing countries...');
      
      // Get Ghana country
      const ghana = await prisma.country.findFirst({
        where: { code: 'GH' }
      });
      
      if (ghana) {
        console.log(`✅ Found Ghana country: ${ghana.name} (ID: ${ghana.id})`);
        
        // Update destinations without country to use Ghana
        for (const dest of destinationsWithNullCountry) {
          await prisma.destination.update({
            where: { id: dest.id },
            data: { countryId: ghana.id }
          });
          console.log(`  ✅ Fixed ${dest.name} -> Ghana`);
        }
      } else {
        console.log('❌ Ghana country not found in database');
      }
    } else {
      console.log('✅ All destinations have valid countries!');
    }
    
    // Check for orphaned countryIds (countryId that doesn't exist)
    console.log('🔍 Checking for orphaned countryIds...');
    const countries = await prisma.country.findMany();
    const countryIds = countries.map(c => c.id);
    
    const orphanedDestinations = allDestinations.filter(dest => 
      dest.countryId && !countryIds.includes(dest.countryId)
    );
    
    console.log(`❌ Destinations with orphaned countryIds: ${orphanedDestinations.length}`);
    
    if (orphanedDestinations.length > 0) {
      console.log('❌ Found destinations with orphaned countryIds:');
      orphanedDestinations.forEach(dest => {
        console.log(`  - ${dest.name} (ID: ${dest.id}, countryId: ${dest.countryId})`);
      });
      
      // Get Ghana country
      const ghana = await prisma.country.findFirst({
        where: { code: 'GH' }
      });
      
      if (ghana) {
        console.log('🔧 Fixing orphaned countryIds...');
        for (const dest of orphanedDestinations) {
          await prisma.destination.update({
            where: { id: dest.id },
            data: { countryId: ghana.id }
          });
          console.log(`  ✅ Fixed ${dest.name} -> Ghana`);
        }
      }
    }
    
    console.log('✅ Data integrity check complete!');
    
  } catch (error) {
    console.error('❌ Error checking data integrity:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDataIntegrity();
