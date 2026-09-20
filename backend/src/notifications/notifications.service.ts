import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  recipientUsername: string;
  type: NotificationType;
  title: string;
  body?: string;
  refListingId?: string;
  refRequestId?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger('NotificationsService');

  constructor(private readonly prisma: PrismaService) {}

  // Layer 1 (บังคับ): บันทึกแจ้งเตือนในระบบเราเอง — ทำงานได้ 100% ไม่พึ่งใคร
  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientUsername: input.recipientUsername,
        type: input.type,
        title: input.title,
        body: input.body,
        refListingId: input.refListingId,
        refRequestId: input.refRequestId,
      },
    });

    // Layer 2 (เสริม, optional): ยิงต่อไปช่องทางภายนอก เช่น LINE ของเพื่อน
    // ตั้งใจ "ไม่ await" และห่อ try-catch ให้ fail เงียบๆ — ถ้า service ภายนอกล่ม/ยังไม่มี
    // ต้องไม่กระทบ flow หลักของเราเด็ดขาด (ดูหลักการ "เซฟกับตัวเราเองก่อน")
    this.tryExternalPush(notification.recipientUsername, notification.title).catch(() => {
      /* no-op: fail เงียบๆ ตามตั้งใจ */
    });

    return notification;
  }

  async findForUser(username: string) {
    return this.prisma.notification.findMany({
      where: { recipientUsername: username },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markRead(id: string, username: string) {
    // ไม่ throw ถ้าไม่ใช่เจ้าของ/ไม่เจอ — แค่ no-op เงียบๆ พอ ไม่ใช่ endpoint ที่ critical
    await this.prisma.notification.updateMany({
      where: { id, recipientUsername: username },
      data: { isRead: true },
    });
  }

  /**
   * จุดเชื่อมต่อ external notification (เช่น LINE ของเพื่อน) — ยังไม่ implement จริง
   * เพราะมาตรฐานการเรียกข้าม subsystem ยังไม่ชัดเจน (รอถาม PL)
   * และยังไม่ยืนยันว่าเพื่อนใช้ LINE Notify (ปิดบริการไปแล้ว มี.ค. 2025)
   * หรือ LINE Messaging API (LINE OA) ซึ่งวิธีเรียกต่างกันมาก
   *
   * เมื่อพร้อมจริง ค่อย implement เนื้อหาใน method นี้ — โครงที่เหลือของระบบไม่ต้องแก้
   */
  private async tryExternalPush(_recipientUsername: string, _title: string): Promise<void> {
    // ยังไม่เปิดใช้งาน — เป็น placeholder ไว้ก่อน
    return;
  }
}
