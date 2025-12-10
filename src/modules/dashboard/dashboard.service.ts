import { Injectable } from '@nestjs/common';
import { AlunoDashboardDto } from './dtos/aluno-dashboard.dto';
import { StaffDashboardDto } from './dtos/staff-dashboard.dto';

@Injectable()
export class DashboardService {
  async getAlunoDashboard(): Promise<AlunoDashboardDto> {
    return {
      proximaAulaId: 'aula-123',
      proximaAulaHorario: new Date().toISOString(),
      proximaAulaTurma: 'Turma de No-Gi Avançado',
      aulasNoGrauAtual: 12,
      metaAulas: 30,
      progressoPercentual: 40,
      statusMatricula: 'ATIVA',
    };
    // TODO: cruzar presenças com regras de graduação (spec 3.2.1)
  }

  async getStaffDashboard(): Promise<StaffDashboardDto> {
    return {
      totalAlunosAtivos: 180,
      pendenciasCheckinHoje: 5,
      graduacoesProximas: [
        {
          alunoId: 'aluno-1',
          nome: 'João Silva',
          faixaAtual: 'Azul',
          aulasRestantes: 4,
        },
      ],
      dataReferencia: new Date().toISOString(),
    };
    // TODO: agregar métricas operacionais reais (spec 3.2.2)
  }
}
