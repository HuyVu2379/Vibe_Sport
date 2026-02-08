// ===========================================
// INFRASTRUCTURE LAYER - Email Service
// ===========================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { IEmailService } from '../../application/ports/email.service.port';

/**
 * EmailService handles sending emails using Nodemailer
 * 
 * Features:
 * - Real SMTP email sending (Gmail)
 * - Connection verification on startup
 * - HTML email templates
 * - Error handling and logging
 */
@Injectable()
export class EmailService implements IEmailService, OnModuleInit {
    private readonly logger = new Logger(EmailService.name);
    private transporter: Transporter;
    private readonly emailFrom: string;

    constructor(private readonly configService: ConfigService) {
        this.emailFrom = this.configService.get<string>('email.from', 'noreply@vibesport.com');

        // Create Nodemailer transporter
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('email.host'),
            port: this.configService.get<number>('email.port'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('email.user'),
                pass: this.configService.get<string>('email.password'),
            },
        });
    }

    async onModuleInit() {
        try {
            // Verify SMTP connection configuration
            await this.transporter.verify();
            this.logger.log('✅ Email service connected successfully to SMTP server');
        } catch (error) {
            this.logger.error('❌ Failed to connect to SMTP server:', error);
            this.logger.warn('⚠️ Email sending will fail until SMTP is configured correctly');
        }
    }

    /**
     * Send OTP to user email
     * @param email - Recipient email address
     * @param otp - The OTP code to send
     */
    async sendOtp(email: string, otp: string): Promise<void> {
        try {
            const mailOptions = {
                from: `"Vibe Sport" <${this.emailFrom}>`,
                to: email,
                subject: 'Password Reset Code - Vibe Sport',
                html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏀 Vibe Sport</h1>
            <p>Password Reset Request</p>
        </div>
        <div class="content">
            <p>Dear user,</p>
            <p>You have requested to reset your password. Please use the following verification code:</p>
            
            <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">Enter this code to reset your password</p>
            </div>

            <div class="warning">
                <strong>⏱️ Important:</strong> This code will expire in <strong>5 minutes</strong>.
            </div>

            <p>If you did not request this code, please ignore this email and your password will remain unchanged.</p>
            
            <p>Best regards,<br><strong>Vibe Sport Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            this.logger.log(`📧 OTP email sent successfully to: ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send OTP email to ${email}:`, error);
            throw new Error('Failed to send OTP email');
        }
    }

    /**
     * Send password change confirmation email
     * @param email - Recipient email address
     */
    async sendPasswordChangedNotification(email: string): Promise<void> {
        try {
            const mailOptions = {
                from: `"Vibe Sport" <${this.emailFrom}>`,
                to: email,
                subject: 'Password Changed Successfully - Vibe Sport',
                html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Vibe Sport</h1>
            <p>Security Notification</p>
        </div>
        <div class="content">
            <div class="alert-box">
                <h2 style="margin-top: 0; color: #155724;">✅ Password Changed Successfully</h2>
                <p style="margin-bottom: 0;">Your password has been successfully updated.</p>
            </div>

            <p>Dear user,</p>
            <p>This email confirms that your Vibe Sport account password was recently changed.</p>
            
            <div class="warning-box">
                <strong>⚠️ Did not make this change?</strong><br>
                If you did not change your password, please contact our support team immediately at <a href="mailto:support@vibesport.com">support@vibesport.com</a>
            </div>

            <p><strong>Security Tips:</strong></p>
            <ul>
                <li>Never share your password with anyone</li>
                <li>Use a strong, unique password for your account</li>
                <li>Enable two-factor authentication when available</li>
            </ul>
            
            <p>Best regards,<br><strong>Vibe Sport Team</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
        </div>
    </div>
</body>
</html>
                `,
            };

            await this.transporter.sendMail(mailOptions);
            this.logger.log(`📧 Password changed notification sent to: ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send password changed notification to ${email}:`, error);
            // Don't throw error here - password was already changed successfully
            // Just log the error
        }
    }
}
