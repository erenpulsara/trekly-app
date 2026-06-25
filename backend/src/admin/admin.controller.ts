import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminJwtGuard } from '../auth/guards/admin-jwt.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AdminJwtGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Stats ─────────────────────────────────────────────────────────────────
  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  // ── Agencies ──────────────────────────────────────────────────────────────
  @Get('agencies')
  getAllAgencies() { return this.adminService.getAllAgencies(); }

  @Delete('agencies/:id')
  deleteAgency(@Param('id') id: string) { return this.adminService.deleteAgency(id); }

  // ── Tours ─────────────────────────────────────────────────────────────────
  @Get('tours')
  getAllTours() { return this.adminService.getAllTours(); }

  @Delete('tours/:id')
  deleteTour(@Param('id') id: string) { return this.adminService.deleteTour(id); }

  // ── Bookings ──────────────────────────────────────────────────────────────
  @Get('bookings')
  getAllBookings() { return this.adminService.getAllBookings(); }

  // ── Blog ──────────────────────────────────────────────────────────────────
  @Get('blog')
  getAllBlogPosts() { return this.adminService.getAllBlogPosts(); }

  @Post('blog')
  createBlogPost(@Body() dto: any) { return this.adminService.createBlogPost(dto); }

  @Patch('blog/:id')
  updateBlogPost(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateBlogPost(id, dto);
  }

  @Delete('blog/:id')
  deleteBlogPost(@Param('id') id: string) { return this.adminService.deleteBlogPost(id); }

  // ── Categories ────────────────────────────────────────────────────────────
  @Get('categories')
  getAllCategories() { return this.adminService.getAllCategories(); }

  @Post('categories')
  createCategory(@Body() dto: any) { return this.adminService.createCategory(dto); }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) { return this.adminService.deleteCategory(id); }
}
