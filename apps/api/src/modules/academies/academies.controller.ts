import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import type { AcademyDetail, AcademySummary } from '@openmat/types';
import { AcademiesService } from './academies.service';

@Controller('academies')
export class AcademiesController {
  constructor(private readonly academies: AcademiesService) {}

  @Get()
  list(@Query('search') search?: string): Promise<AcademySummary[]> {
    return this.academies.list(search);
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string): Promise<AcademyDetail> {
    const academy = await this.academies.getBySlug(slug);
    if (!academy) throw new NotFoundException(`Academy not found: ${slug}`);
    return academy;
  }
}
