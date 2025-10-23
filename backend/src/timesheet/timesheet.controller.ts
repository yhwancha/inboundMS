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
import { TimesheetService } from './timesheet.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';

@Controller('timesheet')
export class TimesheetController {
  constructor(private readonly timesheetService: TimesheetService) {}

  @Get()
  async getAllTimesheets(@Query('date') date?: string) {
    return this.timesheetService.getAllTimesheets(date);
  }

  @Post()
  async createTimesheet(@Body() dto: CreateTimesheetDto) {
    return this.timesheetService.createTimesheet(dto);
  }

  @Put(':id')
  async updateTimesheet(
    @Param('id') id: string,
    @Body() dto: UpdateTimesheetDto,
  ) {
    return this.timesheetService.updateTimesheet(id, dto);
  }

  @Delete(':id')
  async deleteTimesheet(@Param('id') id: string) {
    return this.timesheetService.deleteTimesheet(id);
  }
}

