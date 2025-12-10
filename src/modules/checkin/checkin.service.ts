import { Injectable } from '@nestjs/common';
import { CheckinDisponivelDto } from './dtos/checkin-disponivel.dto';
import { CheckinResponseDto } from './dtos/checkin-response.dto';
import { CreateCheckinDto } from './dtos/create-checkin.dto';

@Injectable()
export class CheckinService {
  async listarDisponiveis(): Promise<CheckinDisponivelDto[]> {
    return [
      {
        aulaId: 'aula-123',
        horario: new Date().toISOString(),
        turma: 'Fundamentos Gi',
        tipoTreino: 'GI',
        statusCheckin: 'NAO_FEITO',
      },
    ];
  }

  async criarCheckin(dto: CreateCheckinDto): Promise<CheckinResponseDto> {
    return {
      presencaId: 'presenca-123',
      aulaId: dto.aulaId,
      status: dto.tipo === 'MANUAL' ? 'PENDENTE' : 'PRESENTE',
      tipo: dto.tipo,
      mensagem:
        dto.tipo === 'QR'
          ? 'Check-in via QR validado (mock)'
          : 'Check-in manual aguardando aprovação (mock)',
    };
    // TODO: validar qrToken, impedir duplicidade, vincular academia (spec 3.3.2)
  }
}
