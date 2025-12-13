import { ApiProperty } from '@nestjs/swagger';

export class StaffDashboardDto {
  @ApiProperty()
  alunosAtivos: number;

  @ApiProperty()
  aulasHoje: number;

  @ApiProperty()
  presencasHoje: number;

  @ApiProperty()
  faltasHoje: number;

  @ApiProperty({ description: 'Pendencias de presenca aguardando aprovacao (hoje)' })
  pendenciasHoje: number;
}
