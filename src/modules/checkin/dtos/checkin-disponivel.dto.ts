import { ApiProperty } from '@nestjs/swagger';

export class CheckinDisponivelDto {
  @ApiProperty()
  aulaId: string;

  @ApiProperty()
  horario: string;

  @ApiProperty()
  turma: string;

  @ApiProperty()
  tipoTreino: string;

  @ApiProperty({ description: 'Status do check-in do aluno para a aula' })
  statusCheckin: 'NAO_FEITO' | 'PENDENTE' | 'PRESENTE';
}
