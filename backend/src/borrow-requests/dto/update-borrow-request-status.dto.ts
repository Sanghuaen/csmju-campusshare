import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

// ตัวเลือก status ที่อนุญาตให้ "คน" เปลี่ยนเองผ่าน endpoint นี้
// ('overdue', 'expired' ระบบเปลี่ยนให้อัตโนมัติเท่านั้น ไม่ให้ endpoint นี้ตั้งเอง)
const MANUAL_STATUSES = ['approved', 'rejected', 'returned'] as const;

export class UpdateBorrowRequestStatusDto {
  @IsIn(MANUAL_STATUSES)
  status: (typeof MANUAL_STATUSES)[number];

  @IsString()
  @IsOptional()
  @MaxLength(300)
  response_message?: string;

  // เจ้าของระบุตอนอนุมัติ ว่านัดคืนวันไหน (ใช้คำนวณ auto-flag overdue)
  @IsDateString()
  @IsOptional()
  due_date?: string;
}
