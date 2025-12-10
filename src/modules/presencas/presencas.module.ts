import { Module } from '@nestjs/common';
import { AlunoPresencasController } from './presencas-aluno.controller';
import { PresencasController } from './presencas.controller';
import { PresencasService } from './presencas.service';

@Module({
  controllers: [PresencasController, AlunoPresencasController],
  providers: [PresencasService],
})
export class PresencasModule {}
