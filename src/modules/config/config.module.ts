import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';

@Module({
  imports: [DatabaseModule],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigModule {}
