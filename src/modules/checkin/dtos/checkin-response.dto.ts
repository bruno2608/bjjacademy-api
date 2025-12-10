import { ApiProperty } from '@nestjs/swagger';

export class CheckinResponseDto {
  @ApiProperty()
  presencaId: string;

  @ApiProperty()
  aulaId: string;

  @ApiProperty()
  status: 'PENDENTE' | 'PRESENTE' | 'REJEITADO';

  @ApiProperty()
  tipo: 'MANUAL' | 'QR';

  @ApiProperty({ required: false })
  mensagem?: string;
}
