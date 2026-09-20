import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBorrowRequestDto {
  @IsString()
  @IsNotEmpty()
  listing_id: string;

  @IsString()
  @IsOptional()
  @MaxLength(300)
  message?: string;
}
