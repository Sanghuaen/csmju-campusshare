import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BorrowRequestsService } from '../borrow-requests/borrow-requests.service';
import { ListingsService } from '../listings/listings.service';

const LISTING_STALE_DAYS = 180; // ~6 เดือน ไม่มีความเคลื่อนไหว -> archive

/**
 * งานอัตโนมัติที่ทำให้ระบบ "อยู่รอดได้" แม้ไม่มี Admin เข้ามาเฝ้าทุกวัน
 * ตามหลักการ fail-safe by default ที่ตกลงกันไว้ตอนออกแบบ
 *
 * หมายเหตุ: การรัน cron ในโปรเซสเดียวกับ API ใช้ได้สำหรับ MVP/instance เดียว
 * ถ้าอนาคต deploy หลาย instance ต้องย้ายไปทำเป็น job แยก (ดู README.md หัวข้อ scaling)
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(
    private readonly borrowRequests: BorrowRequestsService,
    private readonly listings: ListingsService,
  ) {}

  // ทุกวันเที่ยงคืน — คำขอที่เจ้าของไม่ตอบภายในเวลาที่กำหนด -> auto-expire
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAutoExpirePending() {
    const count = await this.borrowRequests.autoExpireStalePending();
    if (count > 0) this.logger.log(`Auto-expired ${count} stale pending request(s)`);
  }

  // ทุกวันตี 1 — คำขอที่เกินกำหนดคืน -> auto-flag overdue
  @Cron('0 1 * * *')
  async handleAutoFlagOverdue() {
    const count = await this.borrowRequests.autoFlagOverdue();
    if (count > 0) this.logger.log(`Flagged ${count} overdue request(s)`);
  }

  // ทุกวันอาทิตย์ตี 2 — listing ที่ไม่มีความเคลื่อนไหวนาน -> auto-archive
  @Cron('0 2 * * 0')
  async handleAutoArchiveListings() {
    const count = await this.listings.autoArchiveStale(LISTING_STALE_DAYS);
    if (count > 0) this.logger.log(`Auto-archived ${count} stale listing(s)`);
  }
}
