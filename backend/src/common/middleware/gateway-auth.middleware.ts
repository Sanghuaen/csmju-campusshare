import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface GatewayUser {
  username: string; // จาก X-User-Id
  layer1Role: 'student' | 'alumni' | 'staff' | 'admin'; // จาก X-Layer1-Role
  faculty: string; // จาก X-Faculty
}

declare module 'express' {
  interface Request {
    gatewayUser?: GatewayUser;
  }
}

/**
 * ตาม auth-contract.md ข้อ 5:
 * "Header เหล่านี้เชื่อถือได้ทันทีโดยไม่ต้อง verify ซ้ำ
 *  เพราะ subsystem เข้าถึงได้ผ่าน gateway เท่านั้น"
 *
 * ดังนั้น middleware นี้แค่ "อ่าน" header มาแนบไว้ที่ req.gatewayUser
 * ไม่ต้อง verify JWT เอง — ห้ามเขียน logic verify token ในระบบย่อยเด็ดขาด
 *
 * ถ้า header ไม่มี (เช่น เป็น public endpoint ที่ gateway ไม่ได้แนบมาให้)
 * req.gatewayUser จะเป็น undefined — endpoint ที่ต้องมีผู้ใช้ให้ใช้ RequireAuthGuard ตรวจอีกชั้น
 */
@Injectable()
export class GatewayAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const username = req.header('X-User-Id');
    const layer1Role = req.header('X-Layer1-Role') as GatewayUser['layer1Role'] | undefined;
    const faculty = req.header('X-Faculty');

    if (username && layer1Role && faculty) {
      req.gatewayUser = { username, layer1Role, faculty };
    }

    next();
  }
}
