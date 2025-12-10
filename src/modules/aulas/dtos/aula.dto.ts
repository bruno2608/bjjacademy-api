import { ApiProperty } from '@nestjs/swagger';

export class AulaDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  horario: string;

  @ApiProperty()
  turma: string;

  @ApiProperty()
  tipoTreino: string;

  @ApiProperty()
  professor: string;
}
