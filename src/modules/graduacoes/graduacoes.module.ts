import { Module } from '@nestjs/common';
import { GraduacoesController } from './graduacoes.controller';
import { GraduacoesService } from './graduacoes.service';

@Module({
  controllers: [GraduacoesController],
  providers: [GraduacoesService],
})
export class GraduacoesModule {}
