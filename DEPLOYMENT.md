# 🚀 TalkBridge Deployment Guide (Production Setup)

This guide covers the two best ways to deploy TalkBridge so anyone on the internet can access it.

---

## 🌟 Architecture Overview
- **Frontend**: React (Vite) + Nginx SPA
- **Backend**: Spring Boot 3.3 (Java 21) + WebSocket STOMP + WebSockets
- **Database**: MySQL 8.0+

---

## ⚡ Option 1: Modern Cloud Deployment (Vercel + Railway / Render) — *Recommended for Beginners*

### Step 1: Deploy Database & Backend on Railway.app
1. Go to [Railway.app](https://railway.app) and sign in with GitHub.
2. Click **New Project** → **Provision MySQL**.
   - Note the connection variables: `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`.
3. In the same project, click **New** → **GitHub Repo** → select your `TalkBridge` repository.
4. Set the Root Directory to `/backend`.
5. Under **Variables**, add:
   ```env
   SPRING_DATASOURCE_URL=jdbc:mysql://${{MYSQLHOST}}:${{MYSQLPORT}}/${{MYSQLDATABASE}}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
   SPRING_DATASOURCE_USERNAME=${{MYSQLUSER}}
   SPRING_DATASOURCE_PASSWORD=${{MYSQLPASSWORD}}
   TALKBRIDGE_CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
   ```
6. Click **Deploy**. Railway will build the Spring Boot application and provide a public URL like `https://talkbridge-production.up.railway.app`.

---

### Step 2: Deploy Frontend on Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in.
2. Click **Add New** → **Project** → select `TalkBridge`.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   ```env
   VITE_API_BASE_URL=https://talkbridge-production.up.railway.app/api
   VITE_WS_URL=https://talkbridge-production.up.railway.app
   ```
5. Click **Deploy**.
6. In 60 seconds, your site will be live at `https://your-app.vercel.app`! 🎉

---

## 🐳 Option 2: 1-Command Docker Deployment (VPS: AWS EC2 / DigitalOcean / Hostinger)

If you have a Linux VPS (Ubuntu 22.04 / 24.04):

### Step 1: Install Docker & Docker Compose
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
```

### Step 2: Clone Repository & Run
```bash
git clone https://github.com/your-username/TalkBridge.git
cd TalkBridge

# Launch all 3 services (MySQL, Spring Boot, React/Nginx)
sudo docker compose up -d --build
```

### Step 3: Check Running Status
```bash
sudo docker compose ps
sudo docker compose logs -f
```
Your application will be live at `http://your-server-ip`!

---

### Step 4: Add Free SSL (HTTPS) with Certbot
Install Certbot with Nginx on your host:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🛠️ Environment Variables Reference

| Variable | Description | Example |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC Connection String | `jdbc:mysql://host:3306/talkbridge_db` |
| `SPRING_DATASOURCE_USERNAME` | MySQL Username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL Password | `your_secure_password` |
| `TALKBRIDGE_CORS_ALLOWED_ORIGINS` | Comma-separated frontend domains | `https://talkbridge.vercel.app` |
| `VITE_API_BASE_URL` | Frontend API Target | `https://api.yourdomain.com/api` |
| `VITE_WS_URL` | Frontend WebSocket Target | `https://api.yourdomain.com` |
