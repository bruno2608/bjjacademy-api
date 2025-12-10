import { Injectable } from '@nestjs/common';
import { AulaQrCodeDto } from './dtos/aula-qrcode.dto';
import { AulaDto } from './dtos/aula.dto';

@Injectable()
export class AulasService {
  async listarHoje(): Promise<AulaDto[]> {
    return [
      {
        id: 'aula-1',
        horario: new Date().toISOString(),
        turma: 'Turma Avançada',
        tipoTreino: 'NO-GI',
        professor: 'Professor Y',
      },
    ];
    // TODO: listar aulas do dia considerando academia (spec 3.4.2)
  }

  async gerarQrCode(id: string): Promise<AulaQrCodeDto> {
    return {
      aulaId: id,
      qrToken: 'mock-qr-token',
      expiresAt: new Date(Date.now() + 5 * 60000).toISOString(),
      turma: 'Turma Avançada',
      horario: new Date().toISOString(),
    };
    // TODO: gerar token seguro com TTL (spec 3.4.3)
  }
}
