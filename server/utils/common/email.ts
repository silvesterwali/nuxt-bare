import nodemailer from "nodemailer";

export interface EmailConfig {
  from: string;
  appName: string;
  appUrl: string;
}

export const EMAIL_CONFIG: EmailConfig = {
  from: process.env.MAIL_FROM || "noreply@example.com",
  appName: process.env.APP_NAME || "Nuxt App",
  appUrl: process.env.APP_URL || "http://localhost:3000",
};

// Create nodemailer transporter
function createTransporter() {
  const config = useRuntimeConfig();

  return nodemailer.createTransport({
    host: config.mailHost,
    port: parseInt(config.mailPort as string),
    secure: config.mailSecure, // true for 465, false for other ports
    auth: {
      user: config.mailUsername,
      pass: config.mailPassword,
    },
    tls: {
      rejectUnauthorized: false, // For development - remove in production
    },
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${EMAIL_CONFIG.appUrl}/verify-email?token=${token}`;

  // Render the email template using nuxt-email-renderer
  // @ts-ignore: $render is auto-imported by nuxt-email-renderer
  const html = await renderEmailComponent("EmailVerification", {
    appName: EMAIL_CONFIG.appName,
    verificationUrl,
  });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: EMAIL_CONFIG.from,
    to: email,
    subject: `Verify your email address - ${EMAIL_CONFIG.appName}`,
    html: html as string, // Use the rendered HTML content
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${token}`;

  // Render the email template using nuxt-email-renderer
  // @ts-ignore: $render is auto-imported by nuxt-email-renderer
  const html = await renderEmailComponent("PasswordReset", {
    appName: EMAIL_CONFIG.appName,
    resetUrl,
  });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: EMAIL_CONFIG.from,
    to: email,
    subject: `Reset your password - ${EMAIL_CONFIG.appName}`,
    html: html as string, // Use the rendered HTML content
  });
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const loginUrl = `${EMAIL_CONFIG.appUrl}/login`;

  // Render the email template using nuxt-email-renderer
  // @ts-ignore: $render is auto-imported by nuxt-email-renderer
  const html = await renderEmailComponent("Welcome", {
    appName: EMAIL_CONFIG.appName,
    firstName,
    loginUrl,
  });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: EMAIL_CONFIG.from,
    to: email,
    subject: `Welcome to ${EMAIL_CONFIG.appName}!`,
    html: html as string, // Use the rendered HTML content
  });
}

export async function sendAccountDeactivationEmail(email: string, firstName: string) {
  // Render the email template using nuxt-email-renderer
  // @ts-ignore: $render is auto-imported by nuxt-email-renderer
  const html = await renderEmailComponent("AccountDeactivation", {
    appName: EMAIL_CONFIG.appName,
    firstName,
  });

  const transporter = createTransporter();

  await transporter.sendMail({
    from: EMAIL_CONFIG.from,
    to: email,
    subject: `Account Deactivated - ${EMAIL_CONFIG.appName}`,
    html: html as string, // Use the rendered HTML content
  });
}
