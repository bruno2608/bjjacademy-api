import { Injectable } from '@nestjs/common';
import { AlunoDetalheDto } from './dtos/aluno-detalhe.dto';
import { AlunoDto } from './dtos/aluno.dto';
import { EvolucaoAlunoDto } from './dtos/evolucao-aluno.dto';

@Injectable()
export class AlunosService {
  async listar(): Promise<AlunoDto[]> {
    return [
      {
        id: 'aluno-1',
        nome: 'João Silva',
        email: 'joao@example.com',
        faixaAtual: 'Azul',
        statusMatricula: 'ATIVA',
      },
    ];
    // TODO: filtros por nome, faixa, status (spec 3.5.1)
  }

  async detalhar(id: string): Promise<AlunoDetalheDto> {
    return {
      id,
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '+55 11 99999-9999',
      matriculaNumero: 'MAT-001',
      academia: 'BJJ Academy Central',
      statusMatricula: 'ATIVA',
      faixaAtual: 'Azul',
      grauAtual: 2,
      presencasTotais: 120,
    };
    // TODO: validar escopo da academia e role (spec 3.5.2)
  }

  async evolucao(id: string): Promise<EvolucaoAlunoDto> {
    return {
      historico: [
        {
          faixaAnterior: 'Branca',
          grauAnterior: 2,
          faixaNova: 'Azul',
          grauNovo: 0,
          data: '2024-05-10',
          professor: 'Professor X',
        },
      ],
      aulasNaFaixaAtual: 12,
      metaAulas: 40,
      porcentagemProgresso: 30,
    };
    // TODO: cruzar presenças com regras de graduação (spec 3.5.3)
  }
}
