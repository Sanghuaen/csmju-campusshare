import { IsEnum } from 'class-validator';
import { ListingStatus } from '@prisma/client';

// เจ้าของใช้ endpoint นี้ปิด/เปิด listing เอง (unavailable <-> available)
// ห้ามตั้งเป็น borrowed/pending เอง — สถานะนั้นระบบเปลี่ยนให้อัตโนมัติตาม borrow request เท่านั้น
export class UpdateListingStatusDto {
  @IsEnum(ListingStatus)
  status: ListingStatus;
}
