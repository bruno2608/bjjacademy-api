import { Injectable } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';
import { DatabaseService } from '../../database/database.service';

type UserWithRolesAndAcademias = {
  usuario_id: string;
  email: string;
  nome_completo: string;
  status: string;
  faixa_atual_slug: string | null;
  grau_atual: number | null;
  senha_hash: string;
  papel: UserRole;
  academia_id: string;
  academia_nome: string;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findUserByEmail(email: string) {
    const query = `
      select
        id,
        email,
        senha_hash,
        nome_completo,
        status,
        faixa_atual_slug,
        grau_atual
      from usuarios
      where email = $1
      limit 1;
    `;

    return this.databaseService.queryOne<{
      id: string;
      email: string;
      senha_hash: string;
      nome_completo: string;
      status: string;
      faixa_atual_slug: string | null;
      grau_atual: number | null;
    }>(query, [email]);
  }

  async findUserWithRolesAndAcademiasByEmail(
    email: string,
  ): Promise<UserWithRolesAndAcademias[]> {
    const query = `
      select
        u.id as usuario_id,
        u.email,
        u.nome_completo,
        u.status,
        u.faixa_atual_slug,
        u.grau_atual,
        u.senha_hash,
        up.papel,
        up.academia_id,
        a.nome as academia_nome
      from usuarios u
      join usuarios_papeis up on up.usuario_id = u.id
      join academias a on a.id = up.academia_id
      where u.email = $1
        and u.status = 'ACTIVE';
    `;

    return this.databaseService.query<UserWithRolesAndAcademias>(query, [
      email,
    ]);
  }

  async findInviteByToken(token: string) {
    const query = `
      select
        c.id,
        c.academia_id,
        c.email,
        c.papel_sugerido,
        c.expires_at,
        c.used_at,
        a.nome as academia_nome
      from convites c
      join academias a on a.id = c.academia_id
      where c.token_hash = $1
        and c.used_at is null
        and (c.expires_at is null or c.expires_at > now())
      limit 1;
    `;

    return this.databaseService.queryOne<{
      id: string;
      academia_id: string;
      email: string;
      papel_sugerido: UserRole;
      expires_at: Date | null;
      used_at: Date | null;
      academia_nome: string;
    }>(query, [token]);
  }

  async markInviteAsUsed(inviteId: string, usuarioId: string): Promise<void> {
    const query = `
      update convites
      set used_at = now()
      where id = $1;
    `;

    await this.databaseService.query(query, [inviteId]);
  }

  async createUserWithRoleAndMatricula(params: {
    email: string;
    senhaHash: string;
    nomeCompleto: string;
    faixaAtualSlug?: string | null;
    grauAtual?: number | null;
    aceitouTermos: boolean;
    academiaId: string;
    papel: UserRole;
  }): Promise<{
    usuario_id: string;
    academia_id: string;
    numero_matricula: number;
  }> {
    const usuario = await this.databaseService.queryOne<{ id: string }>(
      `
        insert into usuarios (
          email,
          senha_hash,
          nome_completo,
          faixa_atual_slug,
          grau_atual,
          aceitou_termos
        ) values ($1, $2, $3, $4, $5, $6)
        returning id;
      `,
      [
        params.email,
        params.senhaHash,
        params.nomeCompleto,
        params.faixaAtualSlug ?? null,
        params.grauAtual ?? null,
        params.aceitouTermos,
      ],
    );

    if (!usuario) {
      throw new Error('Falha ao criar usuario');
    }

    await this.databaseService.query(
      `
        insert into usuarios_papeis (usuario_id, academia_id, papel)
        values ($1, $2, $3);
      `,
      [usuario.id, params.academiaId, params.papel],
    );

    const nextMatricula =
      (await this.databaseService.queryOne<{ next: number }>(
        `
          select coalesce(max(numero_matricula) + 1, 1) as next
          from matriculas
          where academia_id = $1;
        `,
        [params.academiaId],
      ))?.next ?? 1;

    const matricula = await this.databaseService.queryOne<{
      numero_matricula: number;
    }>(
      `
        insert into matriculas (usuario_id, academia_id, numero_matricula)
        values ($1, $2, $3)
        returning numero_matricula;
      `,
      [usuario.id, params.academiaId, nextMatricula],
    );

    return {
      usuario_id: usuario.id,
      academia_id: params.academiaId,
      numero_matricula: matricula?.numero_matricula ?? nextMatricula,
    };
  }
}
