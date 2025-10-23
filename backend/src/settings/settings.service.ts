import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.settings.findUnique({
      where: { id: 'settings' },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          id: 'settings',
          logoUrl: '',
          userImage: '',
        },
      });
    }

    return settings;
  }

  async updateSettings(data: UpdateSettingsDto) {
    return this.prisma.settings.upsert({
      where: { id: 'settings' },
      update: data,
      create: {
        id: 'settings',
        ...data,
      },
    });
  }
}

