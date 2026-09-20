import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { ListingsModule } from './listings/listings.module';
import { BorrowRequestsModule } from './borrow-requests/borrow-requests.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { TasksModule } from './tasks/tasks.module';
import { GatewayAuthMiddleware } from './common/middleware/gateway-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    ListingsModule,
    BorrowRequestsModule,
    NotificationsModule,
    ReportsModule,
    AdminModule,
    TasksModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // แนบ req.gatewayUser จาก header ที่ API Gateway ส่งมาให้ (auth-contract.md ข้อ 5)
    // /health ไม่ต้องผ่าน middleware นี้ เพราะเป็น public endpoint เสมอ
    consumer.apply(GatewayAuthMiddleware).exclude('health').forRoutes('*');
  }
}
