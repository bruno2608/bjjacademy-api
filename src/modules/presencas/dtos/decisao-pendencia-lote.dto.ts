import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export class DecisaoPendenciaLoteDto {
  @ApiProperty({ type: [String], description: 'IDs das presencas' })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  ids: string[];

  @ApiProperty({ enum: ['APROVAR', 'REJEITAR'] })
  @IsIn(['APROVAR', 'REJEITAR'])
  decisao: 'APROVAR' | 'REJEITAR';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string;
}
