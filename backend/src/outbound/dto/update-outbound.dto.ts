import { IsString, IsOptional } from 'class-validator';

export class UpdateOutboundDto {
  @IsString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  appointmentTime?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsString()
  @IsOptional()
  clientName?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

