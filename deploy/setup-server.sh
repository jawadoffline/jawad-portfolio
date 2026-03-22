#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Oracle Cloud VM Setup Script
# Run this ONCE on a fresh Ubuntu 22.04 VM
# Usage: ssh ubuntu@YOUR_IP 'bash -s' < deploy/setup-server.sh
# ═══════════════════════════════════════════════════════════

set -e

echo ">>> Updating system..."
sudo apt update && sudo apt upgrade -y

echo ">>> Installing Java 21..."
sudo apt install -y openjdk-21-jre-headless

echo ">>> Verifying Java..."
java -version

echo ">>> Creating app directory..."
mkdir -p /home/ubuntu/app

echo ">>> Creating systemd service..."
sudo tee /etc/systemd/system/jawad-portfolio.service > /dev/null <<'SERVICE'
[Unit]
Description=Jawad Portfolio - Spring Boot
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/bin/java -Xmx512m -Dspring.profiles.active=prod -jar /home/ubuntu/app/portfolio-1.0.0.jar
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
SERVICE

echo ">>> Enabling service..."
sudo systemctl daemon-reload
sudo systemctl enable jawad-portfolio

echo ">>> Opening firewall ports..."
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true

echo ">>> Installing Caddy (reverse proxy + auto HTTPS)..."
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

echo ">>> Caddy installed. Configure it after pointing your domain."
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  SETUP COMPLETE"
echo ""
echo "  Next steps:"
echo "  1. Push code to GitHub — Actions will deploy the JAR"
echo "  2. Point your domain DNS (A record) to this server IP"
echo "  3. Configure Caddy:"
echo ""
echo "     sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF"
echo "     yourdomain.dev {"
echo "         reverse_proxy localhost:8080"
echo "     }"
echo "     EOF"
echo "     sudo systemctl restart caddy"
echo ""
echo "  Caddy handles HTTPS automatically via Let's Encrypt."
echo "═══════════════════════════════════════════════════════════"
