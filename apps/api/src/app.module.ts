import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { AcademiesModule } from './modules/academies/academies.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { EventsModule } from './modules/events/events.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    DatabaseModule,
    HealthModule,
    EventsModule,
    AcademiesModule,
    AthletesModule,
  ],
})
export class AppModule {}
