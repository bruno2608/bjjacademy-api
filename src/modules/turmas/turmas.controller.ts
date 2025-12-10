import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TurmaDto } from './dtos/turma.dto';
import { TurmasService } from './turmas.service';

@ApiTags('Turmas')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('turmas')
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Get()
  @Roles(
    UserRole.ALUNO,
    UserRole.INSTRUTOR,
    UserRole.PROFESSOR,
    UserRole.ADMIN,
    UserRole.TI,
  )
  @ApiOperation({ summary: 'Lista turmas cadastradas' })
  @ApiOkResponse({ type: [TurmaDto] })
  async listar(): Promise<TurmaDto[]> {
    return this.turmasService.listar();
  }
}
