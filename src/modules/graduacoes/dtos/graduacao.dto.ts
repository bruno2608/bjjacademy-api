import { ApiProperty } from '@nestjs/swagger';

export class GraduacaoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  alunoId: string;

  @ApiProperty()
  faixaAnterior: string;

  @ApiProperty()
  grauAnterior: string;

  @ApiProperty()
  faixaNova: string;

  @ApiProperty()
  grauNovo: string;

  @ApiProperty()
  dataGraduacao: string;

  @ApiProperty()
  professorId: string;

  @ApiProperty({ required: false })
  observacoes?: string;
}
