import { ApiProperty } from '@nestjs/swagger';

export class PresencaPendenteDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alunoId: string;

  @ApiProperty()
  alunoNome: string;

  @ApiProperty()
  aulaId: string;

  @ApiProperty()
  turma: string;

  @ApiProperty()
  tipo: 'MANUAL' | 'QR';

  @ApiProperty()
  statusAtual: 'PENDENTE';
}
