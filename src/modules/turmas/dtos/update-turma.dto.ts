import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const DAYS_RANGE = [0, 1, 2, 3, 4, 5, 6];

export class UpdateTurmaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional({ description: 'UUID do tipo de treino' })
  @IsOptional()
  @IsUUID()
  tipoTreinoId?: string;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Dias da semana (0=Domingo ... 6=Sabado)',
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(DAYS_RANGE, { each: true })
  diasSemana?: number[];

  @ApiPropertyOptional({ description: 'Horario padrao HH:MM' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'horarioPadrao deve estar no formato HH:MM',
  })
  horarioPadrao?: string;

  @ApiPropertyOptional({ description: 'UUID do instrutor padrao' })
  @IsOptional()
  @IsUUID()
  instrutorPadraoId?: string | null;
}
