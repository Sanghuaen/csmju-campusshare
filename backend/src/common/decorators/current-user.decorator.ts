import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GatewayUser } from '../middleware/gateway-auth.middleware';

/**
 * ใช้ใน controller: getListings(@CurrentUser() user: GatewayUser)
 * คืนค่า undefined ถ้าไม่มี token (public endpoint) — endpoint ที่ต้อง login
 * ให้ใช้คู่กับ RequireAuthGuard เพื่อโยน UNAUTHORIZED อัตโนมัติถ้าไม่มี user
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): GatewayUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return request.gatewayUser;
  },
);
