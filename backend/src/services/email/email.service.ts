import nodemailer from "nodemailer";

import { env, isProduction } from "../../config/env.js";
import { logger } from "../../lib/logger.js";

/**
 * Outbound email via Gmail SMTP (free; ~500 mails/day). Without SMTP
 * credentials outside production, emails are logged instead of sent so
 * local development and tests never need a real inbox.
 */
const transporter =
  env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

if (!transporter && isProduction) {
  throw new Error("SMTP_USER and SMTP_PASS are required in production.");
}

interface Mail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

async function send(mail: Mail) {
  if (!transporter) {
    logger.warn(
      { to: mail.to, subject: mail.subject, text: mail.text },
      "SMTP not configured — email logged, not sent",
    );
    return;
  }
  await transporter.sendMail({ from: `PrepSuccess <${env.SMTP_USER}>`, ...mail });
}

const OTP_COPY = {
  SIGNUP: {
    subject: "is your PrepSuccess verification code",
    heading: "Verify your email",
    lead: "Use this code to finish creating your PrepSuccess account:",
  },
  PASSWORD_RESET: {
    subject: "is your PrepSuccess password reset code",
    heading: "Reset your password",
    lead: "Use this code to set a new password for your PrepSuccess account:",
  },
} as const;

export async function sendOtpEmail(
  to: string,
  code: string,
  ttlMinutes: number,
  purpose: keyof typeof OTP_COPY = "SIGNUP",
) {
  const copy = OTP_COPY[purpose];
  await send({
    to,
    subject: `${code} ${copy.subject}`,
    text: `${copy.lead} ${code}. It expires in ${ttlMinutes} minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1f2937">
        <h2 style="margin:0 0 16px">${copy.heading}</h2>
        <p style="margin:0 0 16px">${copy.lead}</p>
        <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:0 0 16px">${code}</p>
        <p style="margin:0;color:#6b7280;font-size:14px">It expires in ${ttlMinutes} minutes. If you didn't request this, you can ignore this email.</p>
      </div>`,
  });
}
