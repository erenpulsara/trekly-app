import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminJwtGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('agencies')
  getAllAgencies() {
    return this.adminService.getAllAgencies();
  }

  @Delete('agencies/:id')
  deleteAgency(@Param('id') id: string) {
    return this.adminService.deleteAgency(id);
  }

  @Get('tours')
  getAllTours() {
    return this.adminService.getAllTours();
  }

  @Delete('tours/:id')
  deleteTour(@Param('id') id: string) {
    return this.adminService.deleteTour(id);
  }
}
