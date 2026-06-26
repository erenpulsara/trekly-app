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

  @Patch('agencies/:id/verify')
  verifyAgency(@Param('id') id: string) { return this.adminService.verifyAgency(id); }

  @Patch('agencies/:id/suspend')
  suspendAgency(@Param('id') id: string, @Body() body: { suspend: boolean }) {
    return this.adminService.suspendAgency(id, body.suspend);
  }

  @Delete('agencies/:id')
  deleteAgency(@Param('id') id: string) { return this.adminService.deleteAgency(id); }

  // ── Tours ─────────────────────────────────────────────────────────────────
  @Get('tours')
  getAllTours() { return this.adminService.getAllTours(); }

  @Patch('tours/:id/status')
  updateTourStatus(@Param('id') id: string, @Body() dto: { status: 'draft' | 'published' | 'rejected'; admin_note?: string }) {
    return this.adminService.updateTourStatus(id, dto.status, dto.admin_note);
  }

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

  // ── Users ─────────────────────────────────────────────────────────────────
  @Get('users')
  getAllUsers() { return this.adminService.getAllUsers(); }

  @Patch('users/:id/ban')
  banUser(@Param('id') id: string) { return this.adminService.banUser(id); }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) { return this.adminService.activateUser(id); }

  // ── Reports ───────────────────────────────────────────────────────────────
  @Get('reports')
  getReports() { return this.adminService.getReports(); }

  // ── Audit Logs ────────────────────────────────────────────────────────────
  @Get('audit-logs')
  getAuditLogs() { return this.adminService.getAuditLogs(); }

  // ── Settings ──────────────────────────────────────────────────────────────
  @Get('settings')
  getSettings() { return this.adminService.getSettings(); }

  @Patch('settings')
  updateSettings(@Body() dto: any) { return this.adminService.updateSettings(dto); }

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
