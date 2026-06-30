import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MediaService {
  private storage: Storage;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    // Application Default Credentials — works on Cloud Run without a key file
    this.storage = new Storage({
      projectId: this.configService.get<string>('GCP_PROJECT_ID'),
    });
    this.bucketName =
      this.configService.get<string>('GCP_STORAGE_BUCKET') ??
      'natura-tours-media';
  }

  async uploadFile(file: Express.Multer.File): Promise<{ url: string }> {
    try {
      const ext = file.originalname.split('.').pop() ?? 'bin';
      const filename = `${uuidv4()}.${ext}`;
      const bucket = this.storage.bucket(this.bucketName);
      const blob = bucket.file(filename);

      await blob.save(file.buffer, {
        contentType: file.mimetype,
        resumable: false,
        public: true,
      });

      const url = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
      return { url };
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to upload file: ${(err as Error).message}`,
      );
    }
  }

  async getFileStream(filename: string): Promise<import('stream').Readable> {
    const file = this.storage.bucket(this.bucketName).file(filename);
    const [exists] = await file.exists();
    if (!exists) throw new Error('not_found');
    return file.createReadStream() as import('stream').Readable;
  }

  getBucketName(): string {
    return this.bucketName;
  }
}
