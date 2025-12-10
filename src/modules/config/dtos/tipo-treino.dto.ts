import { ApiProperty } from '@nestjs/swagger';

export class TipoTreinoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty({ required: false })
  descricao?: string;
}
