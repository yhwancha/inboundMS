import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { LocationModule } from './location/location.module';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SettingsModule,
    TimesheetModule,
    LocationModule,
    ScheduleModule,
  ],
})
export class AppModule {}

