import { Controller, Get } from '@nestjs/common';

// GET /health → 200 OK { status: "ok", version: "..." } ไม่ต้องแนบ token
// path นี้ไม่มี /api/v1 prefix (ดูการตั้งค่าใน main.ts)
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', version: '0.1.0' };
  }
}
