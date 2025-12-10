import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateCheckinDto {
  @ApiProperty()
  @IsString()
  aulaId: string;

  @ApiProperty({ enum: ['MANUAL', 'QR'] })
  @IsIn(['MANUAL', 'QR'])
  tipo: 'MANUAL' | 'QR';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  qrToken?: string;
}
