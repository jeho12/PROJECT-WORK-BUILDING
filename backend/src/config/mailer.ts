import nodemailer from 'nodemailer';
import { env } from './env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

interface SessionEmailData {
  studentEmail: string;
  studentName: string;
  supervisorName: string;
  title: string;
  scheduledAt: Date;
  joinUrl: string;
}

interface WelcomeEmailData {
  email: string;
  name: string;
}

interface LoginNotificationData {
  email: string;
  name: string;
  role: string;
  ipAddress?: string;
  userAgent?: string;
}

export const emailService = {
  async sendSessionNotification(data: SessionEmailData) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: data.studentEmail,
        subject: `SIWES Supervision Session Scheduled: ${data.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Anchor University SIWES Portal</h2>
            <p>Dear ${data.studentName},</p>
            <p>Your academic supervisor <strong>${data.supervisorName}</strong> has scheduled an online supervision session.</p>
            <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 30%;">Session Title:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${data.title}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Date & Time:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${data.scheduledAt.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Join URL:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;"><a href="${data.joinUrl}" style="color: #3b82f6; text-decoration: underline;">${data.joinUrl}</a></td>
              </tr>
            </table>
            <p style="color: #64748B; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              Note: Your location will be verified before you can join the session.
              Please ensure you are at your registered training organization.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send session notification email:', error);
    }
  },

  async sendWelcomeEmail(data: WelcomeEmailData) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: data.email,
        subject: 'Welcome to Anchor University SIWES Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Anchor University SIWES Portal</h2>
            <p>Dear ${data.name},</p>
            <p>Your SIWES portal account has been successfully created. You can now log in using your email and password.</p>
            <p>Please complete your student profile and map your organization location immediately upon logging in to enable logbook entries and GPS checks.</p>
            <p style="color: #64748B; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              This is an automated system email. Please do not reply directly.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  },

  async sendWeeklyReportNotification(supervisorEmail: string, studentName: string) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: supervisorEmail,
        subject: `New Weekly Report Submitted — ${studentName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Anchor University SIWES Portal</h2>
            <p>Dear Supervisor,</p>
            <p>Student <strong>${studentName}</strong> has submitted a new weekly report for your review.</p>
            <p>Please log into your dashboard to review their daily logs, attendance history, and provide academic approval.</p>
            <p style="color: #64748B; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
              This is an automated system email. Please do not reply directly.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send weekly report notification email:', error);
    }
  },

  async sendLoginNotification(data: LoginNotificationData) {
    try {
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: data.email,
        subject: 'Security Alert: New Sign-in to Anchor University SIWES Portal',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px;">
            <h2 style="color: #1E40AF; margin-top: 0;">Anchor University SIWES Portal</h2>
            <p>Dear ${data.name},</p>
            <p>Your SIWES portal account was successfully logged into.</p>
            <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; width: 30%;">User Role:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-transform: capitalize;">${data.role}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">Date & Time:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9;">${new Date().toLocaleString()}</td>
              </tr>
              ${data.ipAddress ? `
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold;">IP Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-family: monospace;">${data.ipAddress}</td>
              </tr>` : ''}
            </table>
            <p style="color: #DC2626; font-size: 12px; font-weight: bold;">
              If you did not initiate this login, please contact the SIWES Portal administrator immediately to secure your credentials.
            </p>
            <p style="color: #64748B; font-size: 12px; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 16px;">
              This is an automated system security email. Please do not reply directly.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Failed to send login notification email:', error);
    }
  },
};
