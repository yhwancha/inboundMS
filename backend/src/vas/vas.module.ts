import { Module } from '@nestjs/common';
import { VasController } from './vas.controller';
import { VasService } from './vas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VasController],
  providers: [VasService],
})
export class VasModule {}

