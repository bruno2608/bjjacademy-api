import { ApiProperty } from '@nestjs/swagger';

export class AlunoDashboardDto {
  @ApiProperty()
  proximaAulaId: string;

  @ApiProperty()
  proximaAulaHorario: string;

  @ApiProperty()
  proximaAulaTurma: string;

  @ApiProperty()
  aulasNoGrauAtual: number;

  @ApiProperty()
  metaAulas: number;

  @ApiProperty({ description: 'Percentual 0-100' })
  progressoPercentual: number;

  @ApiProperty()
  statusMatricula: string;
}
