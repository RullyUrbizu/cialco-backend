import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// Configurar zona horaria de Argentina
process.env.TZ = 'America/Argentina/Buenos_Aires';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Habilitar validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS')
    ?.split(',') || ['http://localhost:5173'];

  app.enableCors({
    origin: (origin: any, callback: any) => {
      // Regex para permitir cualquier IP de la red local 192.168.1.x
      const localIpRegex = /^http:\/\/192\.168\.1\.\d{1,3}(:\d+)?$/;

      if (
        !origin ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        localIpRegex.test(origin)
      ) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked for origin: ${origin}. Allowed: ${allowedOrigins}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
