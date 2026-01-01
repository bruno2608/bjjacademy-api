import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiAuth } from '../../common/decorators/api-auth.decorator';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { CurrentRedeId } from '../../common/decorators/current-rede-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RedeAdminGuard } from '../../common/guards/rede-admin.guard';
import { RedeService } from './rede.service';
import {
  RedeResponseDto,
  AcademiaRedeDto,
  VincularAcademiaDto,
  VincularAcademiaResponseDto,
  CreateRedeDto,
  CreateRedeResponseDto,
} from './dtos/rede.dto';

@ApiTags('Rede')
@ApiAuth()
@UseGuards(JwtAuthGuard)
@Controller('rede')
export class RedeController {
  constructor(private readonly redeService: RedeService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova rede e vincula a academia atual' })
  @ApiOkResponse({ type: CreateRedeResponseDto })
  async criarRede(
    @Body() dto: CreateRedeDto,
    @CurrentUser() user: { id: string; academiaId: string },
  ): Promise<CreateRedeResponseDto> {
    return this.redeService.createRede(dto.nome, user);
  }

  @Get('me')
  @ApiOperation({ summary: 'Retorna dados da rede do admin autenticado' })
  @ApiOkResponse({ type: RedeResponseDto })
  async getRede(
    @CurrentUser() user: { id: string; academiaId: string },
  ): Promise<RedeResponseDto> {
    return this.redeService.getRede(user);
  }

  @Get('academias')
  @ApiOperation({ summary: 'Lista todas as academias da rede' })
  @ApiOkResponse({ type: [AcademiaRedeDto] })
  async listarAcademias(
    @CurrentUser() user: { id: string; academiaId: string },
  ): Promise<AcademiaRedeDto[]> {
    return this.redeService.listarAcademias(user);
  }

  @Patch('academias/:id/ativar')
  @ApiOperation({ summary: 'Ativa uma academia da rede' })
  async ativarAcademia(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: { id: string; academiaId: string },
  ) {
    return this.redeService.toggleAcademiaAtivo(id, true, user);
  }

  @Patch('academias/:id/desativar')
  @ApiOperation({ summary: 'Desativa uma academia da rede' })
  async desativarAcademia(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: { id: string; academiaId: string },
  ) {
    return this.redeService.toggleAcademiaAtivo(id, false, user);
  }

  @Post('academias/vincular')
  @ApiOperation({ summary: 'Vincula uma academia existente à rede pelo código' })
  @ApiOkResponse({ type: VincularAcademiaResponseDto })
  async vincularAcademia(
    @Body() dto: VincularAcademiaDto,
    @CurrentUser() user: { id: string; academiaId: string },
  ): Promise<VincularAcademiaResponseDto> {
    return this.redeService.vincularAcademia(dto.codigoAcademia, user);
  }

  @Post('academias/:id/desvincular')
  @ApiOperation({ summary: 'Desvincula uma academia da rede' })
  async desvincularAcademia(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: { id: string; academiaId: string },
  ) {
    return this.redeService.desvincularAcademia(id, user);
  }

  @Get('academias/:id')
  @ApiOperation({ summary: 'Retorna detalhes de uma academia da rede' })
  @ApiOkResponse({ type: AcademiaRedeDto })
  async getAcademiaById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: { id: string; academiaId: string },
  ): Promise<AcademiaRedeDto> {
    return this.redeService.getAcademiaById(id, user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Atualiza dados da rede' })
  @ApiOkResponse({ type: RedeResponseDto })
  async updateRede(
    @Body() dto: { nome: string },
    @CurrentUser() user: { id: string; academiaId: string },
  ): Promise<RedeResponseDto> {
    return this.redeService.updateRede(dto, user);
  }

  @Get('gestores-elegiveis')
  @ApiOperation({ summary: 'Lista usuários elegíveis para gestão da rede' })
  async listarGestoresElegiveis(
    @CurrentUser() user: { id: string; academiaId: string },
  ) {
    return this.redeService.listarGestoresElegiveis(user);
  }

  @Post('transferir')
  @ApiOperation({ summary: 'Transfere a gestão da rede para outro usuário' })
  async transferirGestor(
    @Body() dto: { novoAdminId: string },
    @CurrentUser() user: { id: string; academiaId: string },
  ) {
    return this.redeService.transferirGestor(dto.novoAdminId, user);
  }

  @Get('academias/:id/impacto-desativacao')
  @ApiOperation({ summary: 'Verifica impacto antes de desativar academia' })
  async checkImpactoDesativacao(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: { id: string; academiaId: string },
  ) {
    return this.redeService.checkImpactoDesativacao(id, user);
  }
}
