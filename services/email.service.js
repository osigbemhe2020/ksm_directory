const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const sendWelcomeEmail = async ({ to, firstName, lastName, password }) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'dirisupaul16@gmail.com',
    subject: 'Welcome to KSM Member Portal — Your Login Details',
    html: `
      <h2>Welcome, Sir ${firstName} ${lastName}</h2>
      <p>Your account has been created on the Knights of St. Mulumba Member Portal.</p>
      <p><strong>Email:</strong> ${to}</p>
      <p><strong>Temporary Password:</strong> ${password}</p>
      <p>Please log in and change your password immediately.</p>
      <a href="${process.env.FRONTEND_URL}/sign-in">Login Here</a>
    `
  });
};

const sendPasswordResetEmail = async ({ to, firstName, token }) => {
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'dirisupaul16@gmail.com',
    subject: 'Password Reset Request - Knights of St. Mulumba',
    html: `
      <h2>Password Reset Request</h2>
      <p>Dear Sir ${firstName},</p>
      <p>We received a request to reset your password for the Knights of St. Mulumba Member Portal.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${process.env.FRONTEND_URL}/sign-in/reset-password?token=${token}" style="background-color: #1E4D3A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
        Reset Password
      </a>
      <p>Or copy and paste this link:</p>
      <p>${process.env.FRONTEND_URL}/sign-in/reset-password?token=${token}</p>
      <p><strong>Note:</strong> This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Thank you,<br>Knights of St. Mulumba Team</p>
    `
  });
};

module.exports = { sendWelcomeEmail, sendPasswordResetEmail };