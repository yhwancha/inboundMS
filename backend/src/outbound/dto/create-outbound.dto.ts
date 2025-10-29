import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateOutboundDto {
  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  appointmentTime: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsString()
  @IsNotEmpty()
  clientName: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  serviceType: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

