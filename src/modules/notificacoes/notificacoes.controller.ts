import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import { NotificacoesService } from './notificacoes.service';

interface CurrentUserPayload {
  id: string;
  email: string;
  role: string;
  roles: string[];
  academiaId: string;
}

@ApiTags('Notificações')
@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista notificações do usuário (paginado)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listar(
    @CurrentUser() user: CurrentUserPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificacoesService.listar(
      user.id,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get('recentes')
  @ApiOperation({ summary: 'Lista últimas 5 notificações (para dropdown)' })
  async listarRecentes(@CurrentUser() user: CurrentUserPayload) {
    const notificacoes = await this.notificacoesService.listarRecentes(user.id);
    const naoLidas = await this.notificacoesService.contarNaoLidas(user.id);
    return { notificacoes, naoLidas };
  }

  @Get('count')
  @ApiOperation({ summary: 'Conta notificações não lidas' })
  async contarNaoLidas(@CurrentUser() user: CurrentUserPayload) {
    const count = await this.notificacoesService.contarNaoLidas(user.id);
    return { count };
  }

  @Patch(':id/lida')
  @ApiOperation({ summary: 'Marca uma notificação como lida' })
  async marcarComoLida(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') id: string,
  ) {
    return this.notificacoesService.marcarComoLida(id, user.id);
  }

  @Patch('todas/lidas')
  @ApiOperation({ summary: 'Marca todas as notificações como lidas' })
  async marcarTodasComoLidas(@CurrentUser() user: CurrentUserPayload) {
    return this.notificacoesService.marcarTodasComoLidas(user.id);
  }
}
