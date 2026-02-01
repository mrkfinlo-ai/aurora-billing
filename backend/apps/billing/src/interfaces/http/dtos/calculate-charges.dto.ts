import { IsString, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

class UsageDto {
  @IsString()
  unitType: string;

  @IsNumber()
  quantity: number;
}

export class CalculateChargesDto {
  @IsUUID()
  customerId: string;

  @IsNumber()
  basePrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UsageDto)
  usage: UsageDto[];
}
