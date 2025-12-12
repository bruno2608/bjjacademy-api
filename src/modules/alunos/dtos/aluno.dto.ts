import { ApiProperty } from '@nestjs/swagger';

export class AlunoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ nullable: true })
  faixaAtual: string | null;

  @ApiProperty({ nullable: true })
  grauAtual: number | null;

  @ApiProperty({ nullable: true })
  matriculaStatus: string | null;

  @ApiProperty({ nullable: true, type: Number })
  matriculaNumero: number | null;
}
