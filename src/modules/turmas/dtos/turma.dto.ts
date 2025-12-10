import { ApiProperty } from '@nestjs/swagger';

export class TurmaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  faixaAlvo: string;

  @ApiProperty()
  professor: string;

  @ApiProperty({ description: 'Horários recorrentes (ex.: seg/qua 20h)' })
  horarios: string;
}
