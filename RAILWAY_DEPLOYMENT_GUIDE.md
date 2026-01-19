# 🚀 Complete Deployment Guide - Railway

## Overview
This guide covers deploying your full-stack ExcelExtractor on Railway with both React frontend and Node.js backend.

---

## Step 1: Prepare Your Project

### 1.1 Update Package.json Files

**Backend** - `backend/package.json`
```json
{
  "name": "excelextractor-backend",
  "version": "1.0.0",
  "description": "ExcelExtractor API Server",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "multer": "^1.4.5-lts.1",
    "nodemailer": "^6.9.1",
    "dotenv": "^16.0.3",
    "cors": "^2.8.5",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0"
  }
}
```

**Frontend** - `ExcelExtractor/package.json`
```json
{
  "name": "excelextractor-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "vite preview --port 3000"
  },
  "engines": {
    "node": "18.x"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "axios": "^1.3.2",
    "@react-oauth/google": "^0.12.0",
    "react-toastify": "^9.1.2",
    "framer-motion": "^10.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^3.1.0",
    "vite": "^4.2.0",
    "tailwindcss": "^3.2.7",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

### 1.2 Create a Root `package.json` (for monorepo)

In project root: `package.json`
```json
{
  "name": "excelextractor",
  "version": "1.0.0",
  "description": "AI-Powered PDF & Image to Excel Converter",
  "private": true,
  "scripts": {
    "install-all": "npm install && cd backend && npm install && cd ../ExcelExtractor && npm install",
    "dev": "concurrently \"cd backend && npm run dev\" \"cd ExcelExtractor && npm run dev\"",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "echo 'Backend ready'",
    "build:frontend": "cd ExcelExtractor && npm install && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.0.1"
  }
}
```

---

## Step 2: Environment Variables Setup

### 2.1 Backend `.env` File
```
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/excelextractor?retryWrites=true&w=majority

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Google OAuth
GOOGLE_CLIENT_ID=893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-_your_secret_here

# App Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-url.com
```

### 2.2 Frontend `.env` File
```
VITE_API_URL=https://your-backend-url.railway.app
VITE_GOOGLE_CLIENT_ID=893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com
```

---

## Step 3: Prepare Your Code for Deployment

### 3.1 Update Backend API Base URL

In `backend/index.js`, make sure CORS is configured for production:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### 3.2 Update Frontend API Configuration

In `ExcelExtractor/src/api/index.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});
```

### 3.3 Add a Procfile (for non-Node deployments)

**Root level Procfile** (optional):
```
web: cd backend && npm start
```

---

## Step 4: Deploy on Railway

### 4.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (recommended)
3. Create new project

### 4.2 Deploy Backend

**Option A: From GitHub (Recommended)**

1. Click "New" → "Project from GitHub repo"
2. Select `sumancoder-cloud/ExcelExtractor`
3. Railway detects it as Node.js project
4. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

5. Go to "Variables" tab and add:
   ```
   MONGODB_URI=your_mongodb_uri
   EMAIL_USER=your_email
   EMAIL_PASSWORD=your_password
   GOOGLE_CLIENT_ID=your_id
   GOOGLE_CLIENT_SECRET=your_secret
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend.railway.app
   PORT=5000
   ```

6. Click "Deploy" ✅

**Get your backend URL:**
- Railway generates: `your-backend.railway.app`
- Copy this for frontend configuration

### 4.3 Deploy Frontend

1. Click "New" → "Project from GitHub repo" again
2. Select same repo
3. Configure:
   - **Root Directory**: `ExcelExtractor`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview` or `npm start`
   - **Port**: 3000

4. Add Variables:
   ```
   VITE_API_URL=https://your-backend.railway.app
   VITE_GOOGLE_CLIENT_ID=893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com
   ```

5. Click "Deploy" ✅

---

## Step 5: Post-Deployment Configuration

### 5.1 Update Google OAuth Settings

In [Google Cloud Console](https://console.cloud.google.com):

1. Go to "Credentials"
2. Click your OAuth 2.0 Client ID
3. Add authorized JavaScript origins:
   ```
   https://your-frontend.railway.app
   http://localhost:5174
   ```
4. Add authorized redirect URIs:
   ```
   https://your-frontend.railway.app/api/auth/google/callback
   http://localhost:5174/api/auth/google/callback
   ```

### 5.2 Update MongoDB Connection

Make sure your MongoDB Atlas allows connections from Railway:

1. Login to MongoDB Atlas
2. Go to "Network Access"
3. Add IP: `0.0.0.0/0` (allow all, or specify Railway IPs)
4. Click "Confirm"

### 5.3 Test Email Configuration

Send test email to verify Gmail SMTP:
- Use the email address configured in `.env`
- Verify app-specific password is working

---

## Step 6: Testing Deployment

### 6.1 Test Backend API

```bash
# Check if backend is running
curl https://your-backend.railway.app/api/health

# Expected response:
# {"status":"ok","message":"API is running"}
```

### 6.2 Test Frontend

1. Open `https://your-frontend.railway.app` in browser
2. Test signup/login
3. Try Google OAuth
4. Upload and convert a file
5. Check history

### 6.3 Check Logs

In Railway dashboard:

**Backend logs:**
- Click backend service → "Logs" tab
- Look for "Server running on port 5000"

**Frontend logs:**
- Click frontend service → "Logs" tab
- Look for build success message

---

## Step 7: Configure Custom Domain (Optional)

### 7.1 Add Custom Domain

1. In Railway dashboard → Your frontend service
2. Click "Settings"
3. Go to "Domains"
4. Click "Add Domain"
5. Enter your domain: `myapp.com`
6. Update your domain DNS:
   ```
   CNAME: your-frontend.railway.app
   ```

### 7.2 Configure Backend Subdomain

1. Add backend domain: `api.myapp.com`
2. Update backend `FRONTEND_URL` variable to `https://myapp.com`
3. Update frontend `VITE_API_URL` to `https://api.myapp.com`

---

## Troubleshooting

### Issue: "Cannot POST /api/convert"
**Solution**: Check backend is deployed and `FRONTEND_URL` in backend env vars is correct

### Issue: Frontend shows blank page
**Solution**: 
- Check `VITE_API_URL` in frontend env vars
- Check browser console for errors
- Verify backend is running: `curl https://backend-url.railway.app/api/health`

### Issue: Google OAuth not working
**Solution**:
- Add frontend URL to Google Console authorized origins
- Check `VITE_GOOGLE_CLIENT_ID` is correct in frontend
- Verify `GOOGLE_CLIENT_ID` in backend

### Issue: Email not sending
**Solution**:
- Verify Gmail app-specific password (not regular password)
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in backend env vars
- Enable "Less secure app access" if needed

### Issue: MongoDB connection failed
**Solution**:
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas allows Railway IP (0.0.0.0/0)
- Test connection string locally first

---

## Monitoring & Maintenance

### View Logs
1. Railway Dashboard → Select service
2. Click "Logs" tab
3. Monitor errors in real-time

### Check Metrics
1. Click "Metrics" tab
2. View CPU, Memory, Network usage
3. Set up alerts if needed

### Update Environment Variables
1. Go to service → "Variables"
2. Edit any variable
3. Railway auto-redeploys
4. Check "Logs" tab to verify deployment

### Rollback to Previous Version
1. Click "Deployments" tab
2. Select previous deployment
3. Click "Redeploy"

---

## Cost & Limits

| Resource | Free Tier | Usage |
|----------|-----------|-------|
| Backend | $5/month credit | Unlimited (within credit) |
| Frontend | $5/month credit | Unlimited (within credit) |
| MongoDB | Free tier (512MB) | 5GB recommended |
| Monthly Cost | ~$10/month | For both services |

---

## Next Steps

✅ Deployed! Now:
1. Test all features in production
2. Collect user feedback
3. Monitor logs and errors
4. Plan feature updates
5. Consider adding SSL certificate
6. Set up automated backups

---

## Support

- 📖 [Railway Docs](https://docs.railway.app)
- 💬 [Railway Discord Community](https://discord.com/invite/railway)
- 🐞 Check deployment logs for errors
- 📧 Contact your maintainer

---

**Happy Deploying! 🚀**
