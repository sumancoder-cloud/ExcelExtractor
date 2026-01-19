# 🎨 New Features Visual Guide

## 1. Forgot Password Flow 🔐

### Step 1: Click "Forgot Password?" Link
```
Login Page
├── Email Input Field
├── "Don't have account?" → Sign Up
└── "Forgot Password?" ← Click Here
    ↓
Forgot Password Page Opens
```

### Step 2: Enter Email
```
Forgot Password Page
├── Title: "Reset Your Password"
├── Email Input
│   └── Placeholder: "Enter your email"
└── Button: "Send Reset Link"
```

### Step 3: Email Sent Confirmation
```
Success Message
├── Icon: ✓ (Green checkmark)
├── Text: "Email Sent!"
├── Subtext: "Check your email and click link to reset"
└── Auto-redirects to login in 3 seconds
```

### Step 4: Click Email Link
```
Reset Password Page
├── Title: "Create New Password"
├── New Password Input (with eye icon)
├── Confirm Password Input (with eye icon)
└── Button: "Reset Password"
    ↓
Success → Auto-redirect to login
```

---

## 2. User Profile Page 👤

### Access Points
```
Main Page Header
└── "My Account" Dropdown
    ├── My Account ← Click Here
    └── Conversion History
    └── Logout
    
OR Mobile Menu
└── "My Account" Button ← Click Here
```

### Profile Information Tab
```
Profile Page
├── Tab 1: Profile Info (Selected)
├── Tab 2: Change Password
└── Content Area:
    ├── Full Name Input
    │   └── Icon: 👤
    ├── Email Input
    │   └── Icon: ✉️
    └── Button: "Save Changes"
```

### Change Password Tab
```
Profile Page
├── Tab 1: Profile Info
├── Tab 2: Change Password (Selected)
└── Content Area:
    ├── Current Password Input (eye icon)
    ├── New Password Input (eye icon)
    │   └── Note: "Minimum 6 characters"
    ├── Confirm Password Input (eye icon)
    └── Button: "Change Password"
```

### Messages
```
Success Message (Green)
├── Text: "Profile updated successfully!"
└── Auto-hides after 3 seconds

Error Message (Red)
├── Text: "Email already in use"
└── OR: "Current password is incorrect"
```

---

## 3. Conversion History Page 📊

### Access Points
```
Main Page Header
└── "My Account" Dropdown
    ├── My Account
    └── Conversion History ← Click Here
    
OR Mobile Menu
└── "Conversion History" Button ← Click Here
```

### History Table
```
Conversion History Page
├── Header: "Conversion History"
└── Table:
    ├── Original File | Type | Date | Method | Confidence | Actions
    ├── Row 1: file1.pdf | PDF | Jan 19 | ML | 95% | [👁️] [📥] [🗑️]
    ├── Row 2: file2.png | Image | Jan 18 | Basic | 87% | [👁️] [📥] [🗑️]
    └── ...
```

### Actions Per Row
```
👁️ Preview Button
├── Opens Modal
├── Shows: Filename, Method, Confidence
└── Content: Extracted Text Preview

📥 Download Button
├── Downloads Excel file
└── Filename: converted.xlsx

🗑️ Delete Button
├── Asks for confirmation
├── Deletes record & file
└── Removes from table
```

### Pagination
```
Bottom of Table
├── [Previous] Button (disabled if on page 1)
├── Text: "Page 2 of 5"
└── [Next] Button (disabled if on last page)
```

### Empty State
```
No Conversions Yet
├── Icon: 📄 (Large, gray)
├── Text: "No Conversions Yet"
├── Subtext: "Start by uploading a file..."
└── Button: "Go to Converter"
```

---

## 4. File Persistence Details 💾

### What Gets Saved
```
After Each Conversion:
├── Original Filename: "invoice.pdf"
├── Converted Filename: "converted.xlsx"
├── File Type: "pdf" or "image"
├── MIME Type: "application/pdf" or "image/png"
├── File Size: "2.5 MB"
├── Extracted Text: [Array of strings]
├── Extraction Method: "ML" or "Tesseract"
├── Confidence: 0.95 (95%)
├── Conversion Time: 2500 (ms)
├── Status: "success" or "failed"
├── Created At: ISO timestamp
└── Expires At: 7 days later
```

### Auto-Expiration
```
Server-Side TTL (MongoDB)
├── Files stored on server
├── Auto-delete after 7 days
├── You can manually delete earlier
└── Error if file expired: "File no longer available"
```

### Download Options
```
Option 1: Download Immediately After Conversion
├── Files shows on animation page
└── Download button appears

Option 2: Download from History Later
├── Go to "Conversion History"
├── Find conversion in table
├── Click "Download" button
└── File available for up to 7 days
```

---

## 5. Error Handling Examples ⚠️

### Password Reset Errors
```
"Email not found"
└── User entered non-existent email

"Invalid or expired reset token"
└── Token is old (>1 hour) or link is invalid

"Passwords do not match"
└── Confirmation password doesn't match

"Password must be at least 6 characters"
└── Password too short
```

### Profile Errors
```
"Email already in use"
└── Another user has this email

"Current password is incorrect"
└── Wrong current password entered

"All fields are required"
└── Didn't fill in all inputs
```

### Conversion History Errors
```
"Conversion not found"
└── Record was deleted or doesn't exist

"File no longer available"
└── File expired or was deleted

"Failed to fetch conversion history"
└── Server error
```

---

## 6. User Journey Example 📱

### New User Journey
```
1. Visit Landing Page (/)
   └── Click "Login"

2. Go to Login Page (/login)
   └── Click "Sign Up" tab

3. Fill Signup Form
   ├── Full Name: John Doe
   ├── Email: john@example.com
   ├── Password: password123
   └── Click "Sign Up"

4. Redirected to Main Page (/main)
   ├── Upload PDF/Image
   ├── Click Convert
   └── See animation with all files

5. Conversion Complete
   ├── Download file immediately
   └── Or save for later

6. Later, Check History (/history)
   ├── View all past conversions
   ├── Download old files
   └── Delete unwanted records
```

### Returning User Journey
```
1. Click "Login" on Landing Page
   
2. Login Form (/login)
   ├── Enter email: john@example.com
   ├── Enter password
   └── Click "Login"

3. Forgot Password? (optional flow)
   ├── Click "Forgot Password?"
   ├── Enter email
   ├── Click email link
   ├── Enter new password
   └── Back to login

4. Access Profile (/profile)
   ├── Go to main page
   ├── Click "My Account"
   ├── Click "My Account" (Profile)
   └── Edit info or change password

5. View History (/history)
   ├── Go to main page
   ├── Click "My Account"
   ├── Click "Conversion History"
   └── Browse all conversions
```

---

## 7. Security Features 🔒

### Password Security
```
✓ Reset tokens expire in 1 hour
✓ Tokens are cryptographically hashed
✓ Passwords are bcrypt hashed (10 rounds)
✓ Password change requires current password
✓ Only authenticated users can access profile
```

### Data Protection
```
✓ All endpoints require JWT token
✓ CORS protection enabled
✓ Rate limiting on API calls
✓ Helmet security headers
✓ Files validated before upload
✓ File paths validated on download
```

### Privacy
```
✓ User can delete conversions anytime
✓ Files auto-delete after 7 days
✓ No data shared without permission
✓ Password resets require email verification
```

---

## 📋 Quick Reference

| Feature | Access | Route | Requires Login |
|---------|--------|-------|----------------|
| Forgot Password | Login page | `/forgot-password` | No |
| Reset Password | Email link | `/reset-password` | No |
| Profile | My Account menu | `/profile` | **Yes** |
| Change Password | Profile page | `/profile` | **Yes** |
| History | My Account menu | `/history` | **Yes** |

---

**All new features are fully integrated and tested!** ✅
