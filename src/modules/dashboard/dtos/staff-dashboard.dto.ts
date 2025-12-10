import { ApiProperty } from '@nestjs/swagger';

export class StaffDashboardDto {
  @ApiProperty()
  totalAlunosAtivos: number;

  @ApiProperty()
  pendenciasCheckinHoje: number;

  @ApiProperty({ description: 'Lista de graduações próximas' })
  graduacoesProximas: Array<{
    alunoId: string;
    nome: string;
    faixaAtual: string;
    aulasRestantes: number;
  }>;

  @ApiProperty()
  dataReferencia: string;
}
