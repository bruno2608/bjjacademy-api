import { ApiProperty } from '@nestjs/swagger';

export class TipoTreinoDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    description: 'UUID interno do tipo de treino',
  })
  uuid: string;

  @ApiProperty()
  nome: string;

  @ApiProperty({ required: false })
  descricao?: string;

  @ApiProperty({
    required: false,
    description: 'Cor opcional para identificaÇõÇœo visual (#RRGGBB)',
  })
  corIdentificacao?: string | null;
}
