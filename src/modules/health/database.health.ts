import { Injectable } from '@nestjs/common';
import {
  HealthCheckError,
  HealthIndicator,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly databaseService: DatabaseService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      await this.databaseService.queryOne<{ result: number }>(
        'select 1 as result;',
      );
      return this.getStatus('database', true);
    } catch (error) {
      throw new HealthCheckError('Database check failed', error as Error);
    }
  }
}
