# Email Configuration Setup

## Problem
Forgot password emails are not being sent. The system needs to be configured to send emails through Gmail or another email provider.

## Solution

### Step 1: Get Gmail App Password

1. Go to [Google Account](https://myaccount.google.com/)
2. Click **Security** in the left sidebar
3. Scroll down to **How you sign in to Google**
4. Enable **2-Step Verification** (if not already enabled)
5. Go back to Security, scroll down to **App passwords**
6. Select **Mail** and **Windows Computer** (or your device)
7. Google will generate a 16-character password
8. **Copy this password** - you'll need it next

### Step 2: Update .env File

Add these lines to your backend `.env` file:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

Replace:
- `your-email@gmail.com` with your Gmail address
- `xxxx xxxx xxxx xxxx` with the 16-character app password you generated

### Step 3: Restart Backend Server

```bash
# Kill the current backend server (Ctrl+C)
# Then restart it
npm start
```

### Step 4: Test Password Reset

1. Go to Login page
2. Click "Forgot Password?"
3. Enter your email address
4. Check your email inbox (and spam folder)
5. Click the reset link in the email

## Alternative Email Providers

If you don't want to use Gmail, you can modify the email configuration in `backend/utils/sendEmail.js`:

### Using Outlook/Hotmail:
```javascript
const transporter = nodemailer.createTransport({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Using SendGrid:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});
```

### Using Mailgun:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASSWORD
  }
});
```

## Troubleshooting

### "Permission denied" error
- Make sure you used an **App Password**, not your regular Gmail password
- Verify 2-Step Verification is enabled

### Email not arriving
- Check your spam/junk folder
- Make sure the email address in the form matches a registered user

### "ECONNREFUSED" error
- Check that your internet connection is working
- Verify EMAIL_USER and EMAIL_PASSWORD are correct in .env

### Still not working?
- Check the browser console for error messages
- Check the terminal running the backend server for detailed error logs
- Make sure the .env file is in the `backend` folder, not the root folder

## Testing Mode

For development/testing without email:

In `backend/routes/authRoutes.js`, the endpoint includes a `testResetUrl` that will be returned in development mode. You can use this URL directly to test password reset without needing email setup.

## Important Security Notes

⚠️ **NEVER commit your `.env` file to git!**
⚠️ **NEVER share your App Password or API keys!**
⚠️ In production, use environment variables from your hosting provider (Azure, Heroku, etc.)
