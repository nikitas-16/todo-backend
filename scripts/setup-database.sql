-- PostgreSQL Database Setup Script
-- This script creates the database, enables required extensions, and sets up the application user
-- Run this as the postgres superuser: sudo -u postgres psql -f scripts/setup-database.sql

-- 1. Create the application database (if it doesn't exist)
-- Note: This needs to be run first, then connect to the database
SELECT 'CREATE DATABASE todo_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'todo_db')\gexec

-- Connect to the newly created database
\c todo_db;

-- 2. Enable required extensions
-- uuid-ossp: For UUID v4 generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pgcrypto: For cryptographic functions (password hashing, etc.)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Create application user (if it doesn't exist)
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'todo_user') THEN
        CREATE USER todo_user WITH PASSWORD 'todo_secure_password';
    END IF;
END
$$;

-- 4. Grant privileges to the application user
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;

-- Grant schema privileges
GRANT ALL PRIVILEGES ON SCHEMA public TO todo_user;

-- Grant privileges on all existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO todo_user;

-- Grant privileges on all existing sequences
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO todo_user;

-- Ensure future tables and sequences are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO todo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO todo_user;

-- 5. Display confirmation
\echo '✅ Database setup completed successfully!'
\echo ''
\echo 'Installed Extensions:'
SELECT extname, extversion FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');
\echo ''
\echo 'Database Users:'
SELECT usename, usecreatedb, usesuper FROM pg_user WHERE usename IN ('todo_user', 'postgres');
