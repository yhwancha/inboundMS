import { IsString, IsNumber, IsOptional } from 'class-validator';

export class UpdateTimesheetDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  employeeName?: string;

  @IsOptional()
  @IsString()
  checkInTime?: string;

  @IsOptional()
  @IsString()
  checkOutTime?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  totalHours?: number;
}

