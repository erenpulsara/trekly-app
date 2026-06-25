import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [Agency, Tour, TourDate, User, Booking, UserPointsLog, VerificationToken, BlogPost],
        synchronize: true, // Set to false and use migrations in production
        autoLoadEntities: true,
        ssl: config.get<string>('DATABASE_URL')?.includes('cloudsql')
          ? false // Cloud SQL proxy handles SSL
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
  ],
})
export class AppModule {}
