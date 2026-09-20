import { IsString, MaxLength, IsOptional } from 'class-validator';

export class ResolveReportDto {
  @IsString()
  @IsOptional()
  @MaxLength(300)
  note?: string;
}
