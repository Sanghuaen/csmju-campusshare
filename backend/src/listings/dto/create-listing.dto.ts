import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListingCategory, ListingType } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsEnum(ListingType)
  listingType: ListingType;
}
