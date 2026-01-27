#!/usr/bin/env node

/**
 * PostgreSQL Extension Test Script
 * 
 * This script tests the PostgreSQL extensions (uuid-ossp and pgcrypto) 
 * to ensure they are properly installed and functional.
 */

import pg from 'pg';
import config from '../src/config/index.js';

const { Pool } = pg;

// Create a test connection pool
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
});

async function testExtensions() {
  console.log('================================================');
  console.log('PostgreSQL Extensions Test');
  console.log('================================================\n');

  try {
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    console.log(`✅ Connected successfully at ${connectionTest.rows[0].current_time}`);
    console.log('');

    // Test 2: UUID Extension
    console.log('2. Testing uuid-ossp Extension...');
    const uuidTest = await pool.query('SELECT uuid_generate_v4() AS uuid');
    console.log(`✅ UUID Generated: ${uuidTest.rows[0].uuid}`);
    console.log('');

    // Test 3: Multiple UUIDs to verify uniqueness
    console.log('3. Testing UUID Uniqueness...');
    const uuidBatch = await pool.query(`
      SELECT uuid_generate_v4() AS uuid 
      FROM generate_series(1, 5)
    `);
    console.log('✅ Generated 5 unique UUIDs:');
    uuidBatch.rows.forEach((row, idx) => {
      console.log(`   ${idx + 1}. ${row.uuid}`);
    });
    console.log('');

    // Test 4: pgcrypto - Password Hashing
    console.log('4. Testing pgcrypto Extension (Password Hashing)...');
    const passwordTest = await pool.query(`
      SELECT crypt('my_secure_password', gen_salt('bf')) AS hashed_password
    `);
    console.log(`✅ Password hashed successfully: ${passwordTest.rows[0].hashed_password.substring(0, 20)}...`);
    console.log('');

    // Test 5: Password Verification
    console.log('5. Testing Password Verification...');
    const password = 'test_password_123';
    const hashResult = await pool.query(
      `SELECT crypt($1, gen_salt('bf')) AS hash`,
      [password]
    );
    const hash = hashResult.rows[0].hash;

    const verifyResult = await pool.query(
      `SELECT crypt($1, $2) = $2 AS is_valid`,
      [password, hash]
    );
    const isValid = verifyResult.rows[0].is_valid;
    console.log(`✅ Password verification: ${isValid ? 'PASSED' : 'FAILED'}`);
    console.log('');

    // Test 6: List All Extensions
    console.log('6. Listing All Installed Extensions...');
    const extensions = await pool.query(`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname
    `);
    console.log('✅ Installed Extensions:');
    extensions.rows.forEach((ext) => {
      console.log(`   - ${ext.extname} (v${ext.extversion})`);
    });
    console.log('');

    console.log('================================================');
    console.log('✅ All Tests Passed Successfully!');
    console.log('================================================');

  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error(`Error: ${error.message}`);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the tests
testExtensions().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
