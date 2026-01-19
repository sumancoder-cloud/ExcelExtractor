# Google Sign-In Setup Guide

## ✅ What's Already Set Up

Your Google OAuth credentials are configured:
- ✅ Backend has `GOOGLE_CLIENT_ID` in `.env`
- ✅ Frontend `main.jsx` now has the correct Google Client ID
- ✅ Backend has `/api/auth/google-login` endpoint
- ✅ CORS is configured for localhost
- ✅ `@react-oauth/google` package is installed

## 🔍 How to Debug Google Sign-In

### 1. Check Browser Console
- Open DevTools (F12)
- Go to **Console** tab
- Click "Continue with Google" button
- Look for any error messages

### 2. Common Issues & Solutions

**Issue: "Google is not defined"**
- Solution: Make sure `GoogleOAuthProvider` wraps the app in `main.jsx` ✅ (Already fixed)

**Issue: Invalid Client ID**
- Solution: Use the correct Client ID: `893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com` ✅ (Already set)

**Issue: Redirect URI mismatch**
- Make sure `http://localhost:5174` is added in Google Cloud Console
- See steps below

**Issue: "Access denied" or CORS error**
- Make sure backend is running on port 5000
- Check that `/api/auth/google-login` endpoint exists

### 3. Google Cloud Console Configuration

Your credentials come from Google Cloud Console. To verify they're correct:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **Credentials** → **OAuth 2.0 Client IDs**
4. Find the Web client credentials
5. In **Authorized JavaScript origins**, add:
   - `http://localhost:5174`
   - `http://localhost:3000` (if testing on different port)
6. In **Authorized redirect URIs**, add:
   - `http://localhost:5174`
   - `http://localhost:5000/api/auth/google/callback`

### 4. Test Google Sign-In

**Step 1:** Make sure both servers are running
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend  
npm run dev
```

**Step 2:** Open http://localhost:5174

**Step 3:** Go to **Login page**

**Step 4:** Click **"Continue with Google"** button

**Step 5:** 
- If popup appears → Sign in with your Google account
- If no popup → Check browser console for errors
- If redirect → You're signed in!

## 🔧 Backend Endpoint Details

**Endpoint:** `POST /api/auth/google-login`

**Request Body:**
```json
{
  "googleId": "unique_google_id",
  "email": "user@gmail.com",
  "fullName": "User Name",
  "picture": "https://profile-picture-url"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "mongodb_user_id",
    "fullName": "User Name",
    "email": "user@gmail.com"
  },
  "token": "jwt_token_here"
}
```

## 📱 Frontend Flow

1. User clicks "Continue with Google"
2. Google popup opens
3. User signs in with Google
4. App gets access token
5. App calls Google API to get user info
6. App sends user info to `/api/auth/google-login`
7. Backend creates/updates user in database
8. Backend returns JWT token
9. App saves token to localStorage
10. App redirects to `/main` page

## 🐛 Debugging Checklist

- [ ] Both frontend and backend servers are running
- [ ] Google Client ID is correct in `main.jsx` (set to: `893757339520-psp48g6oit33ar7qadu5mv0cjogaq9op.apps.googleusercontent.com`)
- [ ] `http://localhost:5174` is in Google Cloud Console **Authorized JavaScript origins**
- [ ] Backend CORS allows requests from `http://localhost:5174`
- [ ] No errors in browser console
- [ ] Google popup opens when clicking the button
- [ ] Backend `/api/auth/google-login` endpoint exists and works

## 🔗 Using the Authenticated User

After Google sign-in, the user is:
- ✅ Created/updated in MongoDB
- ✅ Authenticated with JWT token
- ✅ Can access protected routes (`/main`, `/profile`, `/history`)
- ✅ Token stored in localStorage

## 🚀 Next Steps

If Google Sign-In still isn't working:

1. **Check console errors** → Copy the exact error
2. **Test the backend endpoint** → Use Postman to test `/api/auth/google-login`
3. **Verify credentials** → Go to Google Cloud Console and verify Client ID
4. **Check redirect URIs** → Make sure `http://localhost:5174` is authorized

Let me know what error you see in the console, and I can help fix it!
