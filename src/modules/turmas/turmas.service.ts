import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { TurmaDto } from './dtos/turma.dto';

export type CurrentUser = {
  academiaId: string;
};

type TurmaRow = {
  id: string;
  nome: string;
  dias_semana: number[];
  horario_padrao: string;
  tipo_treino: string;
  instrutor_id: string | null;
  instrutor_nome: string | null;
};

@Injectable()
export class TurmasService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listar(currentUser: CurrentUser): Promise<TurmaDto[]> {
    const turmas = await this.databaseService.query<TurmaRow>(
      `
        select
          t.id,
          t.nome,
          t.dias_semana,
          to_char(t.horario_padrao, 'HH24:MI') as horario_padrao,
          tt.nome as tipo_treino,
          instrutor.id as instrutor_id,
          instrutor.nome_completo as instrutor_nome
        from turmas t
        join tipos_treino tt
          on tt.id = t.tipo_treino_id
        left join usuarios instrutor
          on instrutor.id = t.instrutor_padrao_id
        where t.academia_id = $1
        order by t.nome asc;
      `,
      [currentUser.academiaId],
    );

    return turmas.map((turma) => ({
      id: turma.id,
      nome: turma.nome,
      tipoTreino: turma.tipo_treino,
      diasSemana: Array.isArray(turma.dias_semana)
        ? turma.dias_semana.map(Number)
        : [],
      horarioPadrao: turma.horario_padrao,
      instrutorPadraoId: turma.instrutor_id ?? null,
      instrutorPadraoNome: turma.instrutor_nome ?? null,
    }));
  }
}
