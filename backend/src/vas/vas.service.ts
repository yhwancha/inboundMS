import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVasDto } from './dto/create-vas.dto';
import { UpdateVasDto } from './dto/update-vas.dto';

@Injectable()
export class VasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.vasSchedule.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findByDate(date: string) {
    return this.prisma.vasSchedule.findMany({
      where: { date },
      orderBy: { appointmentTime: 'asc' },
    });
  }

  async create(data: CreateVasDto[]) {
    // Delete existing entries for the same date if any
    if (data.length > 0) {
      const dates = [...new Set(data.map((item) => item.date))];
      for (const date of dates) {
        await this.prisma.vasSchedule.deleteMany({
          where: { date },
        });
      }

      const created = await this.prisma.vasSchedule.createMany({
        data,
      });
      return { count: created.count };
    }
    return { count: 0 };
  }

  async update(id: string, data: UpdateVasDto) {
    return await this.prisma.vasSchedule.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.vasSchedule.delete({
      where: { id },
    });
    return { message: 'VAS schedule deleted successfully' };
  }
}

