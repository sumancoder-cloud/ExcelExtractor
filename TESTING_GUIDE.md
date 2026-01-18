# 🧪 Testing Guide - ExcelExtractor

## Step 1: Start MongoDB

### Option A: Start Local MongoDB (Run CMD as Administrator)
```bash
# Right-click Command Prompt -> Run as Administrator
net start MongoDB
```

### Option B: Use MongoDB Atlas (FREE - No installation)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster (M0)
4. Click "Connect" -> "Connect your application"
5. Copy connection string
6. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/excelextractor
```

---

## Step 2: Start Backend Server

Open Terminal 1:
```bash
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor\backend"
npm run dev
```

**Expected Output:**
```
Server is running on port 5000
MongoDB Connected: localhost (or your cluster)
```

---

## Step 3: Start Frontend

Open Terminal 2:
```bash
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor\ExcelExtractor"
npm run dev
```

**Expected Output:**
```
VITE ready in XXX ms
Local: http://localhost:5173
```

---

## Step 4: Test the Application

### Test 1: Backend Health Check
Open browser: http://localhost:5000/api/health

**Expected Response:**
```json
{"success": true, "message": "Server is running"}
```

### Test 2: Frontend
Open browser: http://localhost:5173

**You should see:**
- Landing page with "ExcelExtractor" header
- Login and SignUp buttons
- File upload area

### Test 3: Create Account
1. Click "Sign Up"
2. Fill in:
   - Full Name: Test User
   - Email: test@example.com
   - Password: Test123
   - Confirm Password: Test123
3. Click "Sign Up"

**Expected:**
- Alert: "Account created successfully!"
- Redirects to Login page

### Test 4: Login
1. Enter credentials:
   - Email: test@example.com
   - Password: Test123
2. Click "Login"

**Expected:**
- Alert: "Login successful!"
- Redirects to Main Page
- Shows: "Welcome, Test User!"

### Test 5: Upload & Convert File
1. On Main Page, click the upload area
2. Select a PDF or Image file (JPG, PNG)
3. Wait for progress bar

**Expected:**
- Progress bar shows upload status
- Excel file automatically downloads
- File named: converted.xlsx

### Test 6: Open Excel File
1. Open the downloaded converted.xlsx
2. Check if data is extracted

---

## 🐛 Troubleshooting

### "MongoDB connection failed"
**Problem:** MongoDB not running
**Solution:** 
```bash
# Run as Administrator
net start MongoDB
```
OR use MongoDB Atlas (cloud)

### "Cannot GET /"
**Problem:** Wrong URL
**Solution:** Use http://localhost:5173 (not 5000)

### "Network Error" in browser console
**Problem:** Backend not running
**Solution:** 
```bash
cd backend
npm run dev
```

### Port already in use
**Problem:** Port 5000 or 5173 is busy
**Solution:** Kill the process or change ports in .env

---

## 🎯 Quick Test Commands

### Test Backend Only:
```bash
cd backend
node index.js
```

### Test Frontend Only:
```bash
cd ExcelExtractor
npm run dev
```

### Test Both (Recommended):
```bash
# From project root
npm run dev
```

---

## ✅ Success Checklist

- [ ] MongoDB running (check: `sc query MongoDB`)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access landing page
- [ ] Can create account
- [ ] Can login
- [ ] Can upload file
- [ ] Excel downloads successfully
- [ ] Can open Excel file with data

---

## 📞 Still Not Working?

1. Check terminal for error messages
2. Check browser console (F12) for errors
3. Verify all dependencies installed: `npm run install:all`
4. Try clearing browser cache
5. Restart both servers

---

## 🔍 Manual Testing Without MongoDB

If you want to test WITHOUT database (temporary):

### Create Test Server (No DB):
Create `backend/test-server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server running!' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ 
    success: true, 
    user: { id: '1', fullName: 'Test User', email: req.body.email },
    token: 'test-token-123'
  });
});

app.listen(5000, () => console.log('Test server on port 5000'));
```

Run: `node backend/test-server.js`

This lets you test frontend without MongoDB!
