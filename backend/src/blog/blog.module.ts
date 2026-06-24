import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from '../entities/blog-post.entity';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TypeOrmModule.forFeature([BlogPost]), MediaModule],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {}
