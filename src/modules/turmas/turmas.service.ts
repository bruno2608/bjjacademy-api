import { Injectable } from '@nestjs/common';
import { TurmaDto } from './dtos/turma.dto';

@Injectable()
export class TurmasService {
  async listar(): Promise<TurmaDto[]> {
    return [
      {
        id: 'turma-1',
        nome: 'Fundamentos Gi',
        faixaAlvo: 'Branca/Azul',
        professor: 'Professor X',
        horarios: 'Seg/Qua/Sex - 19h',
      },
    ];
    // TODO: aplicar filtros por aluno/academia (spec 3.4.1)
  }
}
