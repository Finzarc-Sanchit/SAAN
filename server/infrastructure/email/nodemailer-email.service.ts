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

function wrapNewsletter(content: string, preheader?: string): string {
  const hiddenPreheader = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(preheader)}</div>`
    : '';
  const paragraphs = escapeHtml(content)
    .split(/\r?\n\r?\n/)
    .map((paragraph) => `<p style="margin:0 0 18px">${paragraph.replaceAll('\n', '<br>')}</p>`)
    .join('');

  return `${hiddenPreheader}<div style="font-family:Arial,sans-serif;color:#0b0a09;line-height:1.7;max-width:640px;margin:0 auto;padding:32px 20px"><p style="font-family:Georgia,serif;font-size:26px;letter-spacing:.08em;margin:0 0 32px">SAAN</p>${paragraphs}<p style="margin-top:36px;padding-top:20px;border-top:1px solid #e5e5e5;color:#666;font-size:12px">You received this email because you subscribed to SAAN updates. Contact SAAN if you would like to unsubscribe.</p></div>`;
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
    logger.info({ emailType: job.type }, 'Email delivered');
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
      case 'newsletter':
        return {
          to: job.to,
          subject: job.subject,
          text: `${job.preheader ? `${job.preheader}\n\n` : ''}${job.content}\n\nYou received this email because you subscribed to SAAN updates.`,
          html: wrapNewsletter(job.content, job.preheader),
        };
    }
  }
}
