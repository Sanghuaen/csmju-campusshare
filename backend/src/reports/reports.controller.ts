import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';

// resource: /api/v1/reports — ต้อง login (ใครก็ตามที่เป็นผู้ใช้ระบบ รายงานได้ ไม่ต้องเป็น Admin)
@UseGuards(RequireAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() dto: CreateReportDto, @CurrentUser() user: GatewayUser) {
    return this.reportsService.create(dto, user);
  }
}
