import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InitializeLocationsDto } from './dto/initialize-locations.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async getAllLocations() {
    return this.prisma.location.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async initializeLocations(dto: InitializeLocationsDto) {
    const { locations } = dto;

    // Upsert locations
    const operations = locations.map((loc) =>
      this.prisma.location.upsert({
        where: { id: loc.id },
        update: { status: loc.status },
        create: { id: loc.id, status: loc.status },
      }),
    );

    await this.prisma.$transaction(operations);

    return { success: true };
  }

  async updateLocation(dto: UpdateLocationDto) {
    const { id, status } = dto;

    return this.prisma.location.upsert({
      where: { id },
      update: { status },
      create: { id, status },
    });
  }
}

