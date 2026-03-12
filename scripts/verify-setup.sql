-- PostgreSQL Setup Verification Script
-- This script verifies that extensions are installed and functional
-- Run as the application user: psql -U todo_user -d todo_db -f scripts/verify-setup.sql

\echo '=== PostgreSQL Setup Verification ==='
\echo ''

-- 1. Check installed extensions
\echo '1. Installed Extensions:'
SELECT extname, extversion FROM pg_extension ORDER BY extname;
\echo ''

-- 2. Test UUID generation
\echo '2. Testing UUID v4 Generation (uuid-ossp):'
SELECT uuid_generate_v4() AS sample_uuid;
\echo ''

-- 3. Test cryptographic functions
\echo '3. Testing Password Hashing (pgcrypto):'
SELECT crypt('test_password', gen_salt('bf')) AS hashed_password;
\echo ''

-- 4. Display database version
\echo '4. PostgreSQL Version:'
SELECT version();
\echo ''

-- 5. Display current user and database
\echo '5. Current Connection Info:'
SELECT current_user AS user, current_database() AS database;
\echo ''

\echo '✅ All verification tests completed!'
