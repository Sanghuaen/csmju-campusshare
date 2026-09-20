import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { unauthorized } from '../exceptions/app.exception';

// ใช้กับ endpoint ที่ "ต้องรู้ตัวตนผู้ใช้" ตาม auth-contract.md ข้อ 4
// ต้องประกาศ endpoint ที่ไม่ใช้ guard นี้ไว้ใน public_endpoints ของ subsystem.yaml ด้วย
@Injectable()
export class RequireAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.gatewayUser) {
      throw unauthorized();
    }
    return true;
  }
}
