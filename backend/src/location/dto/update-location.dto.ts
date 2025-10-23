import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateLocationDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  status: string;
}

