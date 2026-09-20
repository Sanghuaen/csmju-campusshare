import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ResolveReportDto } from './dto/resolve-report.dto';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';

// resource: /api/v1/admin/... — เฉพาะ Admin สาขาเท่านั้น (RequireAuthGuard ก่อน AdminGuard เสมอ)
@UseGuards(RequireAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('reports')
  getOpenReports() {
    return this.adminService.getOpenReports();
  }

  @Patch('reports/:id')
  resolveReport(
    @Param('id') id: string,
    @Body() dto: ResolveReportDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return this.adminService.resolveReport(id, dto, user);
  }

  @Get('overdue-requests')
  getOverdueRequests() {
    return this.adminService.getOverdueRequests();
  }
}
