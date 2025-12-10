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
import { DashboardService } from './dashboard.service';
import { AlunoDashboardDto } from './dtos/aluno-dashboard.dto';
import { StaffDashboardDto } from './dtos/staff-dashboard.dto';

@ApiTags('Dashboard')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('aluno')
  @Roles(UserRole.ALUNO)
  @ApiOperation({ summary: 'Dashboard do aluno' })
  @ApiOkResponse({ type: AlunoDashboardDto })
  async getAlunoDashboard(): Promise<AlunoDashboardDto> {
    return this.dashboardService.getAlunoDashboard();
  }

  @Get('staff')
  @Roles(UserRole.INSTRUTOR, UserRole.PROFESSOR, UserRole.ADMIN, UserRole.TI)
  @ApiOperation({ summary: 'Dashboard do staff' })
  @ApiOkResponse({ type: StaffDashboardDto })
  async getStaffDashboard(): Promise<StaffDashboardDto> {
    return this.dashboardService.getStaffDashboard();
  }
}
