import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingStatusDto } from './dto/update-listing-status.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';
import { conflict, forbidden, notFound, validationError } from '../common/exceptions/app.exception';

// TODO(department): ตอนนี้ Core ยังไม่ส่ง department มาจริง (รอ PL/PM ยืนยัน — ดู DECISIONS.md)
// hardcode ไว้ที่นี่จุดเดียว ถ้าอนาคตได้ field จริงจาก gatewayUser แค่แก้บรรทัดนี้บรรทัดเดียว
const CURRENT_DEPARTMENT = 'computer-science';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) { }

  async findMany(query: QueryListingsDto) {
    const page = query.page ?? 1;
    const perPage = query.per_page ?? 20;

    const where = {
      department: CURRENT_DEPARTMENT,
      ...(query.category && { category: query.category }),
      ...(query.listing_type && { listingType: query.listing_type }),
      ...(query.status && { status: query.status }),
      ...(query.q && { title: { contains: query.q, mode: 'insensitive' as const } }),
      // fail-safe: ไม่โชว์ listing ที่ archive ไปแล้วใน list ปกติ
      ...(!query.status && { status: { not: 'archived' as const } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { data: items, meta: { page, per_page: perPage, total } };
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.department !== CURRENT_DEPARTMENT) {
      throw notFound('ไม่พบรายการของนี้');
    }
    return { data: listing };
  }

  async create(dto: CreateListingDto, user: GatewayUser) {
    const listing = await this.prisma.listing.create({
      data: {
        ownerUsername: user.username,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        listingType: dto.listingType,
        department: CURRENT_DEPARTMENT,
      },
    });
    return { data: listing };
  }

  async updateStatus(id: string, dto: UpdateListingStatusDto, user: GatewayUser) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing || listing.department !== CURRENT_DEPARTMENT) {
      throw notFound('ไม่พบรายการของนี้');
    }
    if (listing.status === 'given_away' || listing.status === 'archived') {
      throw conflict('รายการนี้ปิดถาวรแล้ว ไม่สามารถเปลี่ยนสถานะได้อีก', {
        current_status: listing.status,
      });
    }

    // เจ้าของสลับได้แค่ available <-> unavailable เอง
    // ห้ามตั้ง borrowed/pending เอง (ระบบเปลี่ยนให้อัตโนมัติตาม borrow request)
    const allowedManualStatuses = ['available', 'unavailable'];
    if (!allowedManualStatuses.includes(dto.status)) {
      throw validationError(
        `เจ้าของตั้งสถานะได้แค่ ${allowedManualStatuses.join(', ')} เท่านั้น สถานะอื่นระบบจัดการให้อัตโนมัติ`,
        { field: 'status' },
      );
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: dto.status, lastActivityAt: new Date() },
    });
    return { data: updated };
  }

  // ===== เรียกจาก scheduled task (ดู src/tasks) =====

  /** listing ที่ว่างอยู่แต่ไม่มีความเคลื่อนไหวนานเกิน N วัน -> auto-archive (ลดขยะไม่ต้องให้ Admin ไล่ล้าง) */
  async autoArchiveStale(staleDays: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - staleDays);

    const result = await this.prisma.listing.updateMany({
      where: { status: 'available', lastActivityAt: { lt: cutoff } },
      data: { status: 'archived' },
    });
    return result.count;
  }
}
