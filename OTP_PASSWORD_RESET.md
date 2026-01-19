# OTP-Based Password Reset Flow

## Overview

The password reset system now uses a secure **OTP (One-Time Password)** approach instead of email links. This is more secure and user-friendly.

## How It Works

### Step 1: User Requests Password Reset
- User clicks "Forgot Password?" on login page
- Gets redirected to `/forgot-password`
- Enters their email address
- System sends a **6-digit OTP** to their email

### Step 2: User Enters OTP
- User receives email with the OTP code (valid for 10 minutes)
- User enters the 6-digit OTP on the same forgot password page
- System verifies the OTP

### Step 3: User Creates New Password
- After OTP verification, user is redirected to `/reset-password?email={email}&otp={otp}`
- User enters new password and confirms it
- New password is saved to database
- User is redirected to login page

## Technical Implementation

### Backend Changes

#### 1. User Model Updates (`backend/models/User.js`)
Added two new fields:
```javascript
resetOTP: {
  type: String,
  sparse: true,
},
resetOTPExpires: {
  type: Date,
},
```

#### 2. Email Utility (`backend/utils/sendEmail.js`)
- New function: `sendEmailWithOTP(email, otp)`
- Sends beautifully formatted email with the 6-digit OTP
- Old function still available for other email types

#### 3. API Endpoints (`backend/routes/authRoutes.js`)

**POST `/api/auth/forgot-password`**
- Generates 6-digit OTP
- Sends OTP via email
- Stores hashed OTP in database (expires in 10 minutes)
- Returns success message

**POST `/api/auth/verify-otp`**
- Verifies OTP before password reset
- Checks if OTP matches and hasn't expired
- Returns verification status

**POST `/api/auth/reset-password`**
- Takes email, OTP, new password, and confirm password
- Verifies OTP one more time
- Updates user password
- Clears OTP from database

### Frontend Changes

#### 1. ForgotPasswordPage.jsx
- **Step 1**: User enters email → OTP sent
- **Step 2**: User enters OTP → OTP verified
- Both steps in one page with progress indicator
- After OTP verification, redirects to reset password page

#### 2. ResetPasswordPage.jsx
- Receives `email` and `otp` as URL parameters
- User enters and confirms new password
- Submits to `/api/auth/reset-password` endpoint
- After success, redirects to login

## Security Features

✅ **OTP Hash Storage**: OTPs are hashed before storing in database (never plain text)
✅ **Time-based Expiry**: OTPs expire after 10 minutes
✅ **One-time Use**: OTP is cleared after successful password reset
✅ **Rate Limiting Ready**: Can be added to prevent OTP brute-force
✅ **Email Verification**: Only valid email addresses can request reset
✅ **Password Requirements**: Minimum 6 characters enforced

## Email Setup

The OTP email is sent via Gmail using nodemailer. See [EMAIL_SETUP.md](../EMAIL_SETUP.md) for configuration.

Email is formatted nicely with:
- Large, easy-to-read OTP code
- Clear instructions
- Security warnings
- 10-minute expiry notice

## Testing the Feature

1. Go to http://localhost:5174/login
2. Click "Forgot Password?"
3. Enter your registered email
4. Check your email for the OTP
5. Enter the OTP on the page
6. Create a new password
7. Login with your new password

## API Request/Response Examples

### Request OTP
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox and spam folder."
}
```

### Verify OTP
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "success": true,
  "message": "OTP verified. You can now reset your password.",
  "verified": true
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}

Response:
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

## Advantages Over Email Link Method

| Feature | OTP Method | Email Link Method |
|---------|-----------|-------------------|
| **Security** | Higher (hashed OTP, time-limited) | Medium (link can be forwarded) |
| **User Experience** | Quick (10 min window) | Slower (1 hour window) |
| **Mobile Friendly** | Yes (can copy/paste OTP) | No (redirects away) |
| **Offline Use** | No (needs internet to send email) | No (needs to click link) |
| **Link Expiry** | Yes (10 minutes) | Yes (1 hour) |

## Future Enhancements

- Add rate limiting for OTP requests
- Add SMS OTP option alongside email
- Add OTP resend functionality
- Add OTP attempt counter with lockout
- Add audit logging for password resets
- Add security questions as backup
