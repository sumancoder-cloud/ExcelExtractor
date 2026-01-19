# GitHub & Deployment Guide

## 📌 Part 1: Push to GitHub

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Sign in with your GitHub account (or create one)
3. Repository name: `ExcelExtractor`
4. Description: `Excel file extractor using PDF and image conversion`
5. Choose: **Public** (for portfolio) or **Private** (for personal)
6. Click "Create repository"
7. Copy the repository URL (e.g., `https://github.com/yourusername/ExcelExtractor.git`)

---

### Step 2: Initialize Git & Push Code

Open terminal in your project root folder:

```bash
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor"

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Full stack Excel extractor with OTP-based password reset, file conversion, and user management"

# Add remote repository (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/ExcelExtractor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

### Step 3: Verify GitHub Push

1. Go to your GitHub repository URL
2. Should see all your files there
3. Verify: `backend/`, `ExcelExtractor/`, config files all present

---

## 🚀 Part 2: Deployment Options

### Option A: Azure (Recommended - Most Professional)

**Why Azure?**
- Free tier available
- Supports Node.js + React
- MongoDB Atlas integration easy
- Great for production

**Steps:**

1. **Create Azure Account:**
   - Go to https://azure.microsoft.com/free/
   - Sign up (get $200 free credits)

2. **Deploy Backend to Azure App Service:**
   ```bash
   # Install Azure CLI
   # https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
   
   # Login to Azure
   az login
   
   # Create resource group
   az group create --name ExcelExtractorRG --location eastus
   
   # Create App Service Plan
   az appservice plan create --name ExcelExtractorPlan --resource-group ExcelExtractorRG --sku B1
   
   # Create Web App
   az webapp create --resource-group ExcelExtractorRG --plan ExcelExtractorPlan --name excel-extractor-api --runtime "node|18"
   ```

3. **Deploy Frontend to Azure Static Web Apps:**
   - Build: `npm run build`
   - Deploy to Static Web Apps
   - Connect to GitHub for auto-deploy

---

### Option B: Vercel (Easiest for Frontend)

**Why Vercel?**
- Made by Next.js team
- Instant deployment from GitHub
- Free tier
- Perfect for React apps

**Frontend Deployment:**

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Import Project"
4. Select your GitHub repository
5. Click "Deploy"
6. Get your URL (e.g., `excelextractor.vercel.app`)

**Setup environment:**
- Add VITE_API_URL: `https://your-backend-url.com`

---

### Option C: Heroku (Simple & Quick)

**Why Heroku?**
- Simple deployment
- Good for backends
- Free tier (though limited now)

**Backend Deployment:**

1. Create Heroku account: https://heroku.com
2. Install Heroku CLI
3. From backend folder:
   ```bash
   heroku login
   heroku create excel-extractor-api
   git push heroku main
   ```

---

### Option D: Railway (Modern Alternative)

**Why Railway?**
- Easy deployment
- Free credits monthly
- Good pricing

**Steps:**
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project
4. Connect repository
5. Deploy

---

## 📋 Deployment Checklist

### Before Deploying:

- [ ] All code committed to GitHub
- [ ] `.env` file NOT in GitHub (use .gitignore)
- [ ] `.gitignore` file created
- [ ] No hardcoded secrets/passwords in code
- [ ] Backend and frontend tested locally
- [ ] MongoDB Atlas connection string ready
- [ ] Email credentials configured (Gmail)
- [ ] Google OAuth Client ID tested

### Create .gitignore file

Create `ExcelExtractor/.gitignore`:
```
node_modules/
dist/
.env
.env.local
.env.*.local
*.log
build/
```

Create `backend/.gitignore`:
```
node_modules/
.env
.env.local
*.log
uploads/
mongodb-data/
```

---

## 🔐 Environment Variables for Production

### Frontend (.env or .env.production)
```
VITE_API_URL=https://your-backend-domain.com
VITE_GOOGLE_CLIENT_ID=893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com
```

### Backend (.env on hosting platform)
```
MONGODB_URI=your_mongodb_atlas_connection_string
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-app-specific-password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

---

## 🎯 Recommended Setup: Azure + GitHub

### Complete Steps:

1. **Push to GitHub** (see Part 1 above)

2. **Deploy Backend to Azure:**
   - Create Azure App Service
   - Connect to GitHub (auto-deploy)
   - Set environment variables in Azure Portal
   - Get URL (e.g., `excel-extractor-api.azurewebsites.net`)

3. **Deploy Frontend to Azure Static Web Apps:**
   - Or use Vercel (easier)
   - Set VITE_API_URL to Azure backend URL
   - Deploy from GitHub

4. **Update Google OAuth:**
   - Add `your-frontend-domain.com` to Google Cloud Console
   - Update GOOGLE_CLIENT_ID if needed

5. **Update Frontend API URL:**
   - Change `http://localhost:5000` to your Azure backend URL
   - Rebuild and redeploy

---

## 📝 API URL Update

In `ExcelExtractor/src/api/index.js`, change:
```javascript
// Before
const API = 'http://localhost:5000/api';

// After (production)
const API = 'https://your-backend-domain.com/api';
```

Or use environment variables:
```javascript
const API = process.env.VITE_API_URL + '/api';
```

---

## ✅ Quick GitHub Push Guide

**Just want to push quickly? Run these commands:**

```bash
# Go to project folder
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor"

# Create .gitignore
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore
echo "dist/" >> .gitignore
echo "build/" >> .gitignore

# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial commit: Excel Extractor with OTP password reset, multiple file conversion, user profiles, and conversion history"

# Add remote (replace URL with yours)
git remote add origin https://github.com/YOUR_USERNAME/ExcelExtractor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 Deployment Quick Comparison

| Platform | Backend | Frontend | Cost | Ease |
|----------|---------|----------|------|------|
| Azure | ✅ | ✅ | Free tier | Medium |
| Vercel | ❌ | ✅ | Free | Very Easy |
| Heroku | ✅ | ✅ | Limited | Easy |
| Railway | ✅ | ✅ | Free tier | Easy |
| AWS | ✅ | ✅ | Complex | Hard |

**Recommended:** Azure (backend) + Vercel (frontend)

---

## 📞 Next Steps

1. **Do you want to:**
   - [ ] Just push to GitHub first?
   - [ ] Deploy to Azure?
   - [ ] Use Vercel for frontend?
   - [ ] Deploy to Heroku?

2. **Tell me which option you prefer, and I'll help with detailed steps!**

---

## 🎯 Your Project Info (for deployment)

**Repository:** ExcelExtractor
**Backend:** Node.js + Express + MongoDB
**Frontend:** React + Vite + Tailwind
**Features:** 
- User authentication (signup, login, Google OAuth)
- OTP-based password reset
- PDF/Image to Excel conversion
- Multiple file handling
- User profiles
- Conversion history
- File persistence (7-day TTL)

---

## ⚠️ Important Before Deploying:

1. **Never commit `.env` file!**
   - Add to .gitignore
   - Set in hosting platform settings

2. **Test production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

3. **Check all third-party services:**
   - MongoDB Atlas (accessible from deployment server)
   - Google OAuth (authorized domains updated)
   - Email (Gmail credentials work)

---

Let me know what you want to do! Ready to help! 🚀
