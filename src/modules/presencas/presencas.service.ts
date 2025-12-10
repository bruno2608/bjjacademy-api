import { Injectable } from '@nestjs/common';
import { HistoricoPresencaDto } from './dtos/historico-presenca.dto';
import { PresencaPendenteDto } from './dtos/presenca-pendente.dto';
import { UpdatePresencaStatusDto } from './dtos/update-presenca-status.dto';

@Injectable()
export class PresencasService {
  async listarPendencias(): Promise<PresencaPendenteDto[]> {
    return [
      {
        id: 'presenca-1',
        alunoId: 'aluno-1',
        alunoNome: 'Maria Souza',
        aulaId: 'aula-1',
        turma: 'No-Gi Iniciante',
        tipo: 'MANUAL',
        statusAtual: 'PENDENTE',
      },
    ];
    // TODO: puxar pendências reais (spec 3.3.3)
  }

  async atualizarStatus(
    id: string,
    dto: UpdatePresencaStatusDto,
  ): Promise<{ id: string; status: string }> {
    return { id, status: dto.status };
    // TODO: persistir alteração e registrar auditoria (spec 3.3.4)
  }

  async historicoDoAluno(alunoId: string): Promise<HistoricoPresencaDto[]> {
    return [
      {
        presencaId: 'presenca-1',
        aulaId: 'aula-1',
        data: new Date().toISOString(),
        turma: 'Fundamentos Gi',
        tipoTreino: 'GI',
        status: 'PRESENTE',
      },
    ];
    // TODO: aplicar filtros e validação de acesso (spec 3.3.5)
  }
}
