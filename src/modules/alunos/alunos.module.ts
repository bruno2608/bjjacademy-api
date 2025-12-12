import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AlunosController } from './alunos.controller';
import { AlunosService } from './alunos.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AlunosController],
  providers: [AlunosService],
})
export class AlunosModule {}
