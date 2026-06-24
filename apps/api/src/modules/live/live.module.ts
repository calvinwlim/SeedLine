import { Module } from '@nestjs/common';
import { BracketsService } from './brackets.service';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

@Module({
  controllers: [LiveController],
  providers: [BracketsService, LiveService],
})
export class LiveModule {}
