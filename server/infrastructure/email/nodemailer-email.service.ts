import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../middlewares/request-logger';
import type { IEmailDeliveryService } from './email-delivery.interface';
import type { EmailJob } from './email-job.types';

type EmailContent = {
  to: string;
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
};

function getFromAddress(): string {
  return `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function wrapEmail(content: string): string {
  return `<div style="font-family:Arial,sans-serif;color:#28241f;line-height:1.6;max-width:640px;margin:0 auto"><p style="font-family:Georgia,serif;font-size:24px;letter-spacing:.08em">SAAN</p>${content}<p style="margin-top:32px;color:#6f685f;font-size:12px">This is an automated transactional message from SAAN.</p></div>`;
}

export class NodemailerEmailService implements IEmailDeliveryService {
  private readonly transporter = nodemailer.createTransport({
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  async deliver(job: EmailJob): Promise<void> {
    const content = this.createContent(job);
    await this.transporter.sendMail({
      from: getFromAddress(),
      ...content,
    });
    logger.info({ emailType: job.type }, 'Transactional email delivered');
  }

  private createContent(job: EmailJob): EmailContent {
    switch (job.type) {
      case 'otp': {
        const subject =
          job.purpose === 'registration'
            ? 'Verify your SAAN account'
            : 'Your SAAN verification code';
        return {
          to: job.to,
          subject,
          text: `Your verification code is ${job.otp}. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`,
          html: wrapEmail(
            `<p>Your verification code is:</p><p style="font-size:28px;letter-spacing:.2em"><strong>${job.otp}</strong></p><p>It expires in ${env.OTP_EXPIRY_MINUTES} minutes.</p>`,
          ),
        };
      }
      case 'password-reset':
        return {
          to: job.to,
          subject: 'Reset your SAAN password',
          text: `Reset your password using this link: ${job.resetLink}`,
          html: wrapEmail(
            `<p>Reset your password using the secure link below:</p><p><a href="${escapeHtml(job.resetLink)}">Reset password</a></p>`,
          ),
        };
      case 'password-changed':
        return {
          to: job.to,
          subject: 'Your SAAN password was changed',
          text: 'Your password was changed. If you did not make this change, contact support immediately.',
          html: wrapEmail(
            '<p>Your password was changed. If you did not make this change, contact support immediately.</p>',
          ),
        };
      case 'contact-confirmation':
        return {
          to: job.to,
          subject: 'We received your message — SAAN',
          text: `Hello ${job.name}, we received your message about "${job.subject}". Our team will respond as soon as possible.`,
          html: wrapEmail(
            `<p>Hello ${escapeHtml(job.name)},</p><p>We received your message about “${escapeHtml(job.subject)}”. Our team will respond as soon as possible.</p>`,
          ),
        };
      case 'contact-admin-notification':
        return {
          to: env.ADMIN_EMAIL,
          replyTo: job.email,
          subject: `New contact enquiry: ${job.subject}`,
          text: `Name: ${job.name}\nEmail: ${job.email}\nPhone: ${job.phone}\nSubject: ${job.subject}\n\n${job.message}`,
          html: wrapEmail(
            `<p><strong>New contact enquiry</strong></p><p><strong>Name:</strong> ${escapeHtml(job.name)}<br><strong>Email:</strong> ${escapeHtml(job.email)}<br><strong>Phone:</strong> ${escapeHtml(job.phone)}<br><strong>Subject:</strong> ${escapeHtml(job.subject)}</p><p style="white-space:pre-wrap">${escapeHtml(job.message)}</p>`,
          ),
        };
    }
  }
}
