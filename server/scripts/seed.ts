#!/usr/bin/env ts-node
// Database seeding script runner
// This script can be run with: npm run seed

import { AppDataSource, initializeTypeORM, closeTypeORM } from '@/config/typeorm.config';
import { seedDatabase } from '@/database/seed';

async function main() {
  try {
    console.log('🚀 Starting database seeding process...');
    
    // Initialize TypeORM
    await initializeTypeORM();
    
    // Run seeding
    await seedDatabase();
    
    console.log('✅ Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    // Close TypeORM connection
    await closeTypeORM();
  }
}

// Run the seeding process
main();
