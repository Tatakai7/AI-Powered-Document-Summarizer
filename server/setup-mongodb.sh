#!/bin/bash

echo "========================================="
echo "MongoDB Setup Script"
echo "========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run with sudo: sudo bash setup-mongodb.sh"
    exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "Cannot detect OS. Please install MongoDB manually."
    exit 1
fi

echo "Detected OS: $OS $VERSION"
echo ""

# Install MongoDB based on OS
case $OS in
    amzn|amazonlinux)
        echo "Setting up MongoDB repository for Amazon Linux..."
        cat > /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/amazon/2023/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
        
        echo "Installing MongoDB..."
        dnf install -y mongodb-org
        
        echo "Starting MongoDB service..."
        systemctl start mongod
        systemctl enable mongod
        
        echo "Checking MongoDB status..."
        systemctl status mongod --no-pager
        ;;
        
    ubuntu|debian)
        echo "Setting up MongoDB repository for Ubuntu/Debian..."
        apt-get install -y gnupg curl
        curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
        echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list
        
        echo "Installing MongoDB..."
        apt-get update
        apt-get install -y mongodb-org
        
        echo "Starting MongoDB service..."
        systemctl start mongod
        systemctl enable mongod
        
        echo "Checking MongoDB status..."
        systemctl status mongod --no-pager
        ;;
        
    rhel|centos|fedora)
        echo "Setting up MongoDB repository for RHEL/CentOS/Fedora..."
        cat > /etc/yum.repos.d/mongodb-org-7.0.repo << 'EOF'
[mongodb-org-7.0]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/9/mongodb-org/7.0/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://pgp.mongodb.com/server-7.0.asc
EOF
        
        echo "Installing MongoDB..."
        dnf install -y mongodb-org
        
        echo "Starting MongoDB service..."
        systemctl start mongod
        systemctl enable mongod
        
        echo "Checking MongoDB status..."
        systemctl status mongod --no-pager
        ;;
        
    *)
        echo "Unsupported OS: $OS"
        echo "Please install MongoDB manually from: https://www.mongodb.com/docs/manual/installation/"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "MongoDB Setup Complete!"
echo "========================================="
echo ""
echo "MongoDB should now be running on localhost:27017"
echo "You can now start your server with: npm start"
echo ""
echo "To check MongoDB status: sudo systemctl status mongod"
echo "To stop MongoDB: sudo systemctl stop mongod"
echo "To restart MongoDB: sudo systemctl restart mongod"
echo ""
