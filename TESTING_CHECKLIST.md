# ✅ Complete Testing Checklist

## 🚀 How to Test Everything

### Prerequisites
```bash
# Terminal 1 - Frontend
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor\ExcelExtractor"
npm run dev
# Runs on: http://localhost:5174/

# Terminal 2 - Backend  
cd "c:\Users\SumanYadav Personal\Desktop\ExcelExtractor\backend"
npm start
# Runs on: http://localhost:5000/

# Ensure MongoDB is running!
```

---

## 1️⃣ Test Forgot Password Feature

### Test Case 1.1: Request Password Reset
```
✓ Go to http://localhost:5174/login
✓ Click "Forgot Password?" link
✓ Verify page title: "Reset Your Password"
✓ Enter valid email (e.g., test@example.com)
✓ Click "Send Reset Link"
✓ Should see success message: "Password reset link sent to your email!"
✓ Should auto-redirect to login after 3 seconds
```

### Test Case 1.2: Invalid Email
```
✓ Go to http://localhost:5174/forgot-password
✓ Enter non-existent email: fakeemail@example.com
✓ Click "Send Reset Link"
✓ Should see error: "User not found with this email"
✓ Page should remain on forgot password page
```

### Test Case 1.3: Empty Email Field
```
✓ Go to http://localhost:5174/forgot-password
✓ Leave email empty
✓ Click "Send Reset Link"
✓ Should see error: "Please enter your email address"
```

### Test Case 1.4: Reset Password with Token
```
✓ Request password reset with valid email
✓ Copy the resetUrl from response (development mode)
✓ Paste URL in browser (e.g., /reset-password?token=xxx&email=test@example.com)
✓ Page should load: "Create New Password"
✓ Enter new password: newpass123
✓ Confirm password: newpass123
✓ Click "Reset Password"
✓ Should see success: "Password reset successfully!"
✓ Auto-redirect to login
✓ Login with old password - should FAIL
✓ Login with new password - should SUCCESS
```

### Test Case 1.5: Invalid Reset Token
```
✓ Visit: /reset-password?token=invalidtoken&email=test@example.com
✓ Enter any new password
✓ Click "Reset Password"
✓ Should see error: "Invalid or expired reset token"
```

### Test Case 1.6: Mismatched Passwords
```
✓ Visit reset password page
✓ Enter password: newpass123
✓ Confirm password: different123
✓ Click "Reset Password"
✓ Should see error: "Passwords do not match"
```

---

## 2️⃣ Test User Profile Feature

### Test Case 2.1: View Profile (Logged In)
```
✓ Login successfully
✓ Go to main page
✓ Click header dropdown "My Account"
✓ Click "My Account" option
✓ Verify redirect to /profile
✓ Should see two tabs: "Profile Info" and "Change Password"
✓ Profile Info tab shows: Full Name and Email fields
✓ Current values populated from database
```

### Test Case 2.2: Edit Profile Information
```
✓ On profile page, Profile Info tab
✓ Change Full Name to: "John Updated"
✓ Change Email to: "newemail@example.com"
✓ Click "Save Changes"
✓ Should see success: "Profile updated successfully!"
✓ Message auto-hides after 3 seconds
✓ Refresh page
✓ New values should persist
```

### Test Case 2.3: Duplicate Email Error
```
✓ Create 2 accounts: user1@ex.com and user2@ex.com
✓ Login as user1
✓ Go to profile
✓ Try to change email to user2@ex.com
✓ Click "Save Changes"
✓ Should see error: "Email already in use"
✓ Email should NOT be changed
```

### Test Case 2.4: Change Password (Correct Current)
```
✓ On profile page, Change Password tab
✓ Current Password: "oldpass123" (correct)
✓ New Password: "newpass456"
✓ Confirm New Password: "newpass456"
✓ Click "Change Password"
✓ Should see success: "Password changed successfully!"
✓ Form should clear
✓ Logout
✓ Try login with old password - should FAIL
✓ Try login with new password - should SUCCESS
```

### Test Case 2.5: Change Password (Incorrect Current)
```
✓ On Change Password tab
✓ Current Password: "wrongpassword"
✓ New Password: "newpass456"
✓ Confirm: "newpass456"
✓ Click "Change Password"
✓ Should see error: "Current password is incorrect"
✓ Password should NOT change
```

### Test Case 2.6: Mismatched New Passwords
```
✓ On Change Password tab
✓ Current Password: "correct"
✓ New Password: "newpass456"
✓ Confirm: "different789"
✓ Click "Change Password"
✓ Should see error: "New passwords do not match"
```

### Test Case 2.7: Password Too Short
```
✓ On Change Password tab
✓ Current Password: "correct"
✓ New Password: "short"
✓ Confirm: "short"
✓ Click "Change Password"
✓ Should see error: "New password must be at least 6 characters"
```

### Test Case 2.8: Eye Icon Toggle
```
✓ On Change Password tab
✓ Current Password field should show dots
✓ Click eye icon - password should show as text
✓ Click eye icon again - should hide as dots
✓ Test with all 3 password fields
```

---

## 3️⃣ Test Conversion History Feature

### Test Case 3.1: Access History Page
```
✓ Login successfully
✓ Go to main page
✓ Click "My Account" dropdown
✓ Click "Conversion History"
✓ Should redirect to /history
✓ See page title: "Conversion History"
✓ If no conversions, see empty state with message
```

### Test Case 3.2: Save Conversion to History
```
✓ On main page, upload a PDF or Image
✓ Click "Convert"
✓ Wait for conversion to complete
✓ Download the file (optional)
✓ Go to "Conversion History"
✓ Should see new conversion in table
✓ Check columns: File Name | Type | Date | Method | Confidence | Actions
```

### Test Case 3.3: View Conversion Details
```
✓ In history table, find a conversion
✓ Click "Preview" button (eye icon)
✓ Modal should open showing:
  - Title: Original filename
  - Method: (e.g., "ML" or "Tesseract")
  - Confidence: (e.g., "95%")
  - Extracted text in scrollable area
✓ Click X or outside to close modal
```

### Test Case 3.4: Download from History
```
✓ In history table, click "Download" button
✓ File should download as "converted.xlsx"
✓ File should be readable Excel
✓ Test after logout and re-login
✓ File should still be available (within 7 days)
```

### Test Case 3.5: Delete from History
```
✓ In history table, click "Delete" button
✓ Should show confirmation: "Are you sure?"
✓ Click "OK" to confirm
✓ Row should disappear from table
✓ Refresh page
✓ Deletion should be permanent
```

### Test Case 3.6: Pagination
```
✓ Convert multiple files (at least 11)
✓ Go to history page
✓ Should show 10 items per page
✓ Bottom shows: [Previous] Page 1 of 2 [Next]
✓ Previous button should be disabled (on page 1)
✓ Next button should be enabled
✓ Click "Next"
✓ Should show items 11+ on page 2
✓ Previous button now enabled
✓ Next button now disabled (on last page)
✓ Click "Previous"
✓ Back to page 1
```

### Test Case 3.7: Empty History
```
✓ New account with no conversions
✓ Go to history page
✓ Should see empty state:
  - Large file icon (gray)
  - Text: "No Conversions Yet"
  - Subtext: "Start by uploading a file..."
  - Button: "Go to Converter"
✓ Click button → redirect to /main
```

### Test Case 3.8: File Expiration (7-day TTL)
```
✓ Document: Files auto-delete after 7 days
✓ In database, check ConversionHistory.expiresAt
✓ Should be 7 days from creation
✓ Server has TTL index to auto-delete
✓ After 7 days, download should show: "File no longer available"
```

---

## 4️⃣ Test File Persistence

### Test Case 4.1: File Available After Logout
```
✓ Login and convert a file
✓ Download file
✓ Logout
✓ Wait 5 minutes
✓ Login again with same account
✓ Go to history
✓ Previous conversion still there
✓ File still available for download
```

### Test Case 4.2: Different Users See Different History
```
✓ Create 2 accounts: user1@ex.com, user2@ex.com
✓ Login as user1, convert a file, save to history
✓ Logout
✓ Login as user2
✓ Go to history
✓ Should be empty (user2 has no conversions)
✓ Login back as user1
✓ History shows only user1's conversions
```

### Test Case 4.3: Metadata Saved Correctly
```
✓ Convert a file and check saved metadata:
  - originalFileName: should match uploaded name
  - convertedFileName: should be "converted.xlsx"
  - fileType: should be "pdf" or "image"
  - mimeType: should match (e.g., "application/pdf")
  - originalFileSize: should show in bytes
  - extractedText: should be array of strings
  - extractionMethod: should be "ML" or "Tesseract"
  - confidence: should be 0-1 number
  - status: should be "success"
  - createdAt: should be timestamp
```

---

## 5️⃣ Test Error Handling

### Test Case 5.1: Network Errors
```
✓ Stop backend server
✓ Try to login → should show error
✓ Try to access profile → should show error
✓ Try to view history → should show error
✓ Restart backend
✓ Actions work again
```

### Test Case 5.2: Invalid Input Errors
```
✓ Try login with invalid email format
✓ Try signup with password < 6 chars
✓ Try update profile with empty name
✓ Try reset password with mismatched passwords
✓ All should show validation errors
```

### Test Case 5.3: File Too Old Error
```
✓ Manually delete a file from uploads folder
✓ Try download from history
✓ Should show: "File no longer available"
✓ Should not crash the app
```

### Test Case 5.4: Unauthorized Access
```
✓ Logout
✓ Try to access /profile directly
✓ Should redirect to /login
✓ Try to access /history directly
✓ Should redirect to /login
```

---

## 6️⃣ Integration Tests

### Test Case 6.1: Complete User Flow
```
✓ New user visits site
✓ Sees landing page
✓ Clicks login
✓ Signs up with email/password
✓ Redirects to main page
✓ Uploads PDF/Image
✓ Clicks convert
✓ Sees animation with file
✓ Downloads converted file
✓ Goes to profile
✓ Updates name and email
✓ Goes to change password
✓ Changes password successfully
✓ Checks conversion history
✓ Sees conversion in table
✓ Previews extracted text
✓ Downloads from history
✓ Deletes from history
✓ Logs out
✓ Logs back in with new password
✓ History still there
✓ Everything works smoothly
```

### Test Case 6.2: Forgot Password + Profile Update
```
✓ User logs in
✓ Clicks forgot password (from somewhere)
✓ Requests reset link
✓ Sets new password
✓ Logs out
✓ Logs back in with new password
✓ Goes to profile
✓ Updates name
✓ Changes password again
✓ Logout and re-login works
```

### Test Case 6.3: Multiple Conversions + History
```
✓ Login
✓ Convert PDF file 1
✓ Convert Image file 2
✓ Convert PDF file 3
✓ Go to history
✓ All 3 show in reverse chronological order
✓ Can preview any
✓ Can download any
✓ Can delete any
✓ Delete one
✓ Only 2 remain
✓ Re-login
✓ Same 2 conversions visible
✓ Original 2 still downloadable
```

---

## 7️⃣ Mobile Responsiveness

### Test Case 7.1: Mobile Profile Access
```
✓ Open on mobile browser (or DevTools)
✓ Login
✓ Open mobile menu (hamburger icon)
✓ Click "My Account" button
✓ Profile page loads
✓ All form fields readable
✓ Buttons responsive
✓ Eye icons work on password fields
```

### Test Case 7.2: Mobile History Access
```
✓ Open on mobile browser
✓ Open mobile menu
✓ Click "Conversion History" button
✓ History page loads
✓ Table scrolls horizontally if needed
✓ All buttons accessible
✓ Preview modal works
```

### Test Case 7.3: Mobile Password Reset
```
✓ Open forgot password on mobile
✓ Email input responsive
✓ Button clickable
✓ Messages readable
✓ Reset page responsive
✓ All inputs fit screen
```

---

## ✅ Final Verification

### Before Considering Complete:
- [ ] All 7 sections tested
- [ ] No errors in browser console
- [ ] No errors in server console
- [ ] Database shows ConversionHistory entries
- [ ] Files persist correctly
- [ ] All pages responsive on mobile
- [ ] Back button blocked on main page (security)
- [ ] Tokens validate correctly
- [ ] Logout clears all auth data
- [ ] New features preserve existing functionality

### Success Criteria:
- ✅ All password reset flows work
- ✅ Profile editing works
- ✅ History viewing works
- ✅ File persistence works
- ✅ Error messages are clear
- ✅ Mobile responsive
- ✅ No breaking changes
- ✅ Security intact

---

## 📞 Troubleshooting

### If History is Empty:
```
1. Verify MongoDB is running
2. Check backend console for errors
3. Ensure ConversionHistory model imported
4. Check user has conversions in DB
```

### If Profile Page Won't Load:
```
1. Verify token is valid
2. Check /api/auth/profile endpoint
3. Look for CORS errors
4. Check browser console
```

### If Forgot Password Link Doesn't Work:
```
1. Check email parameter in URL
2. Verify token hasn't expired
3. Check if user exists in database
4. Backend should log details
```

### If Files Don't Persist:
```
1. Check ConversionHistory.filePath valid
2. Verify uploads folder exists
3. Check file permissions
4. MongoDB TTL index working
```

---

**Ready to test! Start both servers and go through the checklist.** 🚀
