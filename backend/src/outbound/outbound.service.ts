import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOutboundDto } from './dto/create-outbound.dto';
import { UpdateOutboundDto } from './dto/update-outbound.dto';

@Injectable()
export class OutboundService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.outboundSchedule.findMany({
      orderBy: { date: 'desc' },
    });
  }

  async findByDate(date: string) {
    return this.prisma.outboundSchedule.findMany({
      where: { date },
      orderBy: { appointmentTime: 'asc' },
    });
  }

  async create(data: CreateOutboundDto[]) {
    // Delete existing entries for the same date if any
    if (data.length > 0) {
      const dates = [...new Set(data.map((item) => item.date))];
      for (const date of dates) {
        await this.prisma.outboundSchedule.deleteMany({
          where: { date },
        });
      }

      const created = await this.prisma.outboundSchedule.createMany({
        data,
      });
      return { count: created.count };
    }
    return { count: 0 };
  }

  async update(id: string, data: UpdateOutboundDto) {
    return await this.prisma.outboundSchedule.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.prisma.outboundSchedule.delete({
      where: { id },
    });
    return { message: 'Outbound schedule deleted successfully' };
  }
}

