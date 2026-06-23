import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — strips unknown fields and rejects invalid input
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — adjust origins for production
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.getHttpAdapter().get('/', (_req: unknown, res: { json: (v: unknown) => void }) =>
    res.json({ status: 'ok', service: 'trekly-api' }),
  );

  const port = process.env['PORT'] ?? 8080;
  await app.listen(port);
  console.log(`Trekly API running on port ${port}`);
}

bootstrap();
