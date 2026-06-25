import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import type { AthleteProfile, AthleteSummary } from '@seedline/types';
import { AthletesService } from './athletes.service';

@Controller('athletes')
export class AthletesController {
  constructor(private readonly athletes: AthletesService) {}

  @Get()
  list(@Query('search') search?: string): Promise<AthleteSummary[]> {
    return this.athletes.list(search);
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string): Promise<AthleteProfile> {
    const athlete = await this.athletes.getBySlug(slug);
    if (!athlete) throw new NotFoundException(`Athlete not found: ${slug}`);
    return athlete;
  }
}
