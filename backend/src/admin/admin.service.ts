import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';
import { conflict, notFound } from '../common/exceptions/app.exception';
import { ResolveReportDto } from './dto/resolve-report.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ดูสถิติการใช้งาน (ตามสิทธิ์ Admin สาขาที่ระบุไว้ตอนออกแบบ role)
  async getStats() {
    const [
      listingsByStatus,
      requestsByStatus,
      openReportsCount,
      overdueCount,
      totalOwners,
    ] = await Promise.all([
      this.prisma.listing.groupBy({ by: ['status'], _count: true }),
      this.prisma.borrowRequest.groupBy({ by: ['status'], _count: true }),
      this.prisma.report.count({ where: { status: 'open' } }),
      this.prisma.borrowRequest.count({ where: { status: 'overdue' } }),
      this.prisma.listing.findMany({
        distinct: ['ownerUsername'],
        select: { ownerUsername: true },
      }),
    ]);

    return {
      data: {
        listings_by_status: Object.fromEntries(
          listingsByStatus.map((row: { status: string; _count: number }) => [
            row.status,
            row._count,
          ]),
        ),
        requests_by_status: Object.fromEntries(
          requestsByStatus.map((row: { status: string; _count: number }) => [
            row.status,
            row._count,
          ]),
        ),
        open_reports_count: openReportsCount,
        overdue_requests_count: overdueCount,
        active_listers_count: totalOwners.length,
      },
    };
  }

  // ตรวจสอบรายการที่มีปัญหา — เฉพาะที่ถูก flag เท่านั้น (ไม่ต้องไล่ดูทุกรายการ)
  async getOpenReports() {
    const reports = await this.prisma.report.findMany({
      where: { status: 'open' },
      orderBy: { createdAt: 'asc' }, // เก่าสุดก่อน กันเรื่องค้างนาน
    });
    return { data: reports };
  }

  async resolveReport(id: string, dto: ResolveReportDto, admin: GatewayUser) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) throw notFound('ไม่พบรายงานนี้');
    if (report.status === 'resolved') {
      throw conflict('รายงานนี้ถูกปิดไปแล้ว');
    }

    const updated = await this.prisma.report.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedBy: admin.username,
        resolvedAt: new Date(),
        ...(dto.note && { reason: `${report.reason}\n\n[ปิดโดย Admin]: ${dto.note}` }),
      },
    });
    return { data: updated };
  }

  // รายการที่ระบบ auto-flag ว่าเกินกำหนดคืน (จาก cron job) — ให้ Admin เห็นทันทีไม่ต้องไล่เช็คเอง
  async getOverdueRequests() {
    const requests = await this.prisma.borrowRequest.findMany({
      where: { status: 'overdue' },
      include: { listing: true },
      orderBy: { dueDate: 'asc' }, // ค้างนานสุดก่อน
    });
    return { data: requests };
  }
}
