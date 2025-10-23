import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTimesheetDto } from './dto/create-timesheet.dto';
import { UpdateTimesheetDto } from './dto/update-timesheet.dto';

@Injectable()
export class TimesheetService {
  constructor(private prisma: PrismaService) {}

  async getAllTimesheets(date?: string) {
    if (date) {
      return this.prisma.timesheetEntry.findMany({
        where: { date },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.timesheetEntry.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTimesheet(dto: CreateTimesheetDto) {
    return this.prisma.timesheetEntry.create({
      data: dto,
    });
  }

  async updateTimesheet(id: string, dto: UpdateTimesheetDto) {
    try {
      return await this.prisma.timesheetEntry.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException(`Timesheet entry with ID ${id} not found`);
    }
  }

  async deleteTimesheet(id: string) {
    try {
      await this.prisma.timesheetEntry.delete({
        where: { id },
      });
      return { success: true };
    } catch (error) {
      throw new NotFoundException(`Timesheet entry with ID ${id} not found`);
    }
  }
}

