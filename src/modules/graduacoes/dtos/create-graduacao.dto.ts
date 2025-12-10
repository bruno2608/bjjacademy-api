import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateGraduacaoDto {
  @ApiProperty()
  @IsString()
  alunoId: string;

  @ApiProperty()
  @IsString()
  faixaAnterior: string;

  @ApiProperty()
  @IsString()
  grauAnterior: string;

  @ApiProperty()
  @IsString()
  faixaNova: string;

  @ApiProperty()
  @IsString()
  grauNovo: string;

  @ApiProperty()
  @IsDateString()
  dataGraduacao: string;

  @ApiProperty()
  @IsString()
  professorId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
