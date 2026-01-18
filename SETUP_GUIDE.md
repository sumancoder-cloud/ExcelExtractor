# ExcelExtractor - Complete Setup Guide 🚀

## Project Overview
ExcelExtractor converts PDFs, invoices, bills, and images (JPG, PNG, WEBP) into editable Excel files using OCR technology.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Axios
- **Backend:** Node.js, Express, MongoDB
- **Key Libraries:** Multer, Tesseract.js (OCR), pdf-parse, xlsx, bcrypt, JWT

---

## Prerequisites
1. **Node.js** (v18 or higher)
2. **MongoDB** installed and running locally
   - Download: https://www.mongodb.com/try/download/community
   - Default connection: `mongodb://localhost:27017`

---

## Installation Steps

### 1. Install All Dependencies
```bash
# From project root
npm run install:all
```

### 2. Start MongoDB
```bash
# Windows (if installed as service)
net start MongoDB

# Or run mongod directly
mongod
```

### 3. Configure Backend Environment
The `.env` file is already created in `backend/` folder with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/excelextractor
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
NODE_ENV=development
```

### 4. Start the Application
```bash
# From project root - starts both frontend and backend
npm run dev
```

This will start:
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

### 5. Configure Google OAuth (Optional)
To enable Google sign-in functionality:

1. **Create Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (for development)
     - Your production domain + `/api/auth/google/callback`
   - Add authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production domain

2. **Update Environment Variables:**
   - In `backend/.env`, replace the placeholder values:
   ```
   GOOGLE_CLIENT_ID=your_actual_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
   ```

3. **Update Frontend Configuration:**
   - In `ExcelExtractor/src/main.jsx`, replace the placeholder:
   ```javascript
   clientId="your_actual_google_client_id_here"
   ```

4. **Restart the Application:**
   ```bash
   npm run dev
   ```

**Note:** Google OAuth is optional. The app works perfectly with email/password authentication.

---

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### File Conversion
- `POST /api/convert/upload` - Upload & convert file (Protected Route)
  - Accepts: PDF, JPG, PNG, WEBP
  - Max size: 5MB
  - Returns: Excel (.xlsx) file

---

## Features Implemented ✅

### Backend
- ✅ MongoDB database connection
- ✅ User authentication with JWT & bcrypt
- ✅ Protected routes middleware
- ✅ File upload with Multer (PDF & Images)
- ✅ PDF to Excel conversion (pdf-parse + xlsx)
- ✅ Image to Excel conversion (Tesseract OCR + xlsx)
- ✅ Automatic file cleanup after conversion
- ✅ CORS configured for frontend

### Frontend
- ✅ Authentication context & protected routes
- ✅ Login/Signup with form validation
- ✅ File upload with progress bar
- ✅ Support for PDF and Images (JPG, PNG, WEBP)
- ✅ Automatic Excel file download
- ✅ User welcome message and logout
- ✅ Responsive design (mobile-first)

---

## File Structure
```
ExcelExtractor/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── middleware/
│   │   └── auth.js                  # JWT authentication middleware
│   ├── models/
│   │   └── User.js                  # User model (mongoose)
│   ├── routes/
│   │   ├── authRoutes.js           # Login/Signup/Logout
│   │   └── convertRoutes.js        # File conversion
│   ├── utils/
│   │   ├── converter.js            # PDF/Image to Excel logic
│   │   └── generateToken.js        # JWT token generator
│   ├── uploads/                     # Temporary file storage (auto-created)
│   ├── .env                         # Environment variables
│   ├── .gitignore
│   ├── index.js                     # Express server
│   └── package.json
│
└── ExcelExtractor/
    ├── src/
    │   ├── api/
    │   │   └── index.js             # Axios API calls
    │   ├── Components/
    │   │   └── ProtectedRoute.jsx   # Route protection
    │   ├── context/
    │   │   └── AuthContext.jsx      # Auth state management
    │   ├── Pages/
    │   │   ├── LandingPage.jsx      # Home page
    │   │   ├── LoginPage.jsx        # Login form
    │   │   ├── SignupPage.jsx       # Signup form
    │   │   ├── MainPage.jsx         # Conversion interface (protected)
    │   │   └── PageNotFound.jsx     # 404 page
    │   ├── App.jsx                   # App routing
    │   └── main.jsx                  # Entry point
    └── package.json

```

---

## Usage Guide

### 1. Create Account
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Fill in your details:
   - Full Name
   - Email
   - Password (min 6 chars, 1 uppercase, 1 number)
4. Click "Sign Up"

### 2. Login
1. Click "Login"
2. Enter email and password
3. You'll be redirected to the Main Page

### 3. Convert Files
1. On Main Page, click or drag-and-drop:
   - **PDF files** (invoices, documents)
   - **Image files** (bills, receipts - JPG, PNG, WEBP)
2. Wait for upload & conversion (progress bar shows status)
3. Excel file automatically downloads
4. Open the `.xlsx` file in Excel or Google Sheets

---

## How It Works

### PDF Conversion
1. User uploads PDF
2. Backend extracts text using `pdf-parse`
3. Text is parsed into table structure
4. Converted to Excel using `xlsx` library
5. Excel file sent back for download

### Image Conversion (OCR)
1. User uploads image (invoice/bill)
2. Backend uses **Tesseract.js** for OCR
3. Extracts text from image
4. Detects table patterns and key-value pairs
5. Structures data into Excel format
6. Excel file sent back for download

---

## Troubleshooting

### MongoDB Connection Error
```
Error: MongooseServerSelectionError
```
**Solution:** Start MongoDB service
```bash
net start MongoDB
```

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution:** Change PORT in backend/.env or kill the process

### File Upload Fails
- Check file size (max 5MB)
- Ensure file type is PDF, JPG, PNG, or WEBP
- Check MongoDB is running (authentication required)

### OCR Not Working
- Tesseract.js downloads language data on first use (may take time)
- Ensure image is clear and text is readable
- English language is supported by default

---

## Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ Protected API routes
- ✅ File type validation
- ✅ File size limits
- ✅ Automatic file cleanup

---

## Future Enhancements
- ✅ Google OAuth integration
- [ ] Multiple file upload
- [ ] Table detection algorithm improvement
- [ ] More language support for OCR
- [ ] User file history
- [ ] Cloud storage integration
- [ ] Batch processing

---

## Support
For issues or questions, create an issue in the repository.

**Author:** Tati Suman Yadav  
**License:** ISC

---

## Quick Start Commands
```bash
# Install dependencies
npm run install:all

# Start MongoDB
net start MongoDB

# Run application (both frontend & backend)
npm run dev

# Access application
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

🎉 **Your ExcelExtractor is ready to use!**
