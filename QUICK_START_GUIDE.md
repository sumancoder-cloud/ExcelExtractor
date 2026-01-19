# 🚀 Quick Start Guide - New Features

## 🎯 For Immediate Testing

### Step 1: Start Servers
```bash
# Terminal 1 - Frontend
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor\ExcelExtractor"
npm run dev
# ➜ http://localhost:5174/

# Terminal 2 - Backend
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor\backend"
npm start
# ➜ http://localhost:5000/

# Terminal 3 - Check MongoDB Running
mongod
```

### Step 2: Test Each Feature (2 minutes each)

#### Feature 1: Forgot Password (2 min)
```
1. http://localhost:5174/login
2. Click "Forgot Password?" link
3. Enter email: test@example.com
4. Click "Send Reset Link"
5. ✅ Should see success message
```

#### Feature 2: User Profile (2 min)
```
1. Login to application
2. Click header "My Account" dropdown
3. Click "My Account" option
4. Edit name or email
5. Click "Save Changes"
6. ✅ Should see success and changes persist
```

#### Feature 3: Conversion History (2 min)
```
1. Convert a file on main page
2. Click "My Account" dropdown
3. Click "Conversion History"
4. ✅ Should see your conversion in table
5. Click Preview/Download/Delete buttons
```

---

## 📱 Key Access Points

### For Users

```
┌─ Landing Page
│  └─ Login/Signup Link
│     └─ Login Page
│        ├─ "Forgot Password?" → Password Reset
│        └─ Login Success → Main Page

┌─ Main Page (After Login)
│  └─ Header "My Account" Dropdown
│     ├─ My Account → Profile Page
│     ├─ Conversion History → History Page
│     └─ Logout → Back to Login

┌─ Profile Page
│  ├─ Tab 1: Edit Profile Info
│  └─ Tab 2: Change Password

┌─ Conversion History Page
│  └─ Table with Actions
│     ├─ Preview → See Text
│     ├─ Download → Get Excel
│     └─ Delete → Remove Record
```

---

## 🔐 Account Security Test

```
Test Case: Complete Security Flow
├─ Create Account: test123@gmail.com / password123
├─ Login: Success ✅
├─ Go to Profile
│  ├─ Change Name ✅
│  └─ Change Password → newpass456 ✅
├─ Logout
├─ Try login with old password → FAILS ❌ (correct!)
├─ Login with new password → SUCCESS ✅
└─ Go to history, conversions still there ✅
```

---

## 📊 Features At a Glance

| Feature | Route | Time to Test | Difficulty |
|---------|-------|--------------|------------|
| Forgot Password | `/forgot-password` | 2 min | ⭐ Easy |
| Reset Password | `/reset-password` | 2 min | ⭐ Easy |
| User Profile | `/profile` | 2 min | ⭐ Easy |
| Change Password | `/profile` tab 2 | 2 min | ⭐ Easy |
| Conversion History | `/history` | 3 min | ⭐ Easy |

---

## ✅ What to Verify

### Forgot Password Flow
```
☑ Click link → Page loads
☑ Empty email → Error message
☑ Valid email → Success message
☑ Reset password works
☑ New password allows login
☑ Old password doesn't work
```

### Profile Page
```
☑ Link accessible from My Account menu
☑ Can edit name and email
☑ Changes persist after refresh
☑ Can change password
☑ Old password required
☑ New password required to match
```

### Conversion History
```
☑ Shows all your conversions
☑ Preview works
☑ Download works
☑ Delete works
☑ Pagination works (if 10+ conversions)
☑ Different users see different history
```

---

## 🐛 Quick Troubleshooting

### Password Reset Not Working?
```
1. Check backend console for errors
2. Verify email is registered
3. Check token isn't expired (1 hour max)
4. Verify MongoDB is running
```

### Profile Page Won't Load?
```
1. Check if logged in
2. Refresh page
3. Check browser console for errors
4. Verify token is valid
5. Check backend /api/auth/profile endpoint
```

### History Empty?
```
1. Perform a conversion first
2. Wait for conversion to complete
3. Go to history page
4. Refresh if needed
5. Check if file uploaded successfully
```

### Can't Change Password?
```
1. Verify current password is correct
2. New passwords must match
3. Password minimum 6 characters
4. No spaces allowed at start/end
5. Try exact password you're using
```

---

## 📚 Documentation Files

```
/ExcelExtractor/
├── FEATURES_IMPLEMENTED.md      (What was built)
├── NEW_FEATURES_GUIDE.md         (How to use)
├── TESTING_CHECKLIST.md          (Detailed tests)
├── IMPLEMENTATION_SUMMARY.md     (Technical details)
└── QUICK_START_GUIDE.md          (This file!)
```

---

## 🎓 Example Workflows

### New User (No Conversions)
```
1. Visit /login
2. Click "Sign Up"
3. Create account
4. Taken to main page
5. Upload file & convert
6. Check history → See conversion
7. Done!
```

### Returning User (With History)
```
1. Visit /login
2. Enter credentials
3. Click "My Account"
4. View profile or history
5. Download old files
6. Do new conversion
7. Done!
```

### Forgot Password User
```
1. Visit /login
2. Click "Forgot Password?"
3. Enter email
4. Reset password
5. Return to login
6. Login with new password
7. Done!
```

---

## 🎯 Success Criteria

All features working ✅ if:
- [ ] Can reset password with forgot link
- [ ] Can edit profile info
- [ ] Can change password
- [ ] Can see conversion history
- [ ] Can preview, download, delete conversions
- [ ] Files persist for 7 days
- [ ] Different users see different data
- [ ] Error messages are clear
- [ ] Mobile layout works
- [ ] Logout clears all data

---

## 🔗 Direct Links

```
Frontend Dev:        http://localhost:5174/
Backend API:         http://localhost:5000/

Login Page:          http://localhost:5174/login
Forgot Password:     http://localhost:5174/forgot-password
Main Converter:      http://localhost:5174/main
User Profile:        http://localhost:5174/profile
Conversion History:  http://localhost:5174/history
```

---

## ⏱️ Expected Time

```
Setup:               5 minutes
Test all features:   15 minutes
Check mobile:        5 minutes
Total:               ~25 minutes
```

---

## 💡 Pro Tips

```
✓ Use incognito window for multiple test accounts
✓ Check browser DevTools → Network tab for API calls
✓ Check server console for detailed logs
✓ Test on mobile (Chrome DevTools → Device Mode)
✓ Clear localStorage if having issues
✓ Try different file types (PDF + Image)
```

---

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| 404 on new routes | Restart frontend server (npm run dev) |
| Token expired | Logout and login again |
| Files not in history | Ensure conversion completed successfully |
| Email already taken | Use different email address |
| Password reset link broken | Check it within 1 hour |
| Mobile menu not working | Try hard refresh (Ctrl+Shift+R) |

---

## 📞 Need Help?

1. **Check logs**: Browser console + server console
2. **Check database**: Verify MongoDB collections
3. **Try again**: Logout and login fresh
4. **Restart servers**: Sometimes helps
5. **Clear cache**: Delete localStorage/sessionStorage

---

**Everything is ready to test! Start servers and enjoy the new features! 🎉**

Last updated: January 19, 2026
