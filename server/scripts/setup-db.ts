#!/usr/bin/env ts-node
// Database setup script for Docker
// This script runs database migrations and setup

import { AppDataSource, initializeTypeORM, closeTypeORM } from '@/config/typeorm.config';
import { DatabaseSetup } from '@/database/setup';

async function setupDatabase() {
  try {
    console.log('🔄 Starting database setup...');
    
    // Initialize TypeORM
    await initializeTypeORM();
    console.log('✅ TypeORM initialized');
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    await DatabaseSetup.runMigration();
    console.log('✅ Database migrations completed');
    
    // Check if we should seed the database
    if (process.env.SEED_DATABASE === 'true') {
      console.log('🌱 Seeding database...');
      await DatabaseSetup.runSeed();
      console.log('✅ Database seeded');
    }
    
    console.log('✅ Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    // Close TypeORM connection
    await closeTypeORM();
  }
}

// Run the setup process
setupDatabase();
