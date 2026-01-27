# PostgreSQL Installation and Setup Guide

This guide walks you through installing PostgreSQL 14+ and configuring it for the todo-backend application with required extensions.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Automated Installation](#automated-installation)
- [Manual Installation](#manual-installation)
  - [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
  - [macOS](#macos)
  - [Windows](#windows)
- [Database Configuration](#database-configuration)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Prerequisites

- **Operating System**: Linux (Ubuntu/Debian), macOS, or Windows with WSL
- **Privileges**: Administrator/sudo access for installation
- **Network**: Internet connection for downloading packages

## Automated Installation

The easiest way to set up PostgreSQL is using our automated installation script:

```bash
# Make the script executable (if not already)
chmod +x scripts/install-postgres.sh

# Run the installation script
./scripts/install-postgres.sh
```

This script will:
1. ✅ Detect your operating system
2. ✅ Install PostgreSQL 14 (if not already installed)
3. ✅ Create the `todo_db` database
4. ✅ Enable `uuid-ossp` and `pgcrypto` extensions
5. ✅ Create the `todo_user` application user with proper permissions
6. ✅ Verify the installation

**After the script completes**, update your `.env` file:

```bash
cp .env.example .env
# The .env file will already have the correct credentials
```

## Manual Installation

If you prefer to install PostgreSQL manually, follow the instructions for your operating system:

### Linux (Ubuntu/Debian)

#### 1. Install PostgreSQL 14

```bash
# Install prerequisites
sudo apt-get update
sudo apt-get install -y wget ca-certificates

# Import the repository signing key
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Update and install PostgreSQL 14
sudo apt-get update
sudo apt-get install -y postgresql-14
```

#### 2. Verify Installation

```bash
# Check PostgreSQL version
psql --version

# Check service status
sudo systemctl status postgresql
```

#### 3. Configure Database

```bash
# Run the setup script as postgres user
sudo -u postgres psql -f scripts/setup-database.sql
```

### macOS

#### 1. Install PostgreSQL 14 using Homebrew

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL 14
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14
```

#### 2. Configure Database

```bash
# Run the setup script
psql -f scripts/setup-database.sql
```

### Windows

For Windows users, we recommend using Windows Subsystem for Linux (WSL) and following the Linux instructions above.

Alternatively, you can download the Windows installer from [postgresql.org](https://www.postgresql.org/download/windows/).

## Database Configuration

### 1. Run Setup Script

The setup script creates the database, enables extensions, and sets up the application user:

```bash
# As postgres superuser
sudo -u postgres psql -f scripts/setup-database.sql
```

This script performs the following:
- Creates the `todo_db` database
- Enables the `uuid-ossp` extension for UUID v4 generation
- Enables the `pgcrypto` extension for password hashing
- Creates `todo_user` with password `todo_secure_password`
- Grants necessary privileges to `todo_user`

### 2. Update Environment Variables

Copy the example environment file and update if needed:

```bash
cp .env.example .env
```

The `.env` file should contain:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USER=todo_user
DB_PASSWORD=todo_secure_password
DB_NAME=todo_db
```

**⚠️ Important**: Change `DB_PASSWORD` to a secure password in production environments.

### 3. Configure Authentication (Linux only)

If you encounter "Peer authentication failed" errors, you may need to update `pg_hba.conf`:

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Find the line:
# local   all             all                                     peer

# Change it to:
# local   all             all                                     md5
# or
# local   all             all                                     scram-sha-256

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Verification

### 1. Run Verification Script

```bash
# Test as the application user
PGPASSWORD=todo_secure_password psql -U todo_user -d todo_db -f scripts/verify-setup.sql
```

Expected output:
```
=== PostgreSQL Setup Verification ===

1. Installed Extensions:
 extname   | extversion
-----------+------------
 pgcrypto  | 1.3
 plpgsql   | 1.0
 uuid-ossp | 1.1

2. Testing UUID v4 Generation (uuid-ossp):
              sample_uuid
--------------------------------------
 a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d

3. Testing Password Hashing (pgcrypto):
                         hashed_password
------------------------------------------------------------
 $2a$06$...

✅ All verification tests completed!
```

### 2. Test Extension Functions

Connect to the database and test the extensions manually:

```bash
# Connect as todo_user
PGPASSWORD=todo_secure_password psql -U todo_user -d todo_db
```

```sql
-- Test UUID generation
SELECT uuid_generate_v4();

-- Test password hashing
SELECT crypt('password', gen_salt('bf'));

-- List all extensions
SELECT extname FROM pg_extension;

-- Exit
\q
```

### 3. Test Application Connection

Start your application and verify database connectivity:

```bash
npm run dev
```

Test the health check endpoint:

```bash
curl http://localhost:5000/health-check
```

Expected response:
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2026-01-27T11:00:00.000Z"
}
```

## Troubleshooting

### PostgreSQL Service Not Running

**Linux:**
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql  # Start on boot
```

**macOS:**
```bash
brew services start postgresql@14
```

### Cannot Connect to Database

1. **Check if PostgreSQL is listening:**
   ```bash
   sudo netstat -plnt | grep postgres
   ```

2. **Verify pg_hba.conf settings** (Linux):
   ```bash
   sudo cat /etc/postgresql/14/main/pg_hba.conf
   ```

3. **Check PostgreSQL logs** (Linux):
   ```bash
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   ```

### "Peer authentication failed" Error

This occurs when `pg_hba.conf` is set to use `peer` authentication. Change to `md5` or `scram-sha-256`:

```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
sudo systemctl restart postgresql
```

### Extension Not Found

If extensions are missing, ensure you're connected to the correct database:

```sql
-- Connect to todo_db first
\c todo_db

-- Then create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### Port Already in Use

If PostgreSQL fails to start because port 5432 is in use:

1. **Find the process:**
   ```bash
   sudo lsof -i :5432
   ```

2. **Change PostgreSQL port** (if needed):
   ```bash
   sudo nano /etc/postgresql/14/main/postgresql.conf
   # Change: port = 5433
   sudo systemctl restart postgresql
   ```

3. **Update .env file:**
   ```env
   DB_PORT=5433
   ```

### Version Conflicts

If multiple PostgreSQL versions are installed:

1. **List installed versions:**
   ```bash
   pg_lsclusters  # Linux
   brew list | grep postgresql  # macOS
   ```

2. **Use specific version:**
   ```bash
   sudo -u postgres /usr/lib/postgresql/14/bin/psql  # Linux
   /opt/homebrew/opt/postgresql@14/bin/psql  # macOS
   ```

## Security Considerations

### 1. Password Security

**⚠️ Never use default passwords in production!**

Change the default password:

```sql
ALTER USER todo_user WITH PASSWORD 'your_secure_password_here';
```

Update your `.env` file accordingly.

### 2. User Permissions

The `todo_user` is created with limited privileges:
- ✅ Can connect to `todo_db`
- ✅ Can create tables and execute queries
- ❌ Cannot create databases
- ❌ Cannot create users
- ❌ Not a superuser

### 3. Network Security

For production deployments:

1. **Restrict listen addresses** in `postgresql.conf`:
   ```
   listen_addresses = 'localhost'  # Only local connections
   ```

2. **Use SSL/TLS** for remote connections:
   ```
   ssl = on
   ```

3. **Configure pg_hba.conf** to restrict access:
   ```
   # IPv4 local connections:
   host    todo_db    todo_user    127.0.0.1/32    scram-sha-256
   ```

### 4. Avoid Using Superuser

**Never** use the `postgres` superuser for application queries. Always use `todo_user` or another restricted user.

## Next Steps

After completing the PostgreSQL setup:

1. ✅ Verify all extensions are working
2. ✅ Test application connectivity
3. ✅ Create your database schema (tables, indexes, etc.)
4. ✅ Set up database migrations if needed
5. ✅ Configure backups for production environments

For application development, refer to the main [README.md](../README.md) for running the application.
