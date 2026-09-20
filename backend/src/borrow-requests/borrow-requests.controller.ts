import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BorrowRequestsService } from './borrow-requests.service';
import { CreateBorrowRequestDto } from './dto/create-borrow-request.dto';
import { UpdateBorrowRequestStatusDto } from './dto/update-borrow-request-status.dto';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';

// resource: /api/v1/borrow-requests — ต้อง login ทุก endpoint (ไม่มี public ในโมดูลนี้)
@UseGuards(RequireAuthGuard)
@Controller('borrow-requests')
export class BorrowRequestsController {
  constructor(private readonly borrowRequestsService: BorrowRequestsService) {}

  // ขอยืม
  @Post()
  create(@Body() dto: CreateBorrowRequestDto, @CurrentUser() user: GatewayUser) {
    return this.borrowRequestsService.create(dto, user);
  }

  // ดูคำขอของฉัน (ทั้งฝั่งขอยืมและฝั่งเจ้าของ)
  @Get('mine')
  findMine(@CurrentUser() user: GatewayUser) {
    return this.borrowRequestsService.findMine(user);
  }

  // อนุมัติ/ปฏิเสธ/แจ้งคืน — รวมเป็น endpoint เดียว เปลี่ยนแค่ค่า status ใน body
  // (ไม่มี /approve /reject /return เพราะ api-conventions.md ห้าม verb ใน path)
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBorrowRequestStatusDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return this.borrowRequestsService.updateStatus(id, dto, user);
  }
}
