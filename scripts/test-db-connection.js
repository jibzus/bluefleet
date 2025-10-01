#!/usr/bin/env node

// Simple script to test database connection
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  try {
    // Try to connect
    await prisma.$connect();
    console.log('✅ Successfully connected to database!');
    
    // Try a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful!');
    console.log('\n🎉 Your database is ready to use!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. Your DATABASE_URL in .env is correct');
    console.error('2. Your internet connection is working');
    console.error('3. The Neon project is active (not paused)\n');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

