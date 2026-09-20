import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// ตามกฎ "Backend เป็นจุดเดียวที่ถือ DB Connection" — ห้ามมีที่อื่นสร้าง PrismaClient เอง
// Frontend/subsystem อื่นต้องคุยผ่าน REST API ของเราเท่านั้น ห้ามต่อ DB ตรง
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
