import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateSchedulesDto } from './dto/create-schedules.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  async getAllSchedules(@Query('date') date?: string) {
    return this.scheduleService.getAllSchedules(date);
  }

  @Post()
  async createSchedules(@Body() dto: CreateSchedulesDto) {
    return this.scheduleService.createSchedules(dto);
  }

  @Put(':id')
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.scheduleService.updateSchedule(id, dto);
  }

  @Delete(':id')
  async deleteSchedule(@Param('id') id: string) {
    return this.scheduleService.deleteSchedule(id);
  }
}

