require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Creates and returns a Nodemailer transporter configured for Gmail SMTP.
 */
function getTransporter() {
  const user = (process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_EMAIL || "").trim();
  const pass = (process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD || "").trim();

  if (!user || !pass) {
    return null;
  }

  // Gmail SMTP configuration
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user,
      pass: pass.replace(/\s+/g, "") // Remove spaces if copied from Google App Password
    }
  });
}

/**
 * Send an OTP verification email to the user.
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise<{ sent: boolean, messageId?: string, error?: string }>}
 */
async function sendOtpEmail(toEmail, otp) {
  const user = (process.env.EMAIL_USER || process.env.GMAIL_USER || process.env.SMTP_EMAIL || "").trim();
  const transporter = getTransporter();

  if (!transporter) {
    console.warn(`\n⚠️ [EMAIL SERVICE] Gmail SMTP credentials not fully set in .env!`);
    console.warn(`   Please add EMAIL_USER and EMAIL_PASS (Gmail App Password) to backend/.env.`);
    console.log(`📬 [OTP FALLBACK LOG] Send OTP to: ${toEmail} | CODE: >>> ${otp} <<< (Valid for 10 minutes)\n`);
    return {
      sent: false,
      fallbackOtp: otp,
      error: "SMTP credentials not configured. OTP printed to server console."
    };
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ghar Sansar Login Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f7f6f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2D3748;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f6f2; padding: 40px 15px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="540" cellpadding="0" cellspacing="0" border="0" style="max-width: 540px; background-color: #ffffff; border-radius: 4px; border: 1px solid #e8e4d8; box-shadow: 0 4px 15px rgba(0,0,0,0.05); overflow: hidden;">
                <!-- Header with Ghar Sansar Brand -->
                <tr>
                  <td style="background-color: #0a2e22; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">
                      GHAR SANSAR
                    </h1>
                    <p style="margin: 6px 0 0; color: #D4AF37; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">
                      Exclusive Home & Kitchen Collections
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 36px 32px 28px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 19px; font-weight: 700;">
                      Your Login Verification Code
                    </h2>
                    <p style="margin: 0 0 24px; color: #4B5563; font-size: 14px; line-height: 1.6;">
                      Hello,<br>
                      Use the 6-digit verification code below to securely log into your <strong>Ghar Sansar</strong> account.
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #f2f7f4; border: 1.5px dashed #0a2e22; border-radius: 6px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="display: block; font-size: 11px; font-weight: 700; color: #0a2e22; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">
                        One-Time Password (OTP)
                      </span>
                      <span style="display: inline-block; font-size: 36px; font-weight: 800; color: #0a2e22; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace;">
                        ${otp}
                      </span>
                      <span style="display: block; font-size: 12px; color: #6B7280; margin-top: 10px;">
                        ⏱️ Valid for <strong>10 minutes</strong> only
                      </span>
                    </div>

                    <p style="margin: 20px 0 0; color: #6B7280; font-size: 13px; line-height: 1.5;">
                      ⚠️ If you did not request this verification code, please ignore this email. Never share your OTP with anyone.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fdfcf9; border-top: 1px solid #eef0eb; padding: 20px 32px; text-align: center;">
                    <p style="margin: 0 0 6px; color: #9CA3AF; font-size: 12px;">
                      Need help? Contact our support team:
                    </p>
                    <p style="margin: 0; color: #0a2e22; font-size: 12px; font-weight: 600;">
                      📞 +91-8121135980 &nbsp;|&nbsp; ✉️ gharsansarshop@gmail.com
                    </p>
                    <p style="margin: 12px 0 0; color: #9CA3AF; font-size: 11px;">
                      © ${new Date().getFullYear()} Ghar Sansar. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Ghar Sansar" <${user}>`,
      to: toEmail,
      subject: `[${otp}] Your Ghar Sansar Login Verification Code`,
      text: `Your Ghar Sansar login verification code is: ${otp}. This code is valid for 10 minutes. Do not share it with anyone.`,
      html: htmlContent
    });

    console.log(`✅ [EMAIL SERVICE] OTP successfully delivered via Gmail SMTP to: ${toEmail} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [EMAIL SERVICE] Failed to send email via Gmail SMTP:`, err.message);
    if (err.message && (err.message.includes("Application-specific password required") || err.message.includes("534") || err.message.includes("535"))) {
      console.warn(`💡 [GMAIL TIP] Google requires a 16-character App Password instead of your regular password.`);
      console.warn(`   Generate one at: https://myaccount.google.com/apppasswords`);
      console.warn(`   Then update EMAIL_PASS in backend/.env with the 16-character code.\n`);
    }
    console.log(`📬 [OTP FALLBACK LOG] To: ${toEmail} | CODE: >>> ${otp} <<< (Valid for 10 minutes)\n`);
    return { sent: false, error: err.message, fallbackOtp: otp };
  }
}

module.exports = {
  getTransporter,
  sendOtpEmail
};
