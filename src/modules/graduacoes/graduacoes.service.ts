import { Injectable } from '@nestjs/common';
import { CreateGraduacaoDto } from './dtos/create-graduacao.dto';
import { GraduacaoDto } from './dtos/graduacao.dto';

@Injectable()
export class GraduacoesService {
  async criar(dto: CreateGraduacaoDto): Promise<GraduacaoDto> {
    return {
      id: 'graduacao-1',
      alunoId: dto.alunoId,
      faixaAnterior: dto.faixaAnterior,
      grauAnterior: dto.grauAnterior,
      faixaNova: dto.faixaNova,
      grauNovo: dto.grauNovo,
      dataGraduacao: dto.dataGraduacao,
      professorId: dto.professorId,
      observacoes: dto.observacoes,
    };
    // TODO: registrar graduação real (spec 3.5.4)
  }
}
