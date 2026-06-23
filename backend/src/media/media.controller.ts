import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import { MediaService } from './media.service';

// Accepts either an agency JWT or a user JWT
class AnyJwtGuard extends AuthGuard(['jwt-agency', 'jwt-user']) {}

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':filename')
  serveFile(@Param('filename') filename: string): StreamableFile {
    try {
      return new StreamableFile(this.mediaService.getFileStream(filename));
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  @UseGuards(AnyJwtGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.mediaService.uploadFile(file);
  }
}
