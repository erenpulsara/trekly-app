import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { Agency } from '../entities/agency.entity';
import { User } from '../entities/user.entity';
import { VerificationToken } from '../entities/verification-token.entity';
import { EmailService } from '../email/email.service';
import { AgencyRegisterDto } from './dto/agency-register.dto';
import { AgencyLoginDto } from './dto/agency-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepo: Repository<Agency>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(VerificationToken)
    private tokenRepo: Repository<VerificationToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  // ── Agency ──────────────────────────────────────────────────────────────

  async registerAgency(dto: AgencyRegisterDto) {
    const existing = await this.agencyRepo.findOne({
      where: { email: dto.email },
    });

    if (existing?.email_verified) {
      throw new ConflictException('Bu e-posta adresi zaten kayıtlı');
    }

    // Delete unverified duplicate so we can re-register cleanly
    if (existing && !existing.email_verified) {
      await this.tokenRepo.delete({ agency_id: existing.id });
      await this.agencyRepo.delete(existing.id);
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const agency = this.agencyRepo.create({
      name: dto.name,
      email: dto.email,
      password_hash,
      email_verified: false,
      verified_at: null,
    });
    const saved = await this.agencyRepo.save(agency);

    const otp = this.generateOtp();
    await this.tokenRepo.save(
      this.tokenRepo.create({
        agency_id: saved.id,
        otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      }),
    );

    try {
      await this.emailService.sendOtp(saved.email, otp);
    } catch {
      // Email failed — still succeed so user can use resend
    }

    return { message: 'Doğrulama kodu e-posta adresinize gönderildi' };
  }

  async verifyAndWelcomeAgency(email: string, otp: string) {
    const result = await this.verifyAgencyEmail(email, otp);
    // Send welcome email after successful verification (non-blocking)
    const agency = await this.agencyRepo.findOne({ where: { email } });
    if (agency) {
      this.emailService.sendAgencyWelcome(agency.email, agency.name).catch(() => {});
    }
    return result;
  }

  async verifyAgencyEmail(email: string, otp: string) {
    const agency = await this.agencyRepo.findOne({ where: { email } });
    if (!agency) throw new NotFoundException('Hesap bulunamadı');
    if (agency.email_verified) throw new ConflictException('Hesap zaten doğrulanmış');

    const token = await this.tokenRepo.findOne({
      where: {
        agency_id: agency.id,
        otp,
        used: false,
        expires_at: MoreThan(new Date()),
      },
    });

    if (!token) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş doğrulama kodu');
    }

    token.used = true;
    await this.tokenRepo.save(token);

    agency.email_verified = true;
    agency.verified_at = new Date();
    await this.agencyRepo.save(agency);

    const access_token = this.signAgencyToken(agency.id, agency.email);
    const { password_hash: _ph, ...agencyData } = agency;
    return { access_token, ...agencyData };
  }

  async resendAgencyOtp(email: string) {
    const agency = await this.agencyRepo.findOne({ where: { email } });
    if (!agency) throw new NotFoundException('Hesap bulunamadı');
    if (agency.email_verified) throw new ConflictException('Hesap zaten doğrulanmış');

    // Invalidate existing tokens
    await this.tokenRepo.update(
      { agency_id: agency.id, used: false },
      { used: true },
    );

    const otp = this.generateOtp();
    await this.tokenRepo.save(
      this.tokenRepo.create({
        agency_id: agency.id,
        otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        used: false,
      }),
    );

    try {
      await this.emailService.sendOtp(agency.email, otp);
    } catch {
      // Email failed silently
    }
    return { message: 'Yeni doğrulama kodu gönderildi' };
  }

  async loginAgency(dto: AgencyLoginDto) {
    const agency = await this.agencyRepo.findOne({
      where: { email: dto.email },
    });
    if (!agency) {
      throw new UnauthorizedException('Geçersiz kimlik bilgileri');
    }

    const valid = await bcrypt.compare(dto.password, agency.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Geçersiz kimlik bilgileri');
    }

    if (!agency.email_verified) {
      throw new ForbiddenException({
        message: 'E-posta adresinizi doğrulamanız gerekiyor',
        email: agency.email,
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (agency.is_suspended) {
      throw new ForbiddenException({
        message: 'Hesabınız askıya alınmıştır. Destek için iletişime geçin.',
        code: 'ACCOUNT_SUSPENDED',
      });
    }

    const access_token = this.signAgencyToken(agency.id, agency.email);
    const { password_hash: _ph, ...agencyData } = agency;
    return { access_token, ...agencyData };
  }

  private signAgencyToken(agencyId: string, email: string): string {
    return this.jwtService.sign(
      { sub: agencyId, email, type: 'agency' },
      { secret: this.configService.get<string>('JWT_AGENCY_SECRET') },
    );
  }

  // ── User ─────────────────────────────────────────────────────────────────

  async registerUser(dto: UserRegisterDto) {
    const existing = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      name: dto.name,
      surname: dto.surname,
      email: dto.email,
      password_hash,
      phone: dto.phone ?? null,
    });
    const saved = await this.userRepo.save(user);

    const token = this.signUserToken(saved.id, saved.email);
    const { password_hash: _ph, ...userData } = saved;
    return { access_token: token, ...userData };
  }

  async loginUser(dto: UserLoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signUserToken(user.id, user.email);
    const { password_hash: _ph, ...userData } = user;
    return { access_token: token, ...userData };
  }

  // Google ID token'ı doğrulayıp e-postaya göre kullanıcıyı bulur/oluşturur/eşler.
  // Şifre gerekmez; imza doğrulaması Google'ın public sertifikalarıyla yapılır.
  async loginWithGoogle(idToken: string) {
    const webClientId = this.configService.get<string>('GOOGLE_WEB_CLIENT_ID');
    const androidClientId = this.configService.get<string>('GOOGLE_ANDROID_CLIENT_ID');
    const androidClientIdEas = this.configService.get<string>('GOOGLE_ANDROID_CLIENT_ID_EAS');
    const iosClientId = this.configService.get<string>('GOOGLE_IOS_CLIENT_ID');
    const audience = [webClientId, androidClientId, androidClientIdEas, iosClientId].filter((id): id is string => !!id);
    if (audience.length === 0) {
      throw new UnauthorizedException('Google login is not configured');
    }

    const client = new OAuth2Client();
    let payload;
    try {
      const ticket = await client.verifyIdToken({ idToken, audience });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
    if (!payload?.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const googleId = payload.sub;
    let user = await this.userRepo.findOne({ where: { google_id: googleId } });

    if (!user) {
      user = await this.userRepo.findOne({ where: { email: payload.email } });
      if (user) {
        // Mevcut e-posta/şifre hesabına Google girişini bağla
        user.google_id = googleId;
        user = await this.userRepo.save(user);
      }
    }

    if (!user) {
      const created = this.userRepo.create({
        name: payload.given_name ?? payload.name ?? 'Trekly',
        surname: payload.family_name ?? '',
        email: payload.email,
        password_hash: null,
        google_id: googleId,
      });
      user = await this.userRepo.save(created);
    }

    const token = this.signUserToken(user.id, user.email);
    const { password_hash: _ph, ...userData } = user;
    return { access_token: token, ...userData };
  }

  // Apple identity token'ı doğrulayıp e-postaya göre kullanıcıyı bulur/oluşturur/eşler.
  // Apple, ad-soyad ve e-postayı yalnızca İLK girişte gönderir; sonraki girişlerde
  // sadece "sub" (apple_id) gelir, o yüzden ilk eşleme apple_id üzerinden yapılır.
  async loginWithApple(identityToken: string, fullName?: string) {
    const bundleId = this.configService.get<string>('APPLE_BUNDLE_ID') ?? 'com.treklyapp.treklyy';
    const servicesId = this.configService.get<string>('APPLE_SERVICES_ID') ?? 'com.treklyapp.treklyy.web';
    // Yalnızca yerel/dev testte kullanılır — Expo Go'nun kendi bundle ID'si.
    // Production .env/deploy.yml'de bu değişken YOK, o yüzden canlıda hiç eklenmez.
    const expoGoDebugId = this.configService.get<string>('APPLE_EXPO_GO_DEBUG_ID');
    const audience = [bundleId, servicesId, expoGoDebugId].filter((id): id is string => !!id);

    let payload;
    try {
      // Native app (bundle ID), web (Services ID) ve varsa Expo Go debug ID'si — hepsi kabul edilir.
      payload = await appleSignin.verifyIdToken(identityToken, { audience });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Apple verifyIdToken] failed:', err);
      throw new UnauthorizedException('Invalid Apple token');
    }

    const appleId = payload.sub;
    let user = await this.userRepo.findOne({ where: { apple_id: appleId } });

    if (!user && payload.email) {
      user = await this.userRepo.findOne({ where: { email: payload.email } });
      if (user) {
        // Mevcut e-posta/şifre hesabına Apple girişini bağla
        user.apple_id = appleId;
        user = await this.userRepo.save(user);
      }
    }

    if (!user) {
      if (!payload.email) {
        throw new UnauthorizedException('Apple sign-in requires email on first use');
      }
      const [first, ...rest] = (fullName ?? 'Trekly').trim().split(/\s+/);
      const created = this.userRepo.create({
        name: first || 'Trekly',
        surname: rest.join(' '),
        email: payload.email,
        password_hash: null,
        apple_id: appleId,
      });
      user = await this.userRepo.save(created);
    }

    const token = this.signUserToken(user.id, user.email);
    const { password_hash: _ph, ...userData } = user;
    return { access_token: token, ...userData };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'Kod gönderildi' };

    const code = this.generateOtp();
    user.password_reset_token = code;
    user.password_reset_expires = new Date(Date.now() + 60 * 60 * 1000);
    await this.userRepo.save(user);

    try {
      await this.emailService.sendPasswordReset(email, code);
    } catch {
      // Silent fail
    }

    return { message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi' };
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (
      !user ||
      !user.password_reset_token ||
      !user.password_reset_expires ||
      user.password_reset_token !== code ||
      user.password_reset_expires < new Date()
    ) {
      throw new UnauthorizedException('Geçersiz veya süresi dolmuş kod');
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.password_reset_token = null;
    user.password_reset_expires = null;
    await this.userRepo.save(user);

    return { message: 'Şifreniz başarıyla güncellendi' };
  }

  private signUserToken(userId: string, email: string): string {
    return this.jwtService.sign(
      { sub: userId, email, type: 'user' },
      { secret: this.configService.get<string>('JWT_SECRET') },
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  async loginAdmin(email: string, password: string) {
    const adminEmail = (this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@treklyapp.com').trim();
    const adminPassword = (this.configService.get<string>('ADMIN_PASSWORD') ?? '').trim();

    if (email.trim() !== adminEmail || password !== adminPassword) {
      throw new UnauthorizedException('Geçersiz kimlik bilgileri');
    }

    const token = this.jwtService.sign(
      { sub: 'admin', email, type: 'admin' },
      { secret: this.configService.get<string>('JWT_AGENCY_SECRET') },
    );
    return { access_token: token };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
