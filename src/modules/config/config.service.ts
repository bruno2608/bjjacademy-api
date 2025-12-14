import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { RegraGraduacaoDto } from './dtos/regra-graduacao.dto';
import { TipoTreinoDto } from './dtos/tipo-treino.dto';
import { UpdateRegraGraduacaoDto } from './dtos/update-regra-graduacao.dto';

export type CurrentUser = {
  id: string;
  role: string;
  roles?: string[];
  academiaId: string;
};

@Injectable()
export class ConfigService {
  constructor(private readonly databaseService: DatabaseService) {}

  async listarTiposTreino(currentUser: CurrentUser): Promise<TipoTreinoDto[]> {
    const tipos = await this.databaseService.query<{
      id: string;
      codigo: string;
      nome: string;
      descricao: string | null;
      cor_identificacao: string | null;
    }>(
      `
        select id, lower(codigo) as codigo, nome, descricao, cor_identificacao
          from tipos_treino
         where academia_id = $1
         order by lower(codigo) asc;
      `,
      [currentUser.academiaId],
    );

    return tipos.map((tipo) => ({
      id: tipo.codigo,
      uuid: tipo.id,
      nome: tipo.nome,
      descricao: tipo.descricao ?? undefined,
      corIdentificacao: tipo.cor_identificacao ?? null,
    }));
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
