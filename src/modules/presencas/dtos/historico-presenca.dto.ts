import { ApiProperty } from '@nestjs/swagger';

export class HistoricoPresencaDto {
  @ApiProperty()
  presencaId: string;

  @ApiProperty()
  aulaId: string;

  @ApiProperty()
  data: string;

  @ApiProperty()
  turma: string;

  @ApiProperty()
  tipoTreino: string;

  @ApiProperty({ enum: ['PRESENTE', 'FALTA', 'PENDENTE', 'AJUSTADO'] })
  status: 'PRESENTE' | 'FALTA' | 'PENDENTE' | 'AJUSTADO';
}
