#!/usr/bin/env ts-node
// Database clearing script
// This script can be run with: npm run clear-db

import { AppDataSource, initializeTypeORM, closeTypeORM } from '@/config/typeorm.config';

async function clearDatabase() {
  try {
    console.log('🧹 Starting database clearing process...');
    
    // Initialize TypeORM
    await initializeTypeORM();
    
    // Clear all data
    console.log('🗑️  Clearing subitems...');
    await AppDataSource.getRepository('SubItem').delete({});
    
    console.log('🗑️  Clearing orders...');
    await AppDataSource.getRepository('Order').delete({});
    
    console.log('✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Database clearing failed:', error);
    process.exit(1);
  } finally {
    // Close TypeORM connection
    await closeTypeORM();
  }
}

// Run the clearing process
clearDatabase();
