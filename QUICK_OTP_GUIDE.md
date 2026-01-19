# Quick OTP Password Reset Guide

## How Users Reset Their Password

### 👤 User Journey:

1. **On Login Page** → Click "Forgot Password?" link
2. **Enter Email** → User provides registered email address
3. **Check Email** → OTP (6 digits) arrives in inbox/spam folder
4. **Enter OTP** → User enters the code (10-minute timer)
5. **Create Password** → User enters and confirms new password
6. **Success!** → Password reset complete, can now login

## What Was Changed

### Backend (Node.js/Express)
- ✅ `User.js` - Added `resetOTP` and `resetOTPExpires` fields
- ✅ `sendEmail.js` - Added `sendEmailWithOTP()` function
- ✅ `authRoutes.js` - Updated password reset endpoints:
  - POST `/api/auth/forgot-password` → Sends OTP
  - POST `/api/auth/verify-otp` → Validates OTP
  - POST `/api/auth/reset-password` → Changes password

### Frontend (React)
- ✅ `ForgotPasswordPage.jsx` - Two-step OTP flow
- ✅ `ResetPasswordPage.jsx` - Updated to use OTP instead of token

### Dependencies
- ✅ `nodemailer` - Installed for email sending

## Key Features

🔐 **Secure**: OTPs are hashed, never stored plain text
⏱️ **Time-Limited**: OTP valid for 10 minutes only
📧 **Email-Based**: Works with any email address
📱 **Mobile-Friendly**: Easy to copy/paste OTP
🔄 **One-Time Use**: OTP deleted after password reset

## Email Configuration

⚠️ **IMPORTANT**: Set up email credentials in `.env` file

See [EMAIL_SETUP.md](EMAIL_SETUP.md) for detailed instructions.

## Testing Steps

1. Start frontend: `npm run dev` (in ExcelExtractor folder)
2. Start backend: `npm start` (in backend folder)
3. Go to http://localhost:5174/login
4. Click "Forgot Password?"
5. Enter your registered email
6. Receive OTP in email
7. Enter OTP and create new password

## Troubleshooting

### ❌ "User not found with this email"
- Make sure you registered with this email
- Check your email spelling

### ❌ "Invalid or expired OTP"
- OTP expires after 10 minutes
- Request a new OTP by refreshing the page
- Check the OTP code carefully (copy/paste to avoid typos)

### ❌ "Email not arriving"
- Check spam folder
- Make sure EMAIL_USER and EMAIL_PASSWORD are set in `.env`
- Check backend logs for email errors

### ❌ Email sending fails
See [EMAIL_SETUP.md](EMAIL_SETUP.md) - Gmail requires:
1. 2-Step Verification enabled
2. Google App Password (not regular password)
3. Correct `.env` configuration

## Security Notes

🔒 Never share your OTP with anyone
🔒 OTP is only valid for 10 minutes
🔒 Each password reset creates a new OTP
🔒 OTP is automatically deleted after use or expiry

## Database Fields

The User model now includes:
```javascript
resetOTP: String         // Hashed 6-digit code
resetOTPExpires: Date    // Expiry time (10 min from generation)
```

## API Response Examples

### Sending OTP
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox and spam folder."
}
```

### Verifying OTP
```json
{
  "success": true,
  "message": "OTP verified. You can now reset your password.",
  "verified": true
}
```

### Password Reset Success
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

## File Locations

- **Backend endpoints**: `backend/routes/authRoutes.js` (lines 346-525)
- **Email template**: `backend/utils/sendEmail.js`
- **User model**: `backend/models/User.js`
- **Frontend (email step)**: `ExcelExtractor/src/Pages/ForgotPasswordPage.jsx`
- **Frontend (password step)**: `ExcelExtractor/src/Pages/ResetPasswordPage.jsx`

## What's Next?

All password reset functionality is now complete and ready to test! 🎉

Optional enhancements:
- Add SMS OTP option
- Add resend OTP button
- Add rate limiting
- Add attempt counter
