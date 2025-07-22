const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkAndUpdateAdminRole() {
  try {
    // Check current admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@traveladdict.com' }
    });

    if (adminUser) {
      console.log('Current admin user:', {
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role
      });

      // Update to SUPER_ADMIN if not already
      if (adminUser.role !== 'SUPER_ADMIN') {
        console.log('Updating admin role to SUPER_ADMIN...');
        await prisma.user.update({
          where: { email: 'admin@traveladdict.com' },
          data: { role: 'SUPER_ADMIN' }
        });
        console.log('Admin role updated successfully!');
      } else {
        console.log('Admin already has SUPER_ADMIN role');
      }
    } else {
      console.log('Admin user not found. Creating admin user...');
      
      // Create admin user with SUPER_ADMIN role
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@traveladdict.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      
      console.log('Admin user created with SUPER_ADMIN role!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndUpdateAdminRole();
