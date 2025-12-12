import { ApiProperty } from '@nestjs/swagger';

class GraduacaoHistoricoItem {
  @ApiProperty()
  faixaSlug: string;

  @ApiProperty({ nullable: true })
  grau: number | null;

  @ApiProperty()
  dataGraduacao: string;

  @ApiProperty({ nullable: true })
  professorNome: string | null;
}

export class EvolucaoAlunoDto {
  @ApiProperty({ type: [GraduacaoHistoricoItem] })
  historico: GraduacaoHistoricoItem[];

  @ApiProperty({ nullable: true })
  faixaAtual: string | null;

  @ApiProperty({ nullable: true })
  grauAtual: number | null;

  @ApiProperty()
  aulasNaFaixaAtual: number;

  @ApiProperty()
  metaAulas: number;

  @ApiProperty()
  porcentagemProgresso: number;
}
