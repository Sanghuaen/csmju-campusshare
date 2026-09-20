import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { forbidden, unauthorized } from '../exceptions/app.exception';
import { isAdmin } from '../roles/role-mapping';

// ใช้คู่กับ RequireAuthGuard เสมอ (ใส่ RequireAuthGuard ก่อน AdminGuard ใน @UseGuards)
// เพราะ AdminGuard สมมติว่า req.gatewayUser มีอยู่แล้ว
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    if (!req.gatewayUser) throw unauthorized();
    if (!isAdmin(req.gatewayUser)) {
      throw forbidden('เฉพาะ Admin สาขาเท่านั้นที่เข้าถึงส่วนนี้ได้');
    }
    return true;
  }
}
