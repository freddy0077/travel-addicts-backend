import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  console.log('👤 Creating new admin user...');
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'bookings@traveladdicts.org' }
    });

    if (existingUser) {
      console.log('⚠️  User bookings@traveladdicts.org already exists. Updating password...');
      
      // Update existing user with new password
      const updatedUser = await prisma.user.update({
        where: { email: 'bookings@traveladdicts.org' },
        data: {
          password: await bcrypt.hash('topman88', 10),
          role: UserRole.SUPER_ADMIN, // Ensure admin role
          name: 'Travel Addicts Bookings Admin'
        }
      });
      
      console.log('✅ Updated existing user:', {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role
      });
      
      return updatedUser;
    }

    // Create new admin user
    const newUser = await prisma.user.create({
      data: {
        email: 'bookings@traveladdicts.org',
        name: 'Travel Addicts Bookings Admin',
        role: UserRole.SUPER_ADMIN,
        password: await bcrypt.hash('topman88', 10),
        phone: '+233 24 000 0000', // Default phone number
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Created new admin user:', {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });

    return newUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting admin user seeding...');
  console.log('📧 Email: bookings@traveladdicts.org');
  console.log('🔑 Password: topman88');
  console.log('👑 Role: SUPER_ADMIN');
  console.log('');

  try {
    await createAdminUser();
    console.log('');
    console.log('🎉 Admin user seeding completed successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Email: bookings@traveladdicts.org');
    console.log('  Password: topman88');
    console.log('');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error during admin user seeding:', e);
      process.exit(1);
    });
}

export { createAdminUser };
