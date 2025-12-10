import { ApiProperty } from '@nestjs/swagger';

export class AlunoDetalheDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  telefone: string;

  @ApiProperty()
  matriculaNumero: string;

  @ApiProperty()
  academia: string;

  @ApiProperty()
  statusMatricula: string;

  @ApiProperty()
  faixaAtual: string;

  @ApiProperty()
  grauAtual: number;

  @ApiProperty()
  presencasTotais: number;
}
