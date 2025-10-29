import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { VasService } from './vas.service';
import { CreateVasDto } from './dto/create-vas.dto';
import { UpdateVasDto } from './dto/update-vas.dto';

@Controller('api/vas')
export class VasController {
  constructor(private readonly vasService: VasService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    if (date) {
      return this.vasService.findByDate(date);
    }
    return this.vasService.findAll();
  }

  @Post()
  create(@Body() data: CreateVasDto[]) {
    return this.vasService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateVasDto) {
    return this.vasService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.vasService.delete(id);
  }
}

