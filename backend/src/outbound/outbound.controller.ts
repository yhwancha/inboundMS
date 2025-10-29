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
import { OutboundService } from './outbound.service';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';

@Controller('api/outbound')
export class OutboundController {
  constructor(private readonly outboundService: OutboundService) {}

  @Get()
  findAll(@Query('date') date?: string) {
    if (date) {
      return this.outboundService.findByDate(date);
    }
    return this.outboundService.findAll();
  }

  @Post()
  create(@Body() data: CreateOutboundDto[]) {
    return this.outboundService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: UpdateOutboundDto) {
    return this.outboundService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.outboundService.delete(id);
  }
}

