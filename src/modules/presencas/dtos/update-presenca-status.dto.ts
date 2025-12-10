import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class UpdatePresencaStatusDto {
  @ApiProperty({ enum: ['PRESENTE', 'FALTA', 'AJUSTADO'] })
  @IsIn(['PRESENTE', 'FALTA', 'AJUSTADO'])
  status: 'PRESENTE' | 'FALTA' | 'AJUSTADO';
}
