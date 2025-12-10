import { Injectable } from '@nestjs/common';
import { RegraGraduacaoDto } from './dtos/regra-graduacao.dto';
import { TipoTreinoDto } from './dtos/tipo-treino.dto';
import { UpdateRegraGraduacaoDto } from './dtos/update-regra-graduacao.dto';

@Injectable()
export class ConfigService {
  async listarTiposTreino(): Promise<TipoTreinoDto[]> {
    return [
      { id: 'gi', nome: 'Gi', descricao: 'Treino com kimono' },
      { id: 'nogi', nome: 'No-Gi', descricao: 'Treino sem kimono' },
      { id: 'kids', nome: 'Kids', descricao: 'Aulas infantis' },
    ];
    // TODO: carregar tipos de treino configurados na academia (spec 3.6.1)
  }

  async listarRegrasGraduacao(): Promise<RegraGraduacaoDto[]> {
    return [
      {
        faixaSlug: 'azul',
        aulasMinimas: 50,
        tempoMinimoMeses: 12,
        observacoes: 'Mock rule',
      },
    ];
    // TODO: puxar regras reais por academia (spec 3.5.5)
  }

  async atualizarRegra(
    faixaSlug: string,
    dto: UpdateRegraGraduacaoDto,
  ): Promise<RegraGraduacaoDto> {
    return {
      faixaSlug,
      aulasMinimas: dto.aulasMinimas,
      tempoMinimoMeses: dto.tempoMinimoMeses,
      observacoes: dto.observacoes,
    };
    // TODO: persistir atualização de regras (spec 3.5.6)
  }
}
