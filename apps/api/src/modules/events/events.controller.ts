import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import type {
  Discipline,
  DivisionDetail,
  EventDetail,
  EventStatus,
  EventSummary,
} from '@openmat/types';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('discipline') discipline?: Discipline,
    @Query('status') status?: EventStatus,
    @Query('country') country?: string,
  ): Promise<EventSummary[]> {
    return this.events.listPublished({ search, discipline, status, country });
  }

  @Get(':slug')
  async detail(@Param('slug') slug: string): Promise<EventDetail> {
    const event = await this.events.getBySlug(slug);
    if (!event) throw new NotFoundException(`Event not found: ${slug}`);
    return event;
  }

  @Get(':slug/divisions/:divisionId')
  async division(
    @Param('slug') slug: string,
    @Param('divisionId') divisionId: string,
  ): Promise<DivisionDetail> {
    const division = await this.events.getDivision(slug, divisionId);
    if (!division) throw new NotFoundException(`Division not found: ${divisionId}`);
    return division;
  }
}
