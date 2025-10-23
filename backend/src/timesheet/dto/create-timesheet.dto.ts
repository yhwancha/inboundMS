import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateTimesheetDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  employeeName: string;

  @IsString()
  @IsNotEmpty()
  checkInTime: string;

  @IsString()
  @IsNotEmpty()
  checkOutTime: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  totalHours: number;
}

