import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.config.get<string>('GMAIL_USER'),
        pass: this.config.get<string>('GMAIL_APP_PASSWORD'),
      },
    });
  }

  private get from(): string {
    return `Trekly <${this.config.get<string>('GMAIL_USER')}>`;
  }

  async sendOtp(to: string, otp: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Trekly - E-posta Doğrulama',
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1A1A2E;padding:24px 32px;border-radius:12px 12px 0 0;">
              <span style="font-size:20px;font-weight:800;color:#FF5533;">Trekly</span>
              <span style="display:block;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Acente Paneli</span>
            </div>
            <div style="background:#fff;padding:36px 32px;border:1px solid #E8E8E8;border-top:none;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#1A1A1A;">E-posta Doğrulama</h2>
              <p style="margin:0 0 28px;font-size:15px;color:#5A5A5A;line-height:1.6;">Trekly acente hesabınızı doğrulamak için aşağıdaki 6 haneli kodu girin. Kod <strong>15 dakika</strong> geçerlidir.</p>
              <div style="background:#F7F7F7;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;">
                <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1A1A1A;">${otp}</div>
              </div>
              <p style="margin:0;font-size:13px;color:#909090;">Bu kodu siz talep etmediyseniz bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
            <div style="background:#F7F7F7;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #E8E8E8;border-top:none;">
              <p style="margin:0;font-size:12px;color:#BBBBBB;">© ${new Date().getFullYear()} Trekly. Tüm hakları saklıdır.</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error(`OTP email failed to ${to}: ${err}`);
      throw new Error('Email gönderilemedi');
    }
  }

  async sendPasswordReset(to: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Trekly - Şifre Sıfırlama',
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1A1A2E;padding:24px 32px;border-radius:12px 12px 0 0;">
              <span style="font-size:20px;font-weight:800;color:#FF5533;">Trekly</span>
            </div>
            <div style="background:#fff;padding:36px 32px;border:1px solid #E8E8E8;border-top:none;">
              <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;color:#1A1A1A;">Şifre Sıfırlama</h2>
              <p style="margin:0 0 28px;font-size:15px;color:#5A5A5A;line-height:1.6;">Şifre sıfırlama kodunuz:</p>
              <div style="background:#FFF3EE;border-radius:10px;padding:24px;text-align:center;margin-bottom:28px;border:2px solid #FF5533;">
                <div style="font-size:40px;font-weight:800;letter-spacing:12px;color:#FF5533;">${code}</div>
              </div>
              <p style="margin:0;font-size:14px;color:#5A5A5A;">Bu kod <strong>1 saat</strong> geçerlidir.</p>
              <p style="margin:8px 0 0;font-size:13px;color:#909090;">Bu talebi siz yapmadıysanız şifreniz güvende, bu e-postayı görmezden gelebilirsiniz.</p>
            </div>
            <div style="background:#F7F7F7;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #E8E8E8;border-top:none;">
              <p style="margin:0;font-size:12px;color:#BBBBBB;">© ${new Date().getFullYear()} Trekly. Tüm hakları saklıdır.</p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error(`Password reset email failed to ${to}: ${err}`);
      throw new Error('Email gönderilemedi');
    }
  }

  async sendAgencyWelcome(to: string, agencyName: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Trekly - Hoş Geldiniz!',
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:0 auto;padding:40px 20px;">
            <div style="background:#1A1A2E;padding:24px 32px;border-radius:12px 12px 0 0;">
              <span style="font-size:20px;font-weight:800;color:#FF5533;">Trekly</span>
              <span style="display:block;font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.1em;margin-top:2px;">Acente Paneli</span>
            </div>
            <div style="background:#fff;padding:36px 32px;border:1px solid #E8E8E8;border-top:none;">
              <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#1A1A1A;">Hoş Geldiniz, ${agencyName}! 🎉</h2>
              <p style="margin:0 0 16px;font-size:15px;color:#5A5A5A;line-height:1.7;">
                Trekly ailesine katıldığınız için çok mutluyuz. Hesabınız başarıyla doğrulandı ve artık acente panelinize erişebilirsiniz.
              </p>
              <p style="margin:0 0 16px;font-size:15px;color:#5A5A5A;line-height:1.7;">
                Acente panelinizden şunları yapabilirsiniz:
              </p>
              <ul style="margin:0 0 24px;padding-left:20px;font-size:15px;color:#5A5A5A;line-height:2;">
                <li>Turlarınızı oluşturun ve yönetin</li>
                <li>Rezervasyon taleplerini takip edin</li>
                <li>Acente profilinizi düzenleyin</li>
              </ul>
              <a href="https://acenta.treklyapp.com" style="display:inline-block;background:#FF5533;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">
                Acente Paneline Git →
              </a>
            </div>
            <div style="background:#F7F7F7;padding:16px 32px;border-radius:0 0 12px 12px;border:1px solid #E8E8E8;border-top:none;">
              <p style="margin:0;font-size:12px;color:#BBBBBB;">© ${new Date().getFullYear()} Trekly. Tüm hakları saklıdır. • <a href="https://acenta.treklyapp.com" style="color:#BBBBBB;">acenta.treklyapp.com</a></p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error(`Welcome email failed to ${to}: ${err}`);
      // Non-fatal — don't throw
    }
  }
}
