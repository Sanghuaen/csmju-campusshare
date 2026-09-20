import { Module } from '@nestjs/common';
import { BorrowRequestsController } from './borrow-requests.controller';
import { BorrowRequestsService } from './borrow-requests.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [BorrowRequestsController],
  providers: [BorrowRequestsService],
  exports: [BorrowRequestsService],
})
export class BorrowRequestsModule {}
