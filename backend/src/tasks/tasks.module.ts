import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksService } from './tasks.service';
import { BorrowRequestsModule } from '../borrow-requests/borrow-requests.module';
import { ListingsModule } from '../listings/listings.module';

@Module({
  imports: [ScheduleModule.forRoot(), BorrowRequestsModule, ListingsModule],
  providers: [TasksService],
})
export class TasksModule {}
