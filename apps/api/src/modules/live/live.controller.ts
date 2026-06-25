import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import type {
  EventSchedule,
  MatControl,
  ScoreAction,
  ScoreMethod,
  ScoreSide,
  ScoreableMatch,
} from '@seedline/types';
import { LiveService } from './live.service';

interface FinishBody {
  winnerSide: ScoreSide;
  method: ScoreMethod;
}

@Controller('events')
export class LiveController {
  constructor(private readonly live: LiveService) {}

  @Get(':slug/schedule')
  async schedule(@Param('slug') slug: string): Promise<EventSchedule> {
    const schedule = await this.live.getSchedule(slug);
    if (!schedule) throw new NotFoundException(`Schedule not found: ${slug}`);
    return schedule;
  }

  @Get(':slug/mat-controls')
  matControls(@Param('slug') slug: string): Promise<MatControl[]> {
    return this.live.getMatControls(slug);
  }

  @Get(':slug/matches/:matchId')
  match(@Param('slug') slug: string, @Param('matchId') matchId: string): Promise<ScoreableMatch> {
    return this.resolve(this.live.getScoreableMatch(slug, matchId), matchId);
  }

  @Post(':slug/matches/:matchId/score')
  score(
    @Param('slug') slug: string,
    @Param('matchId') matchId: string,
    @Body() action: ScoreAction,
  ): Promise<ScoreableMatch> {
    return this.resolve(this.live.applyScore(slug, matchId, action), matchId);
  }

  @Post(':slug/matches/:matchId/start')
  start(@Param('slug') slug: string, @Param('matchId') matchId: string): Promise<ScoreableMatch> {
    return this.resolve(this.live.startMatch(slug, matchId), matchId);
  }

  @Post(':slug/matches/:matchId/reset')
  reset(@Param('slug') slug: string, @Param('matchId') matchId: string): Promise<ScoreableMatch> {
    return this.resolve(this.live.resetMatch(slug, matchId), matchId);
  }

  @Post(':slug/matches/:matchId/finish')
  finish(
    @Param('slug') slug: string,
    @Param('matchId') matchId: string,
    @Body() body: FinishBody,
  ): Promise<ScoreableMatch> {
    return this.resolve(
      this.live.finishMatch(slug, matchId, body.winnerSide, body.method),
      matchId,
    );
  }

  private async resolve(
    promise: Promise<ScoreableMatch | null>,
    matchId: string,
  ): Promise<ScoreableMatch> {
    const match = await promise;
    if (!match) throw new NotFoundException(`Match not found: ${matchId}`);
    return match;
  }
}
