#!/bin/bash

# Epic Battle Arena - Complete Setup Script
# This script sets up the entire development and production environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Epic Battle Arena"
PROJECT_DIR="$(pwd)"
NODE_VERSION="18.0.0"
POSTGRES_VERSION="15"
REDIS_VERSION="7"
NGINX_VERSION="1.24"

# Utility functions
log() {
    echo -e "${CYAN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root"
    fi
}

# Check system requirements
check_system() {
    log "Checking system requirements..."
    
    # Check OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        info "Detected Linux system"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        info "Detected macOS system"
    else
        error "Unsupported operating system: $OSTYPE"
    fi
    
    # Check available memory
    if command -v free >/dev/null 2>&1; then
        MEMORY_GB=$(free -g | awk '/^Mem:/{print $2}')
        if [[ $MEMORY_GB -lt 4 ]]; then
            warning "Less than 4GB RAM detected. Epic Battle Arena may run slowly."
        else
            success "Memory check passed: ${MEMORY_GB}GB RAM"
        fi
    fi
    
    # Check disk space
    DISK_SPACE=$(df -BG "$PROJECT_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $DISK_SPACE -lt 10 ]]; then
        warning "Less than 10GB free disk space. You may need more space for assets."
    else
        success "Disk space check passed: ${DISK_SPACE}GB free"
    fi
}

# Install system dependencies
install_system_deps() {
    log "Installing system dependencies..."
    
    if [[ "$OS" == "linux" ]]; then
        # Update package list
        if command -v apt-get >/dev/null 2>&1; then
            sudo apt-get update
            
            # Install basic dependencies
            sudo apt-get install -y \
                curl \
                wget \
                git \
                build-essential \
                software-properties-common \
                apt-transport-https \
                ca-certificates \
                gnupg \
                lsb-release \
                python3 \
                python3-pip \
                redis-server \
                postgresql \
                postgresql-contrib \
                nginx \
                ffmpeg \
                imagemagick \
                openssl
                
        elif command -v yum >/dev/null 2>&1; then
            # RedHat/CentOS
            sudo yum update -y
            sudo yum install -y \
                curl \
                wget \
                git \
                gcc \
                gcc-c++ \
                make \
                python3 \
                python3-pip \
                redis \
                postgresql \
                postgresql-server \
                nginx \
                ffmpeg \
                ImageMagick \
                openssl
        fi
        
    elif [[ "$OS" == "macos" ]]; then
        # Check if Homebrew is installed
        if ! command -v brew >/dev/null 2>&1; then
            log "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        
        # Install dependencies with Homebrew
        brew update
        brew install \
            curl \
            wget \
            git \
            python3 \
            redis \
            postgresql \
            nginx \
            ffmpeg \
            imagemagick \
            openssl
    fi
    
    success "System dependencies installed"
}

# Install Node.js and npm
install_nodejs() {
    log "Installing Node.js..."
    
    # Check if Node.js is already installed
    if command -v node >/dev/null 2>&1; then
        CURRENT_NODE_VERSION=$(node --version | cut -d'v' -f2)
        if [[ "$(printf '%s\n' "$NODE_VERSION" "$CURRENT_NODE_VERSION" | sort -V | head -n1)" == "$NODE_VERSION" ]]; then
            success "Node.js $CURRENT_NODE_VERSION is already installed"
            return
        fi
    fi
    
    # Install Node.js using NodeSource repository
    if [[ "$OS" == "linux" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == "macos" ]]; then
        brew install node@18
        brew link node@18 --force
    fi
    
    # Verify installation
    node --version || error "Failed to install Node.js"
    npm --version || error "Failed to install npm"
    
    success "Node.js installed successfully"
}

# Install Docker and Docker Compose
install_docker() {
    log "Installing Docker..."
    
    if command -v docker >/dev/null 2>&1; then
        success "Docker is already installed"
        return
    fi
    
    if [[ "$OS" == "linux" ]]; then
        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Add Docker repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker
        sudo apt-get update
        sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
        # Add user to docker group
        sudo usermod -aG docker $USER
        
    elif [[ "$OS" == "macos" ]]; then
        info "Please install Docker Desktop for Mac from https://www.docker.com/products/docker-desktop"
        read -p "Press enter when Docker Desktop is installed..."
    fi
    
    # Install Docker Compose
    if ! command -v docker-compose >/dev/null 2>&1; then
        DOCKER_COMPOSE_VERSION="2.21.0"
        sudo curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    success "Docker installed successfully"
}

# Setup PostgreSQL
setup_postgresql() {
    log "Setting up PostgreSQL..."
    
    # Start PostgreSQL service
    if [[ "$OS" == "linux" ]]; then
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    elif [[ "$OS" == "macos" ]]; then
        brew services start postgresql
    fi
    
    # Create database and user
    sudo -u postgres psql -c "CREATE USER game_user WITH PASSWORD 'secure_password_123';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE epic_battle_arena OWNER game_user;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE epic_battle_arena TO game_user;" 2>/dev/null || true
    
    success "PostgreSQL setup complete"
}

# Setup Redis
setup_redis() {
    log "Setting up Redis..."
    
    # Start Redis service
    if [[ "$OS" == "linux" ]]; then
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
    elif [[ "$OS" == "macos" ]]; then
        brew services start redis
    fi
    
    # Configure Redis
    if [[ -f /etc/redis/redis.conf ]]; then
        sudo sed -i 's/# requirepass foobared/requirepass redis_password_123/' /etc/redis/redis.conf
        sudo systemctl restart redis-server
    fi
    
    success "Redis setup complete"
}

# Install project dependencies
install_dependencies() {
    log "Installing project dependencies..."
    
    # Install main dependencies
    npm install
    
    # Install server dependencies
    if [[ -d "server" ]]; then
        cd server
        npm install
        cd ..
    fi
    
    # Install client dependencies
    if [[ -d "client" ]]; then
        cd client
        npm install
        cd ..
    fi
    
    # Install analytics dependencies
    if [[ -d "analytics" ]]; then
        cd analytics
        npm install
        cd ..
    fi
    
    success "Project dependencies installed"
}

# Setup environment files
setup_environment() {
    log "Setting up environment files..."
    
    # Server environment
    if [[ -f "server/.env.example" ]] && [[ ! -f "server/.env" ]]; then
        cp server/.env.example server/.env
        
        # Generate JWT secret
        JWT_SECRET=$(openssl rand -base64 32)
        JWT_REFRESH_SECRET=$(openssl rand -base64 32)
        
        # Update environment file
        sed -i "s/your_super_secret_jwt_key_change_this_in_production/${JWT_SECRET}/" server/.env
        sed -i "s/your_refresh_token_secret/${JWT_REFRESH_SECRET}/" server/.env
        
        success "Server environment file created"
    fi
    
    # Client environment
    if [[ -d "client" ]] && [[ ! -f "client/.env" ]]; then
        cat > client/.env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Epic Battle Arena
VITE_ENVIRONMENT=development
EOF
        success "Client environment file created"
    fi
}

# Setup SSL certificates (development)
setup_ssl() {
    log "Setting up SSL certificates for development..."
    
    if [[ ! -d "ssl" ]]; then
        mkdir -p ssl
    fi
    
    if [[ ! -f "ssl/server.crt" ]]; then
        # Generate self-signed certificate
        openssl req -x509 -newkey rsa:4096 -keyout ssl/server.key -out ssl/server.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
        success "SSL certificates generated"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    if [[ -d "database/migrations" ]]; then
        # Check if database is accessible
        if psql -h localhost -U game_user -d epic_battle_arena -c '\q' 2>/dev/null; then
            # Run migrations
            for migration in database/migrations/*.sql; do
                if [[ -f "$migration" ]]; then
                    info "Running migration: $(basename "$migration")"
                    psql -h localhost -U game_user -d epic_battle_arena -f "$migration"
                fi
            done
            success "Database migrations completed"
        else
            warning "Cannot connect to database. Please run migrations manually."
        fi
    fi
}

# Setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create monitoring directories
    mkdir -p monitoring/grafana/{dashboards,datasources}
    mkdir -p monitoring/logstash/pipeline
    mkdir -p logs
    
    # Create basic Prometheus config
    if [[ ! -f "monitoring/prometheus.yml" ]]; then
        cat > monitoring/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'epic-battle-arena'
    static_configs:
      - targets: ['localhost:5000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF
        success "Prometheus configuration created"
    fi
}

# Build the project
build_project() {
    log "Building the project..."
    
    # Build client
    if [[ -d "client" ]]; then
        cd client
        npm run build
        cd ..
        success "Client built successfully"
    fi
    
    # Build server
    if [[ -d "server" ]]; then
        cd server
        npm run build
        cd ..
        success "Server built successfully"
    fi
}

# Create systemd services (Linux only)
create_services() {
    if [[ "$OS" != "linux" ]]; then
        return
    fi
    
    log "Creating systemd services..."
    
    # Epic Battle Arena Server service
    sudo tee /etc/systemd/system/epic-battle-arena.service > /dev/null << EOF
[Unit]
Description=Epic Battle Arena Game Server
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl daemon-reload
    success "Systemd service created"
}

# Setup firewall
setup_firewall() {
    if [[ "$OS" != "linux" ]]; then
        return
    fi
    
    log "Setting up firewall..."
    
    if command -v ufw >/dev/null 2>&1; then
        sudo ufw --force enable
        sudo ufw allow 22/tcp    # SSH
        sudo ufw allow 80/tcp    # HTTP
        sudo ufw allow 443/tcp   # HTTPS
        sudo ufw allow 3000/tcp  # Client dev server
        sudo ufw allow 5000/tcp  # Game server
        sudo ufw allow 5432/tcp  # PostgreSQL
        sudo ufw allow 6379/tcp  # Redis
        sudo ufw allow 9090/tcp  # Prometheus
        sudo ufw allow 3001/tcp  # Grafana
        
        success "Firewall configured"
    fi
}

# Optimize system for game server
optimize_system() {
    log "Optimizing system for game server..."
    
    # Increase file descriptor limits
    sudo tee -a /etc/security/limits.conf > /dev/null << EOF
$USER soft nofile 65536
$USER hard nofile 65536
EOF
    
    # Optimize network settings
    sudo tee -a /etc/sysctl.conf > /dev/null << EOF
# Epic Battle Arena optimizations
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 16384 134217728
net.ipv4.tcp_wmem = 4096 65536 134217728
net.core.netdev_max_backlog = 30000
net.ipv4.tcp_max_syn_backlog = 30000
EOF
    
    sudo sysctl -p
    success "System optimizations applied"
}

# Create development scripts
create_scripts() {
    log "Creating development scripts..."
    
    # Start script
    cat > scripts/start.sh << 'EOF'
#!/bin/bash
echo "Starting Epic Battle Arena..."
npm run dev
EOF
    
    # Stop script
    cat > scripts/stop.sh << 'EOF'
#!/bin/bash
echo "Stopping Epic Battle Arena..."
pkill -f "epic-battle-arena"
docker-compose down
EOF
    
    # Backup script
    cat > scripts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "Creating database backup..."
pg_dump -h localhost -U game_user epic_battle_arena > "$BACKUP_DIR/database.sql"

echo "Creating files backup..."
tar -czf "$BACKUP_DIR/files.tar.gz" uploads/ logs/

echo "Backup completed: $BACKUP_DIR"
EOF
    
    # Make scripts executable
    chmod +x scripts/*.sh
    
    success "Development scripts created"
}

# Setup game assets
setup_assets() {
    log "Setting up game assets..."
    
    # Create asset directories
    mkdir -p client/public/{images,sounds,models,maps,icons}
    mkdir -p uploads/{avatars,replays,screenshots}
    
    # Download placeholder assets (if internet available)
    if ping -c 1 google.com &> /dev/null; then
        info "Downloading placeholder assets..."
        
        # Placeholder images
        curl -s "https://via.placeholder.com/512x512/4ecdc4/ffffff?text=EBA+Logo" -o client/public/images/game-logo.png || true
        curl -s "https://via.placeholder.com/1920x1080/1a1a2e/ffffff?text=Battle+Arena" -o client/public/images/background.jpg || true
        
        success "Placeholder assets downloaded"
    fi
}

# Verify installation
verify_installation() {
    log "Verifying installation..."
    
    ISSUES=0
    
    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js not found"
        ((ISSUES++))
    else
        success "✓ Node.js: $(node --version)"
    fi
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        error "npm not found"
        ((ISSUES++))
    else
        success "✓ npm: $(npm --version)"
    fi
    
    # Check PostgreSQL
    if ! command -v psql >/dev/null 2>&1; then
        warning "PostgreSQL client not found"
        ((ISSUES++))
    else
        success "✓ PostgreSQL client available"
    fi
    
    # Check Redis
    if ! command -v redis-cli >/dev/null 2>&1; then
        warning "Redis client not found"
        ((ISSUES++))
    else
        success "✓ Redis client available"
    fi
    
    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        warning "Docker not found"
        ((ISSUES++))
    else
        success "✓ Docker: $(docker --version | cut -d' ' -f3 | sed 's/,//')"
    fi
    
    # Check project files
    if [[ -f "package.json" ]]; then
        success "✓ Main package.json found"
    else
        error "Main package.json not found"
        ((ISSUES++))
    fi
    
    if [[ -f "server/package.json" ]]; then
        success "✓ Server package.json found"
    else
        warning "Server package.json not found"
    fi
    
    if [[ -f "client/package.json" ]]; then
        success "✓ Client package.json found"
    else
        warning "Client package.json not found"
    fi
    
    if [[ $ISSUES -eq 0 ]]; then
        success "🎉 Installation verification completed successfully!"
    else
        warning "Installation completed with $ISSUES issues. Please review the warnings above."
    fi
}

# Print final instructions
print_instructions() {
    echo
    echo -e "${PURPLE}=================================================${NC}"
    echo -e "${PURPLE}🎮 Epic Battle Arena Setup Complete! 🎮${NC}"
    echo -e "${PURPLE}=================================================${NC}"
    echo
    echo -e "${WHITE}Quick Start Commands:${NC}"
    echo -e "${GREEN}  Development:${NC}     npm run dev"
    echo -e "${GREEN}  Production:${NC}      docker-compose up -d"
    echo -e "${GREEN}  Database:${NC}        npm run db:migrate"
    echo -e "${GREEN}  Tests:${NC}           npm test"
    echo
    echo -e "${WHITE}Useful URLs:${NC}"
    echo -e "${GREEN}  Game Client:${NC}     http://localhost:3000"
    echo -e "${GREEN}  Game Server:${NC}     http://localhost:5000"
    echo -e "${GREEN}  Database:${NC}        localhost:5432"
    echo -e "${GREEN}  Redis:${NC}           localhost:6379"
    echo -e "${GREEN}  Monitoring:${NC}      http://localhost:3001"
    echo
    echo -e "${WHITE}Documentation:${NC}"
    echo -e "${GREEN}  README:${NC}          ./README.md"
    echo -e "${GREEN}  API Docs:${NC}        http://localhost:5000/docs"
    echo -e "${GREEN}  Architecture:${NC}    ./docs/architecture.md"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo -e "  1. Review the environment files (.env) and update as needed"
    echo -e "  2. Configure your game settings in the admin panel"
    echo -e "  3. Add your SSL certificates for production"
    echo -e "  4. Set up your CI/CD pipeline"
    echo -e "  5. Configure monitoring and alerting"
    echo
    echo -e "${CYAN}For support, visit: https://github.com/epic-games/epic-battle-arena${NC}"
    echo -e "${PURPLE}=================================================${NC}"
}

# Main installation flow
main() {
    echo -e "${PURPLE}"
    cat << "EOF"
███████╗██████╗ ██╗ ██████╗    ██████╗  █████╗ ████████╗████████╗██╗     ███████╗
██╔════╝██╔══██╗██║██╔════╝    ██╔══██╗██╔══██╗╚══██╔══╝╚══██╔══╝██║     ██╔════╝
█████╗  ██████╔╝██║██║         ██████╔╝███████║   ██║      ██║   ██║     █████╗  
██╔══╝  ██╔═══╝ ██║██║         ██╔══██╗██╔══██║   ██║      ██║   ██║     ██╔══╝  
███████╗██║     ██║╚██████╗    ██████╔╝██║  ██║   ██║      ██║   ███████╗███████╗
╚══════╝╚═╝     ╚═╝ ╚═════╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚══════╝
                                                                                  
 █████╗ ██████╗ ███████╗███╗   ██╗ █████╗ 
██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗
███████║██████╔╝█████╗  ██╔██╗ ██║███████║
██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝

EOF
    echo -e "${NC}"
    
    log "Starting Epic Battle Arena setup..."
    log "This script will install and configure everything needed for development and production"
    echo
    
    # Run setup steps
    check_root
    check_system
    install_system_deps
    install_nodejs
    install_docker
    setup_postgresql
    setup_redis
    install_dependencies
    setup_environment
    setup_ssl
    run_migrations
    setup_monitoring
    build_project
    create_services
    setup_firewall
    optimize_system
    create_scripts
    setup_assets
    verify_installation
    print_instructions
    
    success "🚀 Epic Battle Arena setup completed successfully!"
}

# Run main function
main "$@"