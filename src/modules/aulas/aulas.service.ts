import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { AulaQrCodeDto } from './dtos/aula-qrcode.dto';
import { AulaDto } from './dtos/aula.dto';

export type CurrentUser = {
  academiaId: string;
};

type AulaRow = {
  id: string;
  data_inicio: string;
  data_fim: string;
  status: string;
  turma_id: string;
  turma_nome: string;
  turma_horario_padrao: string;
  tipo_treino: string;
  instrutor_nome: string | null;
};

@Injectable()
export class AulasService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listarHoje(currentUser: CurrentUser): Promise<AulaDto[]> {
    const aulas = await this.databaseService.query<AulaRow>(
      `
        select
          a.id,
          a.data_inicio,
          a.data_fim,
          a.status,
          t.id as turma_id,
          t.nome as turma_nome,
          to_char(t.horario_padrao, 'HH24:MI') as turma_horario_padrao,
          tt.nome as tipo_treino,
          instrutor.nome_completo as instrutor_nome
        from aulas a
        join turmas t on t.id = a.turma_id
        join tipos_treino tt on tt.id = t.tipo_treino_id
        left join usuarios instrutor on instrutor.id = t.instrutor_padrao_id
        where a.academia_id = $1
          and date(a.data_inicio) = current_date
          and a.status <> 'CANCELADA'
        order by a.data_inicio asc;
      `,
      [currentUser.academiaId],
    );

    return aulas.map((aula) => ({
      id: aula.id,
      dataInicio: new Date(aula.data_inicio).toISOString(),
      dataFim: new Date(aula.data_fim).toISOString(),
      status: aula.status,
      turmaId: aula.turma_id,
      turmaNome: aula.turma_nome,
      turmaHorarioPadrao: aula.turma_horario_padrao,
      tipoTreino: aula.tipo_treino,
      instrutorNome: aula.instrutor_nome ?? null,
    }));
  }

  async gerarQrCode(id: string): Promise<AulaQrCodeDto> {
    return {
      aulaId: id,
      qrToken: 'mock-qr-token',
      expiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
      turma: 'Turma padrao',
      horario: new Date().toISOString(),
    };
    // TODO: gerar token seguro com TTL (spec 3.4.3)
  }
}
