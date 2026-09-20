import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingStatusDto } from './dto/update-listing-status.dto';
import { QueryListingsDto } from './dto/query-listings.dto';
import { RequireAuthGuard } from '../common/guards/require-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GatewayUser } from '../common/middleware/gateway-auth.middleware';

// resource: /api/v1/listings (noun พหูพจน์ + kebab-case ตาม api-conventions.md ข้อ 1)
@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  // ค้นหา/ดูรายการของ — public ไม่ต้อง login (ต้องประกาศใน subsystem.yaml public_endpoints)
  @Get()
  findMany(@Query() query: QueryListingsDto) {
    return this.listingsService.findMany(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  // ลงของใหม่ — ต้อง login
  @UseGuards(RequireAuthGuard)
  @Post()
  create(@Body() dto: CreateListingDto, @CurrentUser() user: GatewayUser) {
    return this.listingsService.create(dto, user);
  }

  // เจ้าของเปิด/ปิดรายการเอง — เปลี่ยน status ผ่าน PATCH เดียว ไม่มี endpoint แยกเป็น /close /reopen
  @UseGuards(RequireAuthGuard)
  @Patch(':id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateListingStatusDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return this.listingsService.updateStatus(id, dto, user);
  }
}
