# Quick Testing Script - Run These Tests Now

## 🎯 Fast Testing Flow (30 minutes)

### Setup (2 minutes)
1. Open 2 terminals
2. Terminal 1: `npm run dev:backend` (should show "Server running on port 5000")
3. Terminal 2: `npm run dev` (should show "Frontend running on http://localhost:5174")
4. Open browser: http://localhost:5174

---

## ✅ Test #1: Basic Signup (3 minutes)

```
1. On login page, switch to "Sign Up"
2. Fill form:
   - Full Name: John Test
   - Email: john.test.2025@gmail.com
   - Password: Test@12345
   - Confirm Password: Test@12345
3. Click "Sign Up"
4. Should see: "Account created successfully!"
5. Should redirect to MainPage
6. ✅ PASS if logged in successfully
```

---

## ✅ Test #2: Login (2 minutes)

```
1. Logout from account menu
2. Go to http://localhost:5174/login
3. Login mode (toggle if needed)
4. Enter email: john.test.2025@gmail.com
5. Enter password: Test@12345
6. Click "Login"
7. Should redirect to MainPage
8. ✅ PASS if logged in successfully
```

---

## ✅ Test #3: Password Reset with OTP (5 minutes)

```
1. Logout
2. Click "Forgot Password?"
3. Enter email: john.test.2025@gmail.com
4. Click "Send OTP"
5. Check Gmail inbox/spam for OTP email
6. Copy the 6-digit OTP
7. Enter OTP in the form
8. Click "Verify OTP"
9. Enter new password: NewPass@12345
10. Confirm password: NewPass@12345
11. Click "Reset Password"
12. Should see success message
13. Login with NEW password
14. ✅ PASS if login works with new password
```

---

## ✅ Test #4: Single File Conversion (5 minutes)

```
1. Logged in on MainPage
2. Click "Select Files"
3. Choose 1 PDF or image file
4. Click "Convert"
5. Should see ConversionAnimation page
6. Should see file in table with name
7. Wait for conversion to complete
8. Should see "Download" and "Preview" buttons
9. Click "Preview" - should show extracted text
10. Click "Download" - should download Excel file
11. ✅ PASS if file downloads and preview works
```

---

## ✅ Test #5: Multiple Files (5 minutes)

```
1. Go back to MainPage
2. Click "Select Files"
3. Choose 4-5 files (mix of PDFs and images)
4. Click "Convert"
5. Should see ALL files in table
6. All files should have names visible
7. Each file should show conversion progress
8. All should complete successfully
9. Download each file
10. ✅ PASS if all files show and download
```

---

## ✅ Test #6: Profile Page (3 minutes)

```
1. Click account menu (top right)
2. Click "Profile"
3. Should see current name and email
4. Click "Edit Profile" tab
5. Change name to "John Updated"
6. Click "Save Changes"
7. Should see success message
8. Reload page - name should persist
9. ✅ PASS if profile updates and persists
```

---

## ✅ Test #7: Conversion History (3 minutes)

```
1. Click account menu
2. Click "Conversion History"
3. Should see all past conversions
4. Click preview on any item - should show text
5. Click download - should download Excel
6. Click delete - should remove from history
7. ✅ PASS if history works correctly
```

---

## ✅ Test #8: Google Sign-In (3 minutes)

```
1. Logout
2. Go to login page
3. Click "Continue with Google"
4. Google popup should open
5. Sign in with your Google account
6. Should auto-redirect to MainPage
7. Should be logged in with Google account
8. ✅ PASS if Google login works
```

---

## ✅ Test #9: Logout & Protected Routes (2 minutes)

```
1. Click account menu → Logout
2. Try to access http://localhost:5174/main
3. Should redirect to login
4. Try http://localhost:5174/profile
5. Should redirect to login
6. Try http://localhost:5174/history
7. Should redirect to login
8. ✅ PASS if all routes are protected
```

---

## ✅ Test #10: Error Handling (2 minutes)

```
1. Try login with wrong password
2. Should show error message
3. Try login with wrong email
4. Should show error message
5. Try invalid OTP
6. Should show "Invalid or expired OTP"
7. ✅ PASS if all errors handled
```

---

## 📊 Quick Summary

| Test | Status | Notes |
|------|--------|-------|
| Signup | ☐ PASS ☐ FAIL | |
| Login | ☐ PASS ☐ FAIL | |
| Password Reset (OTP) | ☐ PASS ☐ FAIL | |
| Single File | ☐ PASS ☐ FAIL | |
| Multiple Files | ☐ PASS ☐ FAIL | |
| Profile | ☐ PASS ☐ FAIL | |
| History | ☐ PASS ☐ FAIL | |
| Google Sign-In | ☐ PASS ☐ FAIL | |
| Logout | ☐ PASS ☐ FAIL | |
| Errors | ☐ PASS ☐ FAIL | |

---

## 🐛 If Something Fails:

1. **Open DevTools** (F12)
2. **Go to Console** tab
3. **Look for red errors** 
4. **Copy the error message**
5. **Take a screenshot**
6. **Tell me what went wrong**

---

## 🎉 All Tests Pass?

**Great! Your app is ready!** 

Next steps:
- Deploy to production
- Set up Google OAuth properly (add more authorized domains if needed)
- Monitor app for issues
- Collect user feedback

---

## ⚠️ Important Notes:

- Email must be valid Gmail (check spam folder for OTP)
- Keep both servers running during testing
- Clear browser cache if experiencing issues
- Check backend logs for any errors

Good luck with testing! 🚀
