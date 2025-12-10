import { ApiProperty } from '@nestjs/swagger';

export class AulaQrCodeDto {
  @ApiProperty()
  aulaId: string;

  @ApiProperty()
  qrToken: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty()
  turma: string;

  @ApiProperty()
  horario: string;
}
