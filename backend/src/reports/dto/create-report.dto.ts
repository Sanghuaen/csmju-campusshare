import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ReportTargetType } from '@prisma/client';

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  target_type: ReportTargetType;

  @IsString()
  @IsNotEmpty()
  target_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
