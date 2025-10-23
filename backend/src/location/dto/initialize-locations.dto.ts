import { IsArray, ValidateNested, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

class LocationItem {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

export class InitializeLocationsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationItem)
  locations: LocationItem[];
}

