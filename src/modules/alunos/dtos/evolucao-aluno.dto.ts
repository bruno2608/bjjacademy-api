import { ApiProperty } from '@nestjs/swagger';

class GraducaoHistoricoItem {
  @ApiProperty()
  faixaAnterior: string;

  @ApiProperty()
  grauAnterior: number;

  @ApiProperty()
  faixaNova: string;

  @ApiProperty()
  grauNovo: number;

  @ApiProperty()
  data: string;

  @ApiProperty()
  professor: string;
}

export class EvolucaoAlunoDto {
  @ApiProperty({ type: [GraducaoHistoricoItem] })
  historico: GraducaoHistoricoItem[];

  @ApiProperty()
  aulasNaFaixaAtual: number;

  @ApiProperty()
  metaAulas: number;

  @ApiProperty()
  porcentagemProgresso: number;
}
