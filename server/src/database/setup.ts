// Database setup script
// This file provides utilities for setting up and managing the database

import { Pool, PoolClient } from 'pg';
import fs from 'fs';
import path from 'path';

export class DatabaseSetup {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  /**
   * Run the initial database schema migration
   */
  async runMigration(): Promise<void> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log('🔄 Running database migration...');
      
      // Read and execute the migration file
      const migrationPath = path.join(__dirname, 'migrations', '001_initial_schema.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      await client.query(migrationSQL);
      console.log('✅ Database migration completed successfully');
      
    } catch (error) {
      console.error('❌ Migration failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Seed the database with sample data
   */
  async seedDatabase(): Promise<void> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      console.log('🌱 Seeding database with sample data...');
      
      // Read and execute the seed file
      const seedPath = path.join(__dirname, 'seed.sql');
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      await client.query(seedSQL);
      console.log('✅ Database seeding completed successfully');
      
    } catch (error) {
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Check if database is properly set up
   */
  async checkDatabaseHealth(): Promise<boolean> {
    const client: PoolClient = await this.pool.connect();
    
    try {
      // Check if tables exist
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('orders', 'sub_items')
      `);
      
      const tableCount = tablesResult.rows.length;
      console.log(`📊 Found ${tableCount} tables in database`);
      
      if (tableCount === 2) {
        // Check if we have data
        const orderCount = await client.query('SELECT COUNT(*) FROM orders');
        const subItemCount = await client.query('SELECT COUNT(*) FROM sub_items');
        
        console.log(`📈 Database contains ${orderCount.rows[0].count} orders and ${subItemCount.rows[0].count} subitems`);
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Complete database setup (migration + seeding)
   */
  async setupDatabase(): Promise<void> {
    try {
      console.log('🚀 Starting database setup...');
      
      // Check if database is already set up
      const isHealthy = await this.checkDatabaseHealth();
      
      if (isHealthy) {
        console.log('✅ Database is already set up and healthy');
        return;
      }
      
      // Run migration
      await this.runMigration();
      
      // Seed with sample data
      await this.seedDatabase();
      
      console.log('🎉 Database setup completed successfully!');
      
    } catch (error) {
      console.error('💥 Database setup failed:', error);
      throw error;
    }
  }

  /**
   * Close the database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Export a convenience function for easy setup
export async function setupDatabase(connectionString: string): Promise<void> {
  const dbSetup = new DatabaseSetup(connectionString);
  await dbSetup.setupDatabase();
  await dbSetup.close();
}
