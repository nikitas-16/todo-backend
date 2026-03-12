#!/bin/bash

# Script to configure PostgreSQL authentication for the todo-backend application
# This script updates pg_hba.conf to allow password-based authentication

set -e

echo "================================================"
echo "PostgreSQL Authentication Configuration"
echo "================================================"
echo ""

# Detect PostgreSQL version and config location
if [ -d "/etc/postgresql/16/main" ]; then
    PG_VERSION="16"
    PG_HBA_CONF="/etc/postgresql/16/main/pg_hba.conf"
    PG_CONF="/etc/postgresql/16/main/postgresql.conf"
elif [ -d "/etc/postgresql/14/main" ]; then
    PG_VERSION="14"
    PG_HBA_CONF="/etc/postgresql/14/main/pg_hba.conf"
    PG_CONF="/etc/postgresql/14/main/postgresql.conf"
else
    echo "❌ Could not find PostgreSQL configuration directory"
    echo "Please manually configure pg_hba.conf"
    exit 1
fi

echo "✓ Found PostgreSQL version $PG_VERSION"
echo "✓ Configuration file: $PG_HBA_CONF"
echo ""

# Backup the original pg_hba.conf
echo "Creating backup of pg_hba.conf..."
sudo cp "$PG_HBA_CONF" "${PG_HBA_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
echo "✓ Backup created"
echo ""

# Update pg_hba.conf to use md5 authentication for local connections
echo "Updating pg_hba.conf to allow password authentication..."
sudo sed -i -E 's/^local[[:space:]]+all[[:space:]]+all[[:space:]]+peer$/local   all             all                                     md5/' "$PG_HBA_CONF"

echo "✓ Configuration updated"
echo ""

# Display the changes
echo "Current authentication settings:"
sudo cat "$PG_HBA_CONF" | grep -E "^(local|host)" | grep -v "^#"
echo ""

# Restart PostgreSQL to apply changes
echo "Restarting PostgreSQL service..."
sudo systemctl restart postgresql
echo "✓ PostgreSQL restarted"
echo ""

echo "================================================"
echo "✅ Configuration completed successfully!"
echo "================================================"
echo ""
echo "You can now connect to PostgreSQL using password authentication."
echo "Test connection: PGPASSWORD=todo_secure_password psql -U todo_user -d todo_db"
