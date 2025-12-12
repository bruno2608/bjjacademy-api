import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TurmasController } from './turmas.controller';
import { TurmasService } from './turmas.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TurmasController],
  providers: [TurmasService],
})
export class TurmasModule {}
