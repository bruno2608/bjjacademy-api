import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateRegraGraduacaoDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  aulasMinimas: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  tempoMinimoMeses: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string;
}
