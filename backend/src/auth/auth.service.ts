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
    if (!user) {
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

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
