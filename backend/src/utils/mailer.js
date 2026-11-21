const nodemailer = require("nodemailer");

// If SMTP_* env vars aren't configured, fall back to a dev-friendly mode:
// the email is logged to the console instead of actually being sent, so the
// forgot-password flow works end-to-end without any external setup. Once
// real SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS are added to .env, mail is
// sent for real with no other code changes required.
const isSmtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : nodemailer.createTransport({ jsonTransport: true });

const sendMail = async ({ to, subject, text, html }) => {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "ShopSphere <no-reply@shopsphere.local>",
    to,
    subject,
    text,
    html,
  });

  if (!isSmtpConfigured) {
    console.log(`\n[DEV MODE — no SMTP configured] Email to ${to}:`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log("");
  }

  return info;
};

module.exports = { sendMail };
