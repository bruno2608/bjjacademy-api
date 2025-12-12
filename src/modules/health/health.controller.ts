import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DatabaseHealthIndicator } from './database.health';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly databaseIndicator: DatabaseHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Liveness' })
  @ApiOkResponse({ schema: { example: { status: 'ok' } } })
  @HealthCheck()
  async liveness(): Promise<{ status: string }> {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness (inclui Postgres)' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      },
    },
  })
  @HealthCheck()
  async readiness() {
    return this.health.check([
      async () => this.databaseIndicator.isHealthy(),
    ]);
  }
}
