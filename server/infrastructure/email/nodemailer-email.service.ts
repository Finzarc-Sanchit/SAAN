import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../middlewares/request-logger';
import type { IEmailService, OtpPurpose } from './email.interface';

type EmailContent = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function getFromAddress(): string {
  return `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM_ADDRESS}>`;
}

export class NodemailerEmailService implements IEmailService {
  private readonly transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  async sendOtpEmail(to: string, otp: string, purpose: OtpPurpose): Promise<void> {
    const subject =
      purpose === 'registration'
        ? 'Verify your SAAN account'
        : 'Your SAAN verification code';

    await this.sendEmail(
      {
        to,
        subject,
        text: `Your verification code is ${otp}. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`,
        html: `<p>Your verification code is <strong>${otp}</strong>.</p><p>It expires in ${env.OTP_EXPIRY_MINUTES} minutes.</p>`,
      },
      { to, purpose },
      'OTP email sent',
    );
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    await this.sendEmail(
      {
        to,
        subject: 'Reset your SAAN password',
        text: `Reset your password using this link: ${resetLink}`,
        html: `<p>Reset your password using this link:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      },
      { to },
      'Password reset email sent',
    );
  }

  async sendPasswordChangedEmail(to: string): Promise<void> {
    await this.sendEmail(
      {
        to,
        subject: 'Your SAAN password was changed',
        text: 'Your password was changed. If you did not make this change, contact support immediately.',
        html: '<p>Your password was changed. If you did not make this change, contact support immediately.</p>',
      },
      { to },
      'Password changed notification sent',
    );
  }

  private async sendEmail(
    content: EmailContent,
    logContext: Record<string, unknown>,
    logMessage: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: getFromAddress(),
      to: content.to,
      subject: content.subject,
      text: content.text,
      html: content.html,
    });

    logger.info(logContext, logMessage);
  }
}
