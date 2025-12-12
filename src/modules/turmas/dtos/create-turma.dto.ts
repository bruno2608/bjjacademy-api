import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const DAYS_RANGE = [0, 1, 2, 3, 4, 5, 6];

export class CreateTurmaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string;

  @ApiProperty({ description: 'UUID do tipo de treino' })
  @IsUUID()
  tipoTreinoId: string;

  @ApiProperty({
    type: [Number],
    description: 'Dias da semana (0=Domingo ... 6=Sabado)',
    example: [1, 3],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsIn(DAYS_RANGE, { each: true })
  diasSemana: number[];

  @ApiProperty({ description: 'Horario padrao HH:MM' })
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'horarioPadrao deve estar no formato HH:MM',
  })
  horarioPadrao: string;

  @ApiPropertyOptional({ description: 'UUID do instrutor padrao' })
  @IsOptional()
  @IsUUID()
  instrutorPadraoId?: string | null;
}
