import { Inject, Injectable } from '@nestjs/common';
import type { EventSummary } from '@openmat/types';
import { DATABASE, type Database } from '../../database/database.module';
import { events } from '../../database/schema';

@Injectable()
export class EventsService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  /**
   * List events for the public directory.
   *
   * Scaffold: returns the most recent events. A full implementation would
   * filter to publicly visible statuses, support pagination and geo/text
   * search, and order by start date.
   */
  async listPublished(): Promise<EventSummary[]> {
    const rows = await this.db.select().from(events).limit(50);
    return rows.map((event) => ({
      id: event.id,
      slug: event.slug,
      name: event.name,
      venueName: event.venueName,
      city: event.city,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      status: event.status,
    }));
  }
}
