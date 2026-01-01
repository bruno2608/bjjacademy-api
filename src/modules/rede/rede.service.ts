import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import {
  RedeResponseDto,
  AcademiaRedeDto,
  VincularAcademiaResponseDto,
  CreateRedeResponseDto,
} from './dtos/rede.dto';

type CurrentUser = {
  id: string;
  academiaId: string;
};

@Injectable()
export class RedeService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get user's network (if they are a network admin)
   */
  async getRede(user: CurrentUser): Promise<RedeResponseDto> {
    // Check if user is a network admin
    const redeAdmin = await this.databaseService.queryOne<{
      rede_id: string;
    }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    const rede = await this.databaseService.queryOne<{
      id: string;
      nome: string;
      ativo: boolean;
      criado_em: string;
      total_academias: string;
    }>(
      `
        SELECT 
          r.id, r.nome, r.ativo, r.criado_em,
          (SELECT COUNT(*) FROM academias WHERE rede_id = r.id) as total_academias
        FROM redes r
        WHERE r.id = $1
      `,
      [redeAdmin.rede_id],
    );

    if (!rede) {
      throw new NotFoundException('Rede não encontrada');
    }

    return {
      id: rede.id,
      nome: rede.nome,
      ativo: rede.ativo,
      totalAcademias: parseInt(rede.total_academias, 10),
      criadoEm: rede.criado_em,
    };
  }

  /**
   * List all academies in the network
   */
  async listarAcademias(user: CurrentUser): Promise<AcademiaRedeDto[]> {
    // Get user's network
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    const academias = await this.databaseService.query<{
      id: string;
      nome: string;
      codigo_convite: string | null;
      ativo: boolean;
      endereco: string | null;
      telefone: string | null;
      criado_em: string;
      total_alunos: string;
    }>(
      `
        SELECT 
          a.id, a.nome, a.codigo_convite, a.ativo, a.endereco, a.telefone, a.criado_em,
          (SELECT COUNT(*) FROM matriculas m WHERE m.academia_id = a.id AND m.status = 'ATIVA') as total_alunos
        FROM academias a
        WHERE a.rede_id = $1
        ORDER BY a.nome
      `,
      [redeAdmin.rede_id],
    );

    return academias.map((a) => ({
      id: a.id,
      nome: a.nome,
      codigo: a.codigo_convite,
      ativo: a.ativo,
      endereco: a.endereco,
      telefone: a.telefone,
      totalAlunos: parseInt(a.total_alunos, 10),
      criadoEm: a.criado_em,
    }));
  }

  /**
   * Toggle academy active status
   */
  async toggleAcademiaAtivo(
    academiaId: string,
    ativo: boolean,
    user: CurrentUser,
  ): Promise<{ id: string; ativo: boolean; message: string }> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Check academy belongs to this network
    const academia = await this.databaseService.queryOne<{ id: string; rede_id: string | null }>(
      `SELECT id, rede_id FROM academias WHERE id = $1`,
      [academiaId],
    );

    if (!academia) {
      throw new NotFoundException('Academia não encontrada');
    }

    if (academia.rede_id !== redeAdmin.rede_id) {
      throw new ForbiddenException('Esta academia não pertence à sua rede');
    }

    // Update
    await this.databaseService.query(
      `UPDATE academias SET ativo = $1 WHERE id = $2`,
      [ativo, academiaId],
    );

    return {
      id: academiaId,
      ativo,
      message: ativo ? 'Academia ativada' : 'Academia desativada',
    };
  }

  /**
   * Link an existing academy to the network by its signup code
   */
  async vincularAcademia(
    codigoAcademia: string,
    user: CurrentUser,
  ): Promise<VincularAcademiaResponseDto> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Find academy by code
    const academia = await this.databaseService.queryOne<{
      id: string;
      nome: string;
      rede_id: string | null;
    }>(
      `SELECT id, nome, rede_id FROM academias WHERE UPPER(codigo_convite) = UPPER($1)`,
      [codigoAcademia],
    );

    if (!academia) {
      throw new NotFoundException('Academia não encontrada com este código');
    }

    if (academia.rede_id) {
      throw new BadRequestException('Esta academia já pertence a uma rede');
    }

    // Link
    await this.databaseService.query(
      `UPDATE academias SET rede_id = $1 WHERE id = $2`,
      [redeAdmin.rede_id, academia.id],
    );

    return {
      academiaId: academia.id,
      academiaName: academia.nome,
      message: `Academia "${academia.nome}" vinculada à rede com sucesso`,
    };
  }

  /**
   * Create a new network and link the user's current academia to it
   */
  async createRede(
    nome: string,
    user: CurrentUser,
  ): Promise<CreateRedeResponseDto> {
    // Check if user is already a network admin
    const existingAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (existingAdmin) {
      throw new BadRequestException('Você já é administrador de uma rede');
    }

    // Check if user's academia already belongs to a network
    const academia = await this.databaseService.queryOne<{
      id: string;
      nome: string;
      rede_id: string | null;
    }>(
      `SELECT id, nome, rede_id FROM academias WHERE id = $1`,
      [user.academiaId],
    );

    if (!academia) {
      throw new NotFoundException('Academia não encontrada');
    }

    if (academia.rede_id) {
      throw new BadRequestException('Sua academia já pertence a uma rede');
    }

    // Create the network
    const rede = await this.databaseService.queryOne<{ id: string }>(
      `INSERT INTO redes (nome) VALUES ($1) RETURNING id`,
      [nome],
    );

    if (!rede) {
      throw new BadRequestException('Erro ao criar rede');
    }

    // Add user as network admin
    await this.databaseService.query(
      `INSERT INTO redes_admins (rede_id, usuario_id, papel) VALUES ($1, $2, 'ADMIN_REDE')`,
      [rede.id, user.id],
    );

    // Link the academia to the network
    await this.databaseService.query(
      `UPDATE academias SET rede_id = $1 WHERE id = $2`,
      [rede.id, user.academiaId],
    );

    return {
      id: rede.id,
      nome,
      academiaVinculada: academia.nome,
      message: `Rede "${nome}" criada com sucesso. "${academia.nome}" é a primeira filial.`,
    };
  }

  /**
   * Desvincula uma academia da rede
   */
  async desvincularAcademia(
    academiaId: string,
    user: CurrentUser,
  ): Promise<{ id: string; message: string }> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Check academy belongs to this network
    const academia = await this.databaseService.queryOne<{ 
      id: string; 
      nome: string;
      rede_id: string | null 
    }>(
      `SELECT id, nome, rede_id FROM academias WHERE id = $1`,
      [academiaId],
    );

    if (!academia) {
      throw new NotFoundException('Academia não encontrada');
    }

    if (academia.rede_id !== redeAdmin.rede_id) {
      throw new ForbiddenException('Esta academia não pertence à sua rede');
    }

    // Desvincular
    await this.databaseService.query(
      `UPDATE academias SET rede_id = NULL WHERE id = $1`,
      [academiaId],
    );

    return {
      id: academiaId,
      message: `Academia "${academia.nome}" desvinculada da rede`,
    };
  }

  /**
   * Retorna detalhes de uma academia da rede
   */
  async getAcademiaById(
    academiaId: string,
    user: CurrentUser,
  ): Promise<AcademiaRedeDto> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    const academia = await this.databaseService.queryOne<{
      id: string;
      nome: string;
      codigo_convite: string | null;
      ativo: boolean;
      endereco: string | null;
      telefone: string | null;
      criado_em: string;
      total_alunos: string;
    }>(
      `
        SELECT 
          a.id, a.nome, a.codigo_convite, a.ativo, a.endereco, a.telefone, a.criado_em,
          (SELECT COUNT(*) FROM matriculas m WHERE m.academia_id = a.id AND m.status = 'ATIVA') as total_alunos
        FROM academias a
        WHERE a.id = $1 AND a.rede_id = $2
      `,
      [academiaId, redeAdmin.rede_id],
    );

    if (!academia) {
      throw new NotFoundException('Academia não encontrada ou não pertence à sua rede');
    }

    return {
      id: academia.id,
      nome: academia.nome,
      codigo: academia.codigo_convite,
      ativo: academia.ativo,
      endereco: academia.endereco,
      telefone: academia.telefone,
      totalAlunos: parseInt(academia.total_alunos, 10),
      criadoEm: academia.criado_em,
    };
  }

  /**
   * Atualiza dados da rede
   */
  async updateRede(
    dto: { nome: string },
    user: CurrentUser,
  ): Promise<RedeResponseDto> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    if (!dto.nome || dto.nome.trim().length < 2) {
      throw new BadRequestException('Nome da rede deve ter pelo menos 2 caracteres');
    }

    await this.databaseService.query(
      `UPDATE redes SET nome = $1 WHERE id = $2`,
      [dto.nome.trim(), redeAdmin.rede_id],
    );

    return this.getRede(user);
  }

  /**
   * Lista usuários elegíveis para serem gestores da rede
   * (ADMINs de academias da rede, exceto o admin atual)
   */
  async listarGestoresElegiveis(
    user: CurrentUser,
  ): Promise<{ id: string; nome: string; email: string; academiaNome: string }[]> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Get ADMINs from academies in the network (except current admin)
    const elegibles = await this.databaseService.query<{
      id: string;
      nome: string;
      email: string;
      academia_nome: string;
    }>(
      `
        SELECT DISTINCT u.id, u.nome, u.email, a.nome as academia_nome
        FROM usuarios u
        JOIN usuarios_papeis up ON up.usuario_id = u.id AND up.papel = 'ADMIN'
        JOIN academias a ON a.id = up.academia_id
        WHERE a.rede_id = $1 AND u.id != $2
        ORDER BY u.nome
      `,
      [redeAdmin.rede_id, user.id],
    );

    return elegibles.map((e) => ({
      id: e.id,
      nome: e.nome,
      email: e.email,
      academiaNome: e.academia_nome,
    }));
  }

  /**
   * Transfere a gestão da rede para outro usuário
   */
  async transferirGestor(
    novoAdminId: string,
    user: CurrentUser,
  ): Promise<{ message: string; novoAdminNome: string }> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Verify new admin is eligible
    const novoAdmin = await this.databaseService.queryOne<{
      id: string;
      nome: string;
    }>(
      `
        SELECT u.id, u.nome
        FROM usuarios u
        JOIN usuarios_papeis up ON up.usuario_id = u.id AND up.papel = 'ADMIN'
        JOIN academias a ON a.id = up.academia_id
        WHERE a.rede_id = $1 AND u.id = $2
        LIMIT 1
      `,
      [redeAdmin.rede_id, novoAdminId],
    );

    if (!novoAdmin) {
      throw new BadRequestException('Usuário não é um ADMIN elegível da rede');
    }

    // Transfer: update redes_admins
    await this.databaseService.query(
      `UPDATE redes_admins SET usuario_id = $1 WHERE rede_id = $2 AND usuario_id = $3`,
      [novoAdminId, redeAdmin.rede_id, user.id],
    );

    return {
      message: `Gestão da rede transferida para ${novoAdmin.nome}`,
      novoAdminNome: novoAdmin.nome,
    };
  }

  /**
   * Verifica impacto antes de desativar academia (T6)
   */
  async checkImpactoDesativacao(
    academiaId: string,
    user: CurrentUser,
  ): Promise<{ totalAlunos: number; requiresConfirmation: boolean; message: string }> {
    // Check user is network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Check academy belongs to network
    const academia = await this.databaseService.queryOne<{ id: string; rede_id: string | null }>(
      `SELECT id, rede_id FROM academias WHERE id = $1`,
      [academiaId],
    );

    if (!academia || academia.rede_id !== redeAdmin.rede_id) {
      throw new NotFoundException('Academia não encontrada ou não pertence à sua rede');
    }

    // Count active students
    const result = await this.databaseService.queryOne<{ total: string }>(
      `SELECT COUNT(*) as total FROM matriculas WHERE academia_id = $1 AND status = 'ATIVA'`,
      [academiaId],
    );

    const totalAlunos = parseInt(result?.total || '0', 10);

    return {
      totalAlunos,
      requiresConfirmation: totalAlunos > 0,
      message: totalAlunos > 0 
        ? `${totalAlunos} aluno(s) serão afetados pela desativação` 
        : 'Nenhum aluno ativo será afetado',
    };
  }
}

