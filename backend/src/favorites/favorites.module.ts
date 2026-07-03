import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from '../entities/favorite.entity';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { ToursModule } from '../tours/tours.module';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite]), ToursModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
})
export class FavoritesModule {}
