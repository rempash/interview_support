# DigitalOcean Droplet Deployment Guide

This guide covers deploying the Interview Support application to a DigitalOcean Droplet using Docker Compose. DigitalOcean is an excellent, budget-friendly alternative to AWS, offering predictable pricing and a very straightforward setup process.

## Prerequisites
- A DigitalOcean Account
- A registered domain name (optional, but recommended)
- Your project pushed to a Git repository (e.g., GitHub, GitLab)
- SSH keys added to your DigitalOcean account (recommended for secure login)

---

## Step 1: Provision a Droplet

1. Log into your DigitalOcean Control Panel.
2. Click **Create** -> **Droplets**.
3. **Choose Region**: Select a datacenter close to your target audience.
4. **Choose an Image**: Instead of a blank OS, go to the **Marketplace** tab and search for **Docker**. Select the **Docker on Ubuntu** image. This saves you the step of installing Docker and Docker Compose manually!
5. **Choose Size**: 
   - Choose **Basic**.
   - Under CPU options, select **Regular Intel with SSD**.
   - Select the **$6/mo droplet** (1 GB RAM, 1 CPU, 25 GB SSD). 
6. **Choose Authentication Method**: Select **SSH Key** and choose your existing key (or create a new one). This is much more secure than a password.
7. **Finalize**: Name your droplet (e.g., `interview-support-do`) and click **Create Droplet**.

---

## Step 2: Add a Swap File (Crucial for $6 Droplet)

Because the $6 droplet only has 1GB of RAM, building the React and NestJS apps inside Docker might cause the server to run out of memory and crash. Adding a 2GB swap file acts as overflow memory and prevents this.

1. Copy the IP address of your new Droplet from the DigitalOcean dashboard.
2. SSH into your droplet from your local terminal:
   ```bash
   ssh root@<your-droplet-ip>
   ```
3. Run the following commands to create a 2GB swap file:
   ```bash
   # Create a 2 Gigabyte file
   fallocate -l 2G /swapfile
   
   # Set the correct permissions
   chmod 600 /swapfile
   
   # Mark the file as swap space
   mkswap /swapfile
   
   # Enable the swap space
   swapon /swapfile
   
   # Make the swap file permanent across reboots
   echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
   ```

---

## Step 3: Clone the Repository & Setup Environment

While still SSH'd into your Droplet:

```bash
# Clone your project (replace with your repo URL)
git clone https://github.com/yourusername/interview-support.git
cd interview-support

# Create the backend environment file
cat <<EOT > api/.env
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_db_password
DB_DATABASE=interview_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_actual_gemini_api_key
EOT

# Create the frontend environment file
cat <<EOT > client/.env
# If you have a domain, use it here. Otherwise, use your Droplet's IP address
VITE_API_URL=http://<your-droplet-ip>/api
EOT
```

---

## Step 4: Verify Docker Files

Make sure your repository already contains the Dockerfiles and `docker-compose.prod.yml` as described in the AWS guide. If they are pushed to your repo, they will be pulled down automatically. 

*If they aren't in your repo yet, create them exactly as detailed in the original deployment documentation.*

---

## Step 5: Build and Deploy

Because you selected the Docker image from the DigitalOcean Marketplace, Docker and Docker Compose are already installed and running.

From the `interview-support` folder on your Droplet, run:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

Docker will now download the images, build your React and NestJS applications (using the swap file for extra memory), and start the containers.

To check the logs and ensure everything started correctly:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Step 6: Access Your App

1. Open your web browser.
2. Navigate to `http://<your-droplet-ip>`.
3. You should see your application running perfectly!

---

## Step 7: (Optional) Set up a Domain and HTTPS

Since DigitalOcean gives you a static IP address that doesn't change on reboot, connecting a domain name is very easy.

1. Go to your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare).
2. Create an **A Record** pointing `@` (or your subdomain) to your Droplet's IP address.
3. Update your `client/.env` on the Droplet to use your domain: `VITE_API_URL=https://yourdomain.com/api`
4. For free SSL (HTTPS), it is highly recommended to use **Nginx Proxy Manager** or **Traefik** in front of your containers, or simply route your domain through **Cloudflare** for instant, free SSL.
