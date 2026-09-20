// รัน: npm run openapi:generate
// สร้างไฟล์ openapi.json จากโค้ดจริง (decorator ใน controller/dto)
// เพื่อให้ "API Contract ต้องซิงก์กับ openapi.json เสมอ" ตามกฎที่ PM กำหนด —
// ห้ามแก้ openapi.json มือแยกจากโค้ด ต้อง generate จากโค้ดเท่านั้นเพื่อไม่ให้ contract เพี้ยนจากของจริง
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { AppModule } from './app.module';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const config = new DocumentBuilder()
    .setTitle('CampusShare API')
    .setDescription('csmju-campusshare — subsystem ของ CSMJU2030')
    .setVersion('0.1.0')
    .addServer('/api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  // eslint-disable-next-line no-console
  console.log('openapi.json generated');
  await app.close();
}

generate();
