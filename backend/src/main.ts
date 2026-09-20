import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { EnvelopeInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ตาม api-conventions.md ข้อ 1: ทุก endpoint ต้องขึ้นต้นด้วย /api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'], // /health ไม่มี prefix ตาม convention ข้อ 8
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ห่อทุก response สำเร็จด้วย envelope { success, data, meta } (api-conventions.md ข้อ 3)
  app.useGlobalInterceptors(new EnvelopeInterceptor());

  // ห่อทุก error ด้วย envelope { success, error } + map เป็น error.code มาตรฐาน (ข้อ 4)
  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`CampusShare backend running on port ${port}`);
}
bootstrap();
