import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agency } from '../entities/agency.entity';
import { Tour } from '../entities/tour.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Agency)
    private agencyRepo: Repository<Agency>,
    @InjectRepository(Tour)
    private tourRepo: Repository<Tour>,
  ) {}

  async getAllAgencies() {
    const agencies = await this.agencyRepo.find({
      relations: ['tours'],
      order: { created_at: 'DESC' },
    });
    return agencies.map(({ password_hash: _ph, ...a }) => ({
      ...a,
      tour_count: a.tours?.length ?? 0,
      tours: undefined,
    }));
  }

  async deleteAgency(id: string) {
    const agency = await this.agencyRepo.findOne({ where: { id } });
    if (!agency) throw new NotFoundException('Acenta bulunamadı');
    await this.agencyRepo.remove(agency);
    return { message: 'Acenta silindi' };
  }

  async getAllTours() {
    return this.tourRepo.find({
      relations: ['agency'],
      order: { created_at: 'DESC' },
      select: {
        id: true,
        name: true,
        location_name: true,
        status: true,
        difficulty: true,
        price: true,
        created_at: true,
        agency: { id: true, name: true, email: true },
      },
    });
  }

  async deleteTour(id: string) {
    const tour = await this.tourRepo.findOne({ where: { id } });
    if (!tour) throw new NotFoundException('Tur bulunamadı');
    await this.tourRepo.remove(tour);
    return { message: 'Tur silindi' };
  }
}
