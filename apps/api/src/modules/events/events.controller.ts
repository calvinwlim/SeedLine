import { Controller, Get } from '@nestjs/common';
import type { EventSummary } from '@openmat/types';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  list(): Promise<EventSummary[]> {
    return this.events.listPublished();
  }
}
