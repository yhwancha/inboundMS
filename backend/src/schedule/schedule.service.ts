import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchedulesDto } from './dto/create-schedules.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async getAllSchedules(date?: string) {
    if (date) {
      return this.prisma.schedule.findMany({
        where: { date },
        orderBy: { appointmentTime: 'asc' },
      });
    }

    return this.prisma.schedule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createSchedules(dto: CreateSchedulesDto) {
    const { schedules } = dto;

    if (schedules.length === 0) {
      return { success: true, count: 0 };
    }

    // Delete existing schedules for the date
    const date = schedules[0].date;
    await this.prisma.schedule.deleteMany({
      where: { date },
    });

    // Create new schedules
    const created = await this.prisma.schedule.createMany({
      data: schedules,
    });

    return { success: true, count: created.count };
  }

  async updateSchedule(id: string, dto: UpdateScheduleDto) {
    try {
      return await this.prisma.schedule.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }

  async deleteSchedule(id: string) {
    try {
      await this.prisma.schedule.delete({
        where: { id },
      });
      return { success: true };
    } catch (error) {
      throw new NotFoundException(`Schedule with ID ${id} not found`);
    }
  }
}

