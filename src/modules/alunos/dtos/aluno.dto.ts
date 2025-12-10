import { ApiProperty } from '@nestjs/swagger';

export class AlunoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  faixaAtual: string;

  @ApiProperty()
  statusMatricula: string;
}
