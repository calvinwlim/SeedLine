import { Module } from '@nestjs/common';
import { AcademiesController } from './academies.controller';
import { AcademiesService } from './academies.service';

@Module({
  controllers: [AcademiesController],
  providers: [AcademiesService],
})
export class AcademiesModule {}
