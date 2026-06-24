import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator,
  FileTypeValidator, Optional,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { MediaService } from '../media/media.service';

@Controller('blog')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly mediaService: MediaService,
  ) {}

  /* ── Public endpoints ────────────────────────── */

  @Get()
  findPublished() {
    return this.blogService.findAllPublished();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  /* ── Admin endpoints ─────────────────────────── */

  @Get('admin/all')
  findAll() {
    return this.blogService.findAll();
  }

  @Post()
  @UseInterceptors(FileInterceptor('cover'))
  async create(
    @Body() dto: CreateBlogPostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (file) {
      const url = await this.mediaService.uploadFile(file);
      dto.cover_image = url;
    }
    return this.blogService.create(dto);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBlogPostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    if (file) {
      const url = await this.mediaService.uploadFile(file);
      dto.cover_image = url;
    }
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
