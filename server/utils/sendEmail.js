const nodemailer = require("nodemailer");

/**
 * Creates and configures a Nodemailer transporter.
 * If SMTP credentials are configured in server/.env, sends real emails.
 * If not configured, gracefully falls back to console logging the reset link for development testing.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  return null;
}

/**
 * Sends an email using Nodemailer or logs to console if SMTP is not configured.
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject line
 * @param {string} options.text - Plain text version
 * @param {string} options.html - HTML version
 */
async function sendEmail({ to, subject, text, html }) {
  const transporter = createTransporter();
  const fromAddress =
    process.env.EMAIL_FROM ||
    process.env.SMTP_USER ||
    '"Everyday & Co." <no-reply@everydayco.in>';

  if (transporter) {
    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });
    console.log(`[Nodemailer] Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  }

  // Development Fallback: Log email details when SMTP is not yet populated
  console.log("------------------------------------------------------------");
  console.log(`[Nodemailer DEV FALLBACK] Email to: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text}`);
  console.log("------------------------------------------------------------");
  return { success: true, isDevFallback: true };
}

/**
 * Generates an Everyday & Co. branded HTML email for password reset.
 */
function buildPasswordResetEmail({ name, resetUrl }) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8f6f2; margin: 0; padding: 24px; color: #1c1917; }
    .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e6dfd5; padding: 36px 32px; box-shadow: 0 4px 12px rgba(28,25,23,0.06); }
    .logo { display: inline-block; font-size: 20px; font-weight: 800; color: #c25e1a; text-decoration: none; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 700; color: #1c1917; margin: 0 0 14px; }
    p { font-size: 15px; line-height: 1.6; color: #57534e; margin: 0 0 20px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #d97706 0%, #c25e1a 100%); color: #ffffff !important; font-size: 15px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(194,94,26,0.3); }
    .link-alt { word-break: break-all; font-size: 13px; color: #c25e1a; }
    .footer { font-size: 12px; color: #a8a29e; border-top: 1px solid #f1ede4; padding-top: 20px; margin-top: 32px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="logo">Everyday & Co.</span>
    <h1>Password Reset Request</h1>
    <p>Hello ${name ? name : "there"},</p>
    <p>We received a request to reset your Everyday & Co. account password. Click the button below to choose a new password:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #78716c;">This link is valid for <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
    <div class="footer">
      <p style="margin: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="margin: 6px 0 0;"><a href="${resetUrl}" class="link-alt">${resetUrl}</a></p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `Hello ${name || "there"},\n\nWe received a request to reset your Everyday & Co. account password.\n\nPlease visit the following link to reset your password (valid for 1 hour):\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.\n\n— Everyday & Co.`;

  return { html, text };
}

module.exports = {
  sendEmail,
  buildPasswordResetEmail,
};
