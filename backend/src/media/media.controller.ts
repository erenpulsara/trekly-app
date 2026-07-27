import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { MediaService } from './media.service';

// Accepts agency, user, or admin JWT
class AnyJwtGuard extends AuthGuard(['jwt-agency', 'jwt-user', 'jwt-admin']) {}

// Upload sırasında dosya adına eklenen uzantıdan Content-Type çıkarımı —
// GCS'e ekstra bir metadata isteği atmadan (ağır olmayan) çözer.
const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':filename')
  async serveFile(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    try {
      const stream = await this.mediaService.getFileStream(filename);
      // Yüklenen dosyalar UUID adıyla bir kez yazılır, asla üzerine yazılmaz —
      // yani bir filename'in içeriği hiç değişmez, tarayıcı/CDN sonsuza kadar
      // (immutable) cache'leyebilir. Bu, aynı fotoğrafın kart/liste/detay gibi
      // birden çok yerde tekrar tekrar backend'den indirilmesini engelliyor.
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      const ext = filename.split('.').pop()?.toLowerCase() ?? '';
      const type = MIME_TYPES[ext];
      return new StreamableFile(stream, type ? { type } : undefined);
    } catch {
      throw new NotFoundException('File not found');
    }
  }

  @UseGuards(AnyJwtGuard)
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
      // Yalnızca görsel dosyalarına izin ver — yürütülebilir/diğer tipleri reddet
      fileFilter: (_req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Yalnızca görsel dosyaları yüklenebilir (JPEG, PNG, WEBP, GIF, AVIF)'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    return this.mediaService.uploadFile(file);
  }
}
