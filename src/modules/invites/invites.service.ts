import { Injectable } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';
import { CreateInviteDto } from './dtos/create-invite.dto';
import { InviteDto } from './dtos/invite.dto';

@Injectable()
export class InvitesService {
  async criar(dto: CreateInviteDto): Promise<InviteDto> {
    return {
      codigo: 'BJJ-ABC123',
      roleSugerido: dto.roleSugerido || UserRole.ALUNO,
      validoAte: dto.expiraEm || new Date(Date.now() + 7 * 86400000).toISOString(),
      academiaId: 'mock-academia-id',
    };
    // TODO: gerar código único e persistir (spec 3.6.2)
  }
}
