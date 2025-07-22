#!/usr/bin/env node

/**
 * Standalone script to create the admin user: bookings@traveladdicts.org / topman88
 * Usage: node create-admin-user.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Travel Addicts - Admin User Creator');
console.log('=====================================');
console.log('');
console.log('Creating admin user with credentials:');
console.log('📧 Email: bookings@traveladdicts.org');
console.log('🔑 Password: topman88');
console.log('👑 Role: SUPER_ADMIN');
console.log('');

try {
  console.log('⏳ Running admin user seeder...');
  
  // Run the TypeScript seeder
  execSync('npm run db:seed:admin', { 
    stdio: 'inherit',
    cwd: __dirname 
  });
  
  console.log('');
  console.log('🎉 SUCCESS! Admin user created successfully!');
  console.log('');
  console.log('You can now login to the admin panel with:');
  console.log('  Email: bookings@traveladdicts.org');
  console.log('  Password: topman88');
  console.log('');
  console.log('Admin panel URL: http://localhost:3000/admin/login');
  console.log('Or production: http://traveladdicts.org/admin/login');
  
} catch (error) {
  console.error('');
  console.error('❌ ERROR: Failed to create admin user');
  console.error('');
  console.error('Error details:', error.message);
  console.error('');
  console.error('Troubleshooting:');
  console.error('1. Make sure the database is running');
  console.error('2. Check your DATABASE_URL in .env');
  console.error('3. Run: npm run db:generate');
  console.error('4. Run: npm run db:push');
  console.error('');
  process.exit(1);
}
