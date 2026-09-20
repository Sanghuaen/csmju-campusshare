import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';

// resource: /api/v1/notifications
@UseGuards(RequireAuthGuard) // ต้อง login เสมอ ไม่มี public endpoint ในโมดูลนี้
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(@CurrentUser() user: GatewayUser) {
    return this.notificationsService
      .findForUser(user.username)
      .then((data) => ({ data }));
  }

  // อ่านแล้ว — ไม่มี verb ใน path ใช้ PATCH ปกติ ส่ง { is_read: true } ก็ได้
  // ที่นี่ลดรูปเหลือ endpoint เดียวเพื่อความง่าย เพราะมี action เดียว (mark read)
  @Patch(':id')
  markRead(@Param('id') id: string, @CurrentUser() user: GatewayUser) {
    return this.notificationsService
      .markRead(id, user.username)
      .then(() => ({ data: { id, is_read: true } }));
  }
}
