import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { SettingsModule } from './settings/settings.module';
import { TimesheetModule } from './timesheet/timesheet.module';
import { LocationModule } from './location/location.module';
import { ScheduleModule } from './schedule/schedule.module';
import { VasModule } from './vas/vas.module';
import { OutboundModule } from './outbound/outbound.module';

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
    VasModule,
    OutboundModule,
  ],
})
export class AppModule {}

