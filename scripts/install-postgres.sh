#!/bin/bash

# PostgreSQL Installation and Setup Script
# This script installs PostgreSQL 14+ and configures it for the todo-backend application
# Supports Ubuntu/Debian and macOS

set -e  # Exit on error

echo "================================================"
echo "PostgreSQL Installation & Setup Script"
echo "================================================"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "✓ Detected OS: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    echo "✓ Detected OS: macOS"
else
    echo "❌ Unsupported operating system: $OSTYPE"
    exit 1
fi

echo ""

# Function to check if PostgreSQL is installed
check_postgres_installed() {
    if command -v psql &> /dev/null; then
        POSTGRES_VERSION=$(psql --version | sed -E 's/^[^0-9]*([0-9]+).*/\1/')
        echo "✓ PostgreSQL is already installed (version $POSTGRES_VERSION)"
        return 0
    else
        echo "✗ PostgreSQL is not installed"
        return 1
    fi
}

# Function to install PostgreSQL on Linux (Ubuntu/Debian)
install_postgres_linux() {
    echo ""
    echo "Installing PostgreSQL 14 on Linux..."
    echo "This requires sudo privileges."
    echo ""
    
    # Install prerequisites
    sudo apt-get update
    sudo apt-get install -y wget ca-certificates gnupg
    
    # Import the repository signing key (using modern method)
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
    
    # Add PostgreSQL repository
    sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
    
    # Update and install PostgreSQL
    sudo apt-get update
    sudo apt-get install -y postgresql-14
    
    echo "✓ PostgreSQL 14 installed successfully"
}

# Function to install PostgreSQL on macOS
install_postgres_macos() {
    echo ""
    echo "Installing PostgreSQL 14 on macOS..."
    echo ""
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "❌ Homebrew is not installed. Please install Homebrew first:"
        echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
        exit 1
    fi
    
    # Install PostgreSQL using Homebrew
    brew install postgresql@14
    
    # Start PostgreSQL service
    brew services start postgresql@14
    
    echo "✓ PostgreSQL 14 installed and started successfully"
}

# Function to setup database and extensions
setup_database() {
    echo ""
    echo "Setting up database and extensions..."
    echo ""
    
    # Check if we can connect to PostgreSQL
    if ! sudo -u postgres psql -c "SELECT 1" &> /dev/null; then
        echo "❌ Cannot connect to PostgreSQL. Please ensure the service is running."
        exit 1
    fi
    
    # Run the setup SQL script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    sudo -u postgres psql -f "$SCRIPT_DIR/setup-database.sql"
    
    echo ""
    echo "✓ Database setup completed"
}

# Function to verify setup
verify_setup() {
    echo ""
    echo "Verifying installation..."
    echo ""
    
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PGPASSWORD=todo_secure_password psql -U todo_user -d todo_db -f "$SCRIPT_DIR/verify-setup.sql"
}

# Main installation flow
main() {
    # Check if PostgreSQL is already installed
    if check_postgres_installed; then
        if [ "$POSTGRES_VERSION" -ge 14 ]; then
            echo "✓ PostgreSQL version meets requirements (14+)"
        else
            echo "⚠ Warning: PostgreSQL version $POSTGRES_VERSION is installed, but version 14+ is recommended"
            read -p "Do you want to continue with the current version? (y/n) " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                exit 1
            fi
        fi
    else
        # Install PostgreSQL based on OS
        if [ "$OS" == "linux" ]; then
            install_postgres_linux
        elif [ "$OS" == "macos" ]; then
            install_postgres_macos
        fi
    fi
    
    # Setup database and extensions
    setup_database
    
    # Verify setup
    verify_setup
    
    echo ""
    echo "================================================"
    echo "✅ PostgreSQL setup completed successfully!"
    echo "================================================"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with the database credentials:"
    echo "   DB_USER=todo_user"
    echo "   DB_PASSWORD=todo_secure_password"
    echo "   DB_NAME=todo_db"
    echo ""
    echo "2. Start your application:"
    echo "   npm run dev"
    echo ""
}

# Run main function
main
