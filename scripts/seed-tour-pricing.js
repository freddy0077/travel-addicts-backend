const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedTourPricing() {
  try {
    console.log('🌱 Starting tour pricing seed...');

    // Get all tours
    const tours = await prisma.tour.findMany({
      select: { id: true, title: true }
    });

    console.log(`Found ${tours.length} tours to add pricing for`);

    for (const tour of tours) {
      console.log(`Adding pricing for: ${tour.title}`);

      // Create Low Season pricing
      await prisma.tourPricing.create({
        data: {
          tourId: tour.id,
          season: 'Low',
          priceAdult: 45000, // GH₵450 in pesewas
          priceChild: 27000, // GH₵270 in pesewas
          availableDates: [
            '2024-03-15',
            '2024-03-22',
            '2024-03-29',
            '2024-04-05',
            '2024-04-12',
            '2024-04-19',
            '2024-04-26',
            '2024-05-03'
          ],
          maxCapacity: 20
        }
      });

      // Create High Season pricing
      await prisma.tourPricing.create({
        data: {
          tourId: tour.id,
          season: 'High',
          priceAdult: 65000, // GH₵650 in pesewas
          priceChild: 39000, // GH₵390 in pesewas
          availableDates: [
            '2024-06-01',
            '2024-06-08',
            '2024-06-15',
            '2024-06-22',
            '2024-06-29',
            '2024-07-06',
            '2024-07-13',
            '2024-07-20',
            '2024-07-27',
            '2024-08-03',
            '2024-08-10',
            '2024-08-17'
          ],
          maxCapacity: 15
        }
      });

      // Create Peak Season pricing
      await prisma.tourPricing.create({
        data: {
          tourId: tour.id,
          season: 'Peak',
          priceAdult: 85000, // GH₵850 in pesewas
          priceChild: 51000, // GH₵510 in pesewas
          availableDates: [
            '2024-12-20',
            '2024-12-23',
            '2024-12-27',
            '2024-12-30',
            '2025-01-02',
            '2025-01-06',
            '2025-01-10',
            '2025-01-13',
            '2025-01-17',
            '2025-01-20'
          ],
          maxCapacity: 12
        }
      });

      console.log(`✅ Added 3 pricing tiers for: ${tour.title}`);
    }

    console.log('🎉 Tour pricing seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding tour pricing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedTourPricing();
