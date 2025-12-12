import { ApiProperty } from '@nestjs/swagger';

export class AulaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dataInicio: string;

  @ApiProperty()
  dataFim: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  turmaId: string;

  @ApiProperty()
  turmaNome: string;

  @ApiProperty({ description: 'Horario padrao da turma no formato HH:MM' })
  turmaHorarioPadrao: string;

  @ApiProperty()
  tipoTreino: string;

  @ApiProperty({ nullable: true })
  instrutorNome: string | null;
}
