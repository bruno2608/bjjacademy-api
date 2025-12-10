import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { AulasModule } from './modules/aulas/aulas.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckinModule } from './modules/checkin/checkin.module';
import { ConfigModule as AppConfigModule } from './modules/config/config.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { GraduacoesModule } from './modules/graduacoes/graduacoes.module';
import { InvitesModule } from './modules/invites/invites.module';
import { PresencasModule } from './modules/presencas/presencas.module';
import { AlunosModule } from './modules/alunos/alunos.module';
import { TurmasModule } from './modules/turmas/turmas.module';

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DashboardModule,
    CheckinModule,
    PresencasModule,
    AlunosModule,
    GraduacoesModule,
    TurmasModule,
    AulasModule,
    AppConfigModule,
    InvitesModule,
  ],
})
export class AppModule {}
