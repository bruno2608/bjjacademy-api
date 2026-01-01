import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

/**
 * Guard que verifica se o usuário é administrador de uma rede.
 * Usa a tabela redes_admins para validar.
 */
@Injectable()
export class RedeAdminGuard implements CanActivate {
  constructor(private readonly databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Check if user is a network admin
    const redeAdmin = await this.databaseService.queryOne<{ rede_id: string }>(
      `SELECT rede_id FROM redes_admins WHERE usuario_id = $1 LIMIT 1`,
      [user.id],
    );

    if (!redeAdmin) {
      throw new ForbiddenException('Você não é administrador de nenhuma rede');
    }

    // Attach rede_id to request for use in controllers/services
    request.redeId = redeAdmin.rede_id;

    return true;
  }
}
