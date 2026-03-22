---
title: How I Host My Spring Boot Portfolio for Free — Forever
description: A complete guide to deploying a Spring Boot application on Oracle Cloud's Always Free tier with auto HTTPS, CI/CD, and zero monthly cost.
author: Jawad Ali
date: 2026-03-23
tags: [Spring Boot, Oracle Cloud, DevOps, Deployment]
---

I needed to host my portfolio — a Spring Boot application — somewhere reliable, fast, and free. Not "free for 30 days" or "free until you exceed 100 hours." Actually free. Forever.

After evaluating Railway, Render, Fly.io, and AWS, I landed on **Oracle Cloud's Always Free tier**. Here's exactly how I set it up.

## Why Not the Usual Suspects?

| Platform | Free Tier Catch |
|----------|----------------|
| Railway | $5 trial credits, then ~$7-10/month |
| Render | Free, but app sleeps after 15 min inactivity — 30 sec cold starts |
| Fly.io | Generous, but apps still sleep on free tier |
| AWS EC2 | Free for 12 months only, then bills start |

Oracle Cloud's Always Free tier gives you a **VM that runs 24/7, doesn't sleep, and doesn't expire**. For a Spring Boot app that needs to be always-on (SSE connections, real-time features), this is the only real option at $0/month.

## What You Get for Free

Oracle gives you one of two options on the Always Free tier:

- **AMD:** 1 OCPU, 1 GB RAM (`VM.Standard.E2.1.Micro`)
- **ARM:** Up to 4 OCPUs, 24 GB RAM (`VM.Standard.A1.Flex`) — if available in your region

I went with the AMD micro instance. 1 GB RAM sounds tight for Spring Boot, but with the right JVM flags, it runs comfortably.

## Step 1: Create the VM

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) — requires a credit card for verification but won't charge you
2. Go to **Compute → Instances → Create Instance**
3. Select **VM.Standard.E2.1.Micro** (marked "Always Free-eligible")
4. Choose **Ubuntu 22.04** as the image
5. Create a new VCN with a public subnet (use the VCN Wizard for this — it sets up the internet gateway correctly)
6. Enable **"Automatically assign public IPv4 address"**
7. Generate and download your SSH key pair

## Step 2: Open the Firewall

Oracle Cloud has two layers of firewall — the OS-level `iptables` and the cloud-level **Security List**. You need to open ports on both.

**Cloud Console:**
- Go to Networking → Virtual Cloud Networks → your VCN → Public Subnet → Security List
- Add ingress rules for ports **80**, **443**, and **8080** with source `0.0.0.0/0`

**On the VM:**

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo netfilter-persistent save
```

The key detail: insert the rules **before** the default REJECT rule (line 5 in Oracle's default iptables config). If you append them after the REJECT, traffic still gets blocked.

## Step 3: Install Java and Create a Systemd Service

```bash
sudo apt update && sudo apt install -y openjdk-21-jre-headless
```

Then create a systemd service so your app starts on boot and restarts on crash:

```bash
sudo tee /etc/systemd/system/portfolio.service > /dev/null <<'EOF'
[Unit]
Description=Portfolio - Spring Boot
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/bin/java -Xmx384m -Xms256m -XX:+UseSerialGC \
  -Dspring.profiles.active=prod \
  -jar /home/ubuntu/app/portfolio-1.0.0.jar
Restart=always
RestartSec=5
Environment=PORT=8080

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable portfolio
```

The JVM flags matter on a 1 GB machine:
- `-Xmx384m` caps the heap at 384 MB — leaves room for the OS and Caddy
- `-Xms256m` starts small to reduce startup memory pressure
- `-XX:+UseSerialGC` uses the lowest-memory garbage collector

My Spring Boot app stabilizes at around 200 MB with these settings.

## Step 4: Set Up Caddy for Auto HTTPS

[Caddy](https://caddyserver.com) is a web server that automatically provisions and renews Let's Encrypt SSL certificates. No certbot, no cron jobs, no manual renewal.

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
  sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
  sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Configure it to reverse proxy your Spring Boot app:

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
yourdomain.dev {
    reverse_proxy localhost:8080
}
EOF

sudo systemctl restart caddy
```

That's the entire HTTPS configuration. Caddy handles certificate provisioning, renewal, HTTP-to-HTTPS redirect, and TLS termination. Point your domain's A record to your VM's IP, and Caddy does the rest.

## Step 5: Auto-Deploy with GitHub Actions

The last piece — make it so every `git push` automatically deploys to the VM:

```yaml
name: Deploy

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Java 21
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21

      - name: Build JAR
        run: mvn clean package -DskipTests -B -q

      - name: Deploy to server
        uses: appleboy/scp-action@v0.1.7
        with:
          host: ${{ secrets.ORACLE_HOST }}
          username: ubuntu
          key: ${{ secrets.ORACLE_SSH_KEY }}
          source: target/portfolio-1.0.0.jar
          target: /home/ubuntu/app/
          strip_components: 1

      - name: Restart application
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.ORACLE_HOST }}
          username: ubuntu
          key: ${{ secrets.ORACLE_SSH_KEY }}
          script: sudo systemctl restart portfolio
```

Add two GitHub Secrets:
- `ORACLE_HOST` — your VM's public IP
- `ORACLE_SSH_KEY` — your SSH private key content

Now the workflow is: write code → `git push` → GitHub Actions builds the JAR → SCPs it to Oracle → restarts the service. About 45 seconds from push to live.

## The Final Cost Breakdown

| Item | Monthly Cost |
|------|-------------|
| Oracle Cloud VM | $0 (Always Free) |
| Caddy + Let's Encrypt SSL | $0 |
| GitHub Actions CI/CD | $0 (free for public repos) |
| Cloudflare DNS | $0 |
| Domain (.dev) | ~$1/month ($12.20/year) |
| **Total** | **~$1/month** |

A production-grade Spring Boot deployment — always on, auto HTTPS, CI/CD pipeline, custom domain — for the price of a domain name.

## Things I'd Do Differently

**Use the ARM instance if available.** The `VM.Standard.A1.Flex` gives you up to 4 OCPUs and 24 GB RAM for free. I used AMD because ARM wasn't available in my region at signup. If you can get it, take it — you'll have room for a database, caching, and multiple services.

**Add monitoring.** I don't have health checks or alerting set up yet. Spring Boot Actuator + a simple uptime monitor (UptimeRobot, free tier) would close that gap.

**Consider a database.** Right now my app is stateless (visit counter uses a file). Oracle's Always Free tier also includes an Autonomous Database — I could use that for persistent storage without adding cost.

## Conclusion

The "I can't afford hosting" excuse doesn't hold up anymore. Oracle Cloud's Always Free tier, combined with Caddy and GitHub Actions, gives you a production-grade deployment pipeline at zero cost. The only thing you're spending is time — and if you're a software engineer, the setup itself is a learning experience worth having.

The full source code is on [GitHub](https://github.com/jawadoffline/jawad-portfolio).
