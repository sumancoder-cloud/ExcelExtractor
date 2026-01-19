const sgMail = require('@sendgrid/mail');

const sendEmailWithOTP = async (email, otp) => {
  try {
    // Use SendGrid for email (works with Railway)
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured. Please set it in environment variables.');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Email content with OTP
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset - Verification Code</h2>
        <p style="color: #666; font-size: 16px;">
          Hello,
        </p>
        <p style="color: #666; font-size: 16px;">
          We received a request to reset your password. Use the verification code below to proceed:
        </p>
        
        <div style="background-color: #f0f0f0; padding: 20px; border-radius: 5px; text-align: center; margin: 30px 0;">
          <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">Your verification code is:</p>
          <h1 style="color: #007bff; font-size: 36px; letter-spacing: 5px; margin: 0; font-weight: bold;">
            ${otp}
          </h1>
        </div>

        <p style="color: #666; font-size: 14px;">
          <strong>This code will expire in 10 minutes.</strong>
        </p>
        
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
        
        <p style="color: #999; font-size: 12px;">
          Do not share this code with anyone. We will never ask for it.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 Excel Extractor. All rights reserved.
        </p>
      </div>
    `;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@excelextractor.app',
      subject: 'Password Reset Verification Code',
      html: htmlContent
    };

    // Send email
    await sgMail.send(msg);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

// Keep the old function for other email types if needed
const sendEmail = async (email, subject, resetUrl) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured. Please set it in environment variables.');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p style="color: #666; font-size: 16px;">
          Hello,
        </p>
        <p style="color: #666; font-size: 16px;">
          We received a request to reset your password. Click the link below to reset your password:
        </p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <span style="word-break: break-all; color: #007bff;">${resetUrl}</span>
        </p>
        <p style="color: #999; font-size: 12px;">
          This link will expire in 1 hour.
        </p>
        <p style="color: #999; font-size: 12px;">
          If you didn't request a password reset, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2026 Excel Extractor. All rights reserved.
        </p>
      </div>
    `;

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@excelextractor.app',
      subject: subject,
      html: htmlContent
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = { sendEmail, sendEmailWithOTP };
