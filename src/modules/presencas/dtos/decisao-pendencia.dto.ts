import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class DecisaoPendenciaDto {
  @ApiProperty({ enum: ['APROVAR', 'REJEITAR'] })
  @IsIn(['APROVAR', 'REJEITAR'])
  decisao: 'APROVAR' | 'REJEITAR';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}
