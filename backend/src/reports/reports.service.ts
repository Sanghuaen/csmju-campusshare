import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';
import { notFound, validationError } from '../common/exceptions/app.exception';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReportDto, user: GatewayUser) {
    // เช็คว่า target มีอยู่จริงก่อนรับรายงาน กัน report มั่ว/ผิด id
    if (dto.target_type === 'listing') {
      const listing = await this.prisma.listing.findUnique({ where: { id: dto.target_id } });
      if (!listing) throw notFound('ไม่พบรายการของที่ต้องการรายงาน');
    } else if (dto.target_type === 'borrow_request') {
      const request = await this.prisma.borrowRequest.findUnique({ where: { id: dto.target_id } });
      if (!request) throw notFound('ไม่พบคำขอยืมที่ต้องการรายงาน');
    } else {
      throw validationError('target_type ไม่ถูกต้อง', { field: 'target_type' });
    }

    const report = await this.prisma.report.create({
      data: {
        targetType: dto.target_type,
        targetId: dto.target_id,
        reporterUsername: user.username,
        reason: dto.reason,
      },
    });
    return { data: report };
  }
}
