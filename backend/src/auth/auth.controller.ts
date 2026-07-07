import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AgencyRegisterDto } from './dto/agency-register.dto';
import { AgencyLoginDto } from './dto/agency-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';

// Brute-force koruması: kimlik doğrulama uçları IP başına dakikada sınırlı
// sayıda denemeye izin verir. Aşılırsa 429 Too Many Requests döner.
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('agency/register')
  registerAgency(@Body() dto: AgencyRegisterDto) {
    return this.authService.registerAgency(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('agency/login')
  loginAgency(@Body() dto: AgencyLoginDto) {
    return this.authService.loginAgency(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('agency/verify-email')
  verifyAgencyEmail(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyAndWelcomeAgency(body.email, body.otp);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('agency/resend-otp')
  resendAgencyOtp(@Body() body: { email: string }) {
    return this.authService.resendAgencyOtp(body.email);
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('user/register')
  registerUser(@Body() dto: UserRegisterDto) {
    return this.authService.registerUser(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('user/login')
  loginUser(@Body() dto: UserLoginDto) {
    return this.authService.loginUser(dto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('admin/login')
  loginAdmin(@Body() body: { email: string; password: string }) {
    return this.authService.loginAdmin(body.email, body.password);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('user/forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('user/reset-password')
  resetPassword(@Body() body: { email: string; code: string; new_password: string }) {
    return this.authService.resetPassword(body.email, body.code, body.new_password);
  }
}
