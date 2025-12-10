import { ApiProperty } from '@nestjs/swagger';

export class RegraGraduacaoDto {
  @ApiProperty()
  faixaSlug: string;

  @ApiProperty()
  aulasMinimas: number;

  @ApiProperty()
  tempoMinimoMeses: number;

  @ApiProperty({ required: false })
  observacoes?: string;
}
