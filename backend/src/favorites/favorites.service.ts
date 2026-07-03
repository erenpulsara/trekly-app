import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from '../entities/favorite.entity';
import { Tour } from '../entities/tour.entity';
import { ToursService } from '../tours/tours.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private favoriteRepo: Repository<Favorite>,
    private toursService: ToursService,
  ) {}

  async list(userId: string): Promise<Tour[]> {
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
    const tourIds = favorites.map((f) => f.tour_id);
    const tours = await this.toursService.findManyByIds(tourIds);
    // Preserve favorited order (most recently favorited first)
    const byId = new Map(tours.map((t) => [t.id, t]));
    return tourIds.map((id) => byId.get(id)).filter((t): t is Tour => !!t);
  }

  async listIds(userId: string): Promise<string[]> {
    const favorites = await this.favoriteRepo.find({
      where: { user_id: userId },
      select: ['tour_id'],
    });
    return favorites.map((f) => f.tour_id);
  }

  async add(userId: string, tourId: string): Promise<{ favorited: true }> {
    const existing = await this.favoriteRepo.findOne({
      where: { user_id: userId, tour_id: tourId },
    });
    if (!existing) {
      await this.favoriteRepo.save(
        this.favoriteRepo.create({ user_id: userId, tour_id: tourId }),
      );
    }
    return { favorited: true };
  }

  async remove(userId: string, tourId: string): Promise<{ favorited: false }> {
    await this.favoriteRepo.delete({ user_id: userId, tour_id: tourId });
    return { favorited: false };
  }
}
