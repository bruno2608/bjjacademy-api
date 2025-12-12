import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateTurmaDto } from './dtos/create-turma.dto';
import { ListTurmasQueryDto } from './dtos/list-turmas-query.dto';
import { TurmaResponseDto } from './dtos/turma-response.dto';
import { UpdateTurmaDto } from './dtos/update-turma.dto';

export type CurrentUser = {
  id: string;
  role: string;
  roles?: string[];
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
  deleted_at: string | null;
};

@Injectable()
export class TurmasService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listar(
    currentUser: CurrentUser,
    query?: ListTurmasQueryDto,
  ): Promise<TurmaResponseDto[]> {
    const includeDeleted = !!query?.includeDeleted;
    const isStaff = this.userIsStaff(currentUser);
    if (includeDeleted && !isStaff) {
      throw new ForbiddenException('Apenas staff pode listar deletadas');
    }

    const turmas = await this.databaseService.query<TurmaRow>(
      `
        select
          t.id,
          t.nome,
          t.dias_semana,
          to_char(t.horario_padrao, 'HH24:MI') as horario_padrao,
          tt.nome as tipo_treino,
          instrutor.id as instrutor_id,
          instrutor.nome_completo as instrutor_nome,
          t.deleted_at
        from turmas t
        join tipos_treino tt
          on tt.id = t.tipo_treino_id
        left join usuarios instrutor
          on instrutor.id = t.instrutor_padrao_id
        where t.academia_id = $1
          ${includeDeleted ? '' : 'and t.deleted_at is null'}
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
      deletedAt: turma.deleted_at ? new Date(turma.deleted_at).toISOString() : null,
    }));
  }

  async detalhar(id: string, currentUser: CurrentUser): Promise<TurmaResponseDto> {
    const turma = await this.buscarTurma(id, currentUser.academiaId, {
      includeDeleted: true,
    });
    if (!turma) {
      throw new NotFoundException('Turma nao encontrada');
    }

    if (turma.academia_id !== currentUser.academiaId) {
      throw new NotFoundException('Turma nao encontrada na academia');
    }

    return this.mapRow(turma);
  }

  async criar(
    dto: CreateTurmaDto,
    currentUser: CurrentUser,
  ): Promise<TurmaResponseDto> {
    this.ensureStaff(currentUser);
    await this.validarDependencias(dto, currentUser.academiaId);

    const turma = await this.databaseService.queryOne<TurmaRow & { academia_id: string }>(
      `
        insert into turmas (
          nome,
          tipo_treino_id,
          dias_semana,
          horario_padrao,
          instrutor_padrao_id,
          academia_id
        ) values ($1, $2, $3, $4, $5, $6)
        returning
          id,
          nome,
          dias_semana,
          to_char(horario_padrao, 'HH24:MI') as horario_padrao,
          tipo_treino_id,
          instrutor_padrao_id,
          academia_id,
          null::timestamptz as deleted_at;
      `,
      [
        dto.nome,
        dto.tipoTreinoId,
        dto.diasSemana,
        dto.horarioPadrao,
        dto.instrutorPadraoId ?? null,
        currentUser.academiaId,
      ],
    );

    if (!turma) {
      throw new BadRequestException('Falha ao criar turma');
    }

    const tipoTreino = await this.buscarTipoTreino(
      dto.tipoTreinoId,
      currentUser.academiaId,
    );
    const instrutorNome = await this.buscarInstrutorNome(
      dto.instrutorPadraoId,
      currentUser.academiaId,
    );

    return {
      id: turma.id,
      nome: turma.nome,
      tipoTreino: tipoTreino?.nome ?? '',
      diasSemana: dto.diasSemana.map(Number),
      horarioPadrao: dto.horarioPadrao,
      instrutorPadraoId: dto.instrutorPadraoId ?? null,
      instrutorPadraoNome: instrutorNome,
      deletedAt: null,
    };
  }

  async atualizar(
    id: string,
    dto: UpdateTurmaDto,
    currentUser: CurrentUser,
  ): Promise<TurmaResponseDto> {
    this.ensureStaff(currentUser);
    const turma = await this.buscarTurma(id, currentUser.academiaId, {
      includeDeleted: false,
    });

    if (!turma) {
      throw new NotFoundException('Turma nao encontrada');
    }

    await this.validarDependencias(dto, currentUser.academiaId);

    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    const pushUpdate = (field: string, value: any) => {
      updates.push(`${field} = $${idx}`);
      params.push(value);
      idx += 1;
    };

    if (dto.nome !== undefined) pushUpdate('nome', dto.nome);
    if (dto.tipoTreinoId !== undefined)
      pushUpdate('tipo_treino_id', dto.tipoTreinoId);
    if (dto.diasSemana !== undefined) pushUpdate('dias_semana', dto.diasSemana);
    if (dto.horarioPadrao !== undefined)
      pushUpdate('horario_padrao', dto.horarioPadrao);
    if (dto.instrutorPadraoId !== undefined)
      pushUpdate('instrutor_padrao_id', dto.instrutorPadraoId ?? null);

    if (updates.length === 0) {
      return this.mapRow(turma);
    }

    params.push(id, currentUser.academiaId);

    const updated = await this.databaseService.queryOne<TurmaRow & { academia_id: string }>(
      `
        update turmas
           set ${updates.join(', ')}
         where id = $${idx}
           and academia_id = $${idx + 1}
         returning
           id,
           nome,
           dias_semana,
           to_char(horario_padrao, 'HH24:MI') as horario_padrao,
           instrutor_padrao_id as instrutor_id,
           (select nome from tipos_treino where id = turmas.tipo_treino_id) as tipo_treino,
           (select nome_completo from usuarios where id = turmas.instrutor_padrao_id) as instrutor_nome,
           deleted_at,
           academia_id;
      `,
      params,
    );

    if (!updated) {
      throw new NotFoundException('Turma nao encontrada');
    }

    return this.mapRow({
      ...updated,
      tipo_treino: updated.tipo_treino,
      instrutor_nome: updated.instrutor_nome,
    });
  }

  async remover(id: string, currentUser: CurrentUser): Promise<void> {
    this.ensureStaff(currentUser);
    const turma = await this.buscarTurma(id, currentUser.academiaId, {
      includeDeleted: true,
    });
    if (!turma) {
      throw new NotFoundException('Turma nao encontrada');
    }

    await this.databaseService.query(
      `
        update turmas
           set deleted_at = now(),
               deleted_by = $1
         where id = $2
           and academia_id = $3;
      `,
      [currentUser.id, id, currentUser.academiaId],
    );
  }

  private mapRow(row: TurmaRow & { academia_id?: string }): TurmaResponseDto {
    return {
      id: row.id,
      nome: row.nome,
      tipoTreino: row.tipo_treino,
      diasSemana: Array.isArray(row.dias_semana)
        ? row.dias_semana.map(Number)
        : [],
      horarioPadrao: row.horario_padrao,
      instrutorPadraoId: row.instrutor_id ?? null,
      instrutorPadraoNome: row.instrutor_nome ?? null,
      deletedAt: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
    };
  }

  private async buscarTurma(
    id: string,
    academiaId: string,
    opts?: { includeDeleted?: boolean },
  ): Promise<
    (TurmaRow & { academia_id: string; tipo_treino_id?: string }) | null
  > {
    return this.databaseService.queryOne(
      `
        select
          t.id,
          t.nome,
          t.dias_semana,
          to_char(t.horario_padrao, 'HH24:MI') as horario_padrao,
          tt.nome as tipo_treino,
          t.tipo_treino_id,
          t.instrutor_padrao_id as instrutor_id,
          instrutor.nome_completo as instrutor_nome,
          t.deleted_at,
          t.academia_id
        from turmas t
        join tipos_treino tt on tt.id = t.tipo_treino_id
        left join usuarios instrutor on instrutor.id = t.instrutor_padrao_id
        where t.id = $1
          and t.academia_id = $2
          ${opts?.includeDeleted ? '' : 'and t.deleted_at is null'}
        limit 1;
      `,
      [id, academiaId],
    );
  }

  private async validarDependencias(
    dto: {
      tipoTreinoId?: string;
      instrutorPadraoId?: string | null;
    },
    academiaId: string,
  ) {
    if (dto.tipoTreinoId) {
      const tipo = await this.buscarTipoTreino(dto.tipoTreinoId, academiaId);
      if (!tipo) {
        throw new NotFoundException('Tipo de treino nao encontrado');
      }
    }

    if (dto.instrutorPadraoId) {
      const instrutor = await this.databaseService.queryOne<{ usuario_id: string }>(
        `
          select usuario_id
          from usuarios_papeis
          where usuario_id = $1
            and academia_id = $2
          limit 1;
        `,
        [dto.instrutorPadraoId, academiaId],
      );

      if (!instrutor) {
        throw new NotFoundException('Instrutor nao encontrado na academia');
      }
    }
  }

  private async buscarTipoTreino(
    tipoTreinoId: string,
    academiaId: string,
  ): Promise<{ id: string; nome: string } | null> {
    return this.databaseService.queryOne(
      `
        select id, nome
        from tipos_treino
        where id = $1
          and academia_id = $2
        limit 1;
      `,
      [tipoTreinoId, academiaId],
    );
  }

  private async buscarInstrutorNome(
    instrutorId: string | null | undefined,
    academiaId: string,
  ): Promise<string | null> {
    if (!instrutorId) return null;
    const instrutor = await this.databaseService.queryOne<{ nome_completo: string }>(
      `
        select u.nome_completo
        from usuarios u
        join usuarios_papeis up
          on up.usuario_id = u.id
         and up.academia_id = $2
        where u.id = $1
        limit 1;
      `,
      [instrutorId, academiaId],
    );
    return instrutor?.nome_completo ?? null;
  }

  private ensureStaff(user: CurrentUser) {
    const roles = (user.roles ?? [user.role]).map((r) => r.toUpperCase());
    const allowed = ['INSTRUTOR', 'PROFESSOR', 'ADMIN', 'TI'];
    if (!roles.some((r) => allowed.includes(r))) {
      throw new ForbiddenException('Apenas staff pode executar esta acao');
    }
  }

  private userIsStaff(user: CurrentUser): boolean {
    const roles = (user.roles ?? [user.role]).map((r) => r.toUpperCase());
    const allowed = ['INSTRUTOR', 'PROFESSOR', 'ADMIN', 'TI'];
    return roles.some((r) => allowed.includes(r));
  }
}
