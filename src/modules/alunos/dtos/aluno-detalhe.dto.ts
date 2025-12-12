import { ApiProperty } from '@nestjs/swagger';

export class AlunoDetalheDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  academiaId: string;

  @ApiProperty()
  academiaNome: string;

  @ApiProperty({ nullable: true, type: Number })
  matriculaNumero: number | null;

  @ApiProperty({ nullable: true })
  matriculaStatus: string | null;

  @ApiProperty({ nullable: true })
  matriculaDataInicio: string | null;

  @ApiProperty({ nullable: true })
  matriculaDataFim: string | null;

  @ApiProperty({ nullable: true })
  faixaAtual: string | null;

  @ApiProperty({ nullable: true })
  grauAtual: number | null;

  @ApiProperty()
  presencasTotais: number;
}
