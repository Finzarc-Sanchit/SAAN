export type OtpPurpose = 'registration' | 'resend';

export interface IEmailService {
  sendOtpEmail(to: string, otp: string, purpose: OtpPurpose): Promise<void>;
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
  sendPasswordChangedEmail(to: string): Promise<void>;
}
