import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agency } from './entities/agency.entity';
import { Tour } from './entities/tour.entity';
import { TourDate } from './entities/tour-date.entity';
import { User } from './entities/user.entity';
import { Booking } from './entities/booking.entity';
import { UserPointsLog } from './entities/user-points-log.entity';
import { VerificationToken } from './entities/verification-token.entity';
import { AuthModule } from './auth/auth.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { MediaModule } from './media/media.module';
import { BlogModule } from './blog/blog.module';
import { BlogPost } from './entities/blog-post.entity';
import { Category } from './entities/category.entity';
import { AdminModule } from './admin/admin.module';
import { TursabModule } from './tursab/tursab.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60000, limit: 100 }]),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Agency, Tour, TourDate, User, Booking, UserPointsLog, VerificationToken, BlogPost, Category],
        synchronize: true, // Set to false and use migrations in production
        autoLoadEntities: true,
        ssl: (config.get<string>('DATABASE_URL')?.includes('cloudsql') ||
              config.get<string>('DATABASE_URL')?.includes('localhost') ||
              config.get<string>('DATABASE_URL')?.includes('127.0.0.1'))
          ? false
          : { rejectUnauthorized: false },
      }),
    }),

    AuthModule,
    ToursModule,
    BookingsModule,
    UsersModule,
    MediaModule,
    BlogModule,
    AdminModule,
    TursabModule,
  ],
})
export class AppModule {}
