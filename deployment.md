# AWS EC2 Deployment Guide

This guide covers deploying the Interview Support application to a single AWS EC2 instance using Docker Compose. This approach containerizes the frontend, backend, database, and cache, making it highly portable and easy to spin up.

## Prerequisites
- An AWS Account
- A registered domain name (optional, but recommended for a professional showcase)
- Your project pushed to a Git repository (e.g., GitHub, GitLab)

---

## Step 1: Provision an EC2 Instance

1. Log into your AWS Console and navigate to **EC2**.
2. Click **Launch Instance**.
3. **Name**: `interview-support-server`
4. **AMI**: Select **Ubuntu Server 22.04 LTS**.
5. **Instance Type**: `t3.small` (Recommended over `t2.micro` since building React and NestJS can consume >1GB of RAM).
6. **Key Pair**: Create a new key pair (e.g., `interview-key.pem`) and download it. Keep it secure.
7. **Network Settings**: 
   - Check **Allow SSH traffic**
   - Check **Allow HTTP traffic** (Port 80)
   - Check **Allow HTTPS traffic** (Port 443)
8. **Storage**: Allocate at least **15 GB** of gp3 storage.
9. Click **Launch Instance**.

---

## Step 2: Install Docker on the Server

Once the instance is running, SSH into it using your terminal:

```bash
chmod 400 interview-key.pem
ssh -i "interview-key.pem" ubuntu@<your-ec2-public-ip>
```

Update packages and install Docker and Docker Compose:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y

# Install Docker Compose
sudo apt install docker-compose -y

# Start Docker and enable it to run on boot
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group so you don't need 'sudo' for every command
sudo usermod -aG docker $USER

# Exit and SSH back in for the group changes to take effect
exit
```

---

## Step 3: Clone the Repository & Setup Environment

SSH back into your instance.

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
# If you have a domain, use it here. Otherwise, use your EC2 Public IP
VITE_API_URL=http://<your-ec2-public-ip>/api
EOT
```

---

## Step 4: Containerize the Application

To run the whole stack via Docker Compose, you need to add Dockerfiles to your project and create a production compose file. 

*(Note: You can commit these files to your Git repo before pulling on the server).*

### 1. Backend Dockerfile (`api/Dockerfile`)
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

### 2. Frontend Dockerfile (`client/Dockerfile`)
```dockerfile
# Build stage
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage using Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config to route traffic correctly (SPA routing)
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Production Docker Compose (`docker-compose.prod.yml`)
Create this in the root of your project:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your_secure_db_password
      POSTGRES_DB: interview_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    restart: always
    volumes:
      - redis_data:/data

  api:
    build:
      context: ./api
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USERNAME=postgres
      - DB_PASSWORD=your_secure_db_password
      - DB_DATABASE=interview_db
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=your_super_secret_jwt_key
      - GEMINI_API_KEY=your_actual_gemini_api_key
    depends_on:
      - postgres
      - redis

  client:
    build:
      context: ./client
    restart: always
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
```

---

## Step 5: Build and Deploy

From the root of your project on the EC2 instance, run:

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

Docker will download the necessary images, install dependencies, build the React frontend, build the NestJS backend, and start all four containers in the background.

To check the logs if something goes wrong:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

---

## Step 6: Access Your Showcase!

1. Open your web browser.
2. Navigate to `http://<your-ec2-public-ip>`.
3. You should see your beautiful React application served by Nginx. 
4. The frontend will communicate with the backend via the `VITE_API_URL` you specified in Step 3.

*Pro-tip: If you register a domain, you can use Nginx Proxy Manager or Traefik in your docker-compose file to automatically generate free Let's Encrypt SSL certificates for HTTPS.*

---

## Step 7: Migrating Local Data to Production (Optional)

If you have users, projects, or transcriptions in your local Docker Postgres database that you want to move to your new EC2 instance, you can easily export and import them.

### 1. Export local database
On your local machine, find your running postgres container name (e.g., `interview-support-postgres-1`) and run:
```bash
docker exec -t <your_local_postgres_container_name> pg_dump -U postgres -d interview_db -c -F p > backup.sql
```
*(The `-c` flag ensures it drops existing tables on the target before recreating them).*

### 2. Transfer to EC2
Use `scp` to securely copy the file to your EC2 instance:
```bash
scp -i "interview-key.pem" backup.sql ubuntu@<your-ec2-public-ip>:~/interview-support/
```

### 3. Import into Production
SSH back into your EC2 instance, navigate to the folder, and import the SQL file directly into the running production Postgres container:
```bash
cd ~/interview-support
cat backup.sql | docker exec -i <your_prod_postgres_container_name> psql -U postgres -d interview_db
```

Your EC2 deployment now has an exact copy of your local database!
