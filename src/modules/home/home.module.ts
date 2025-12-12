import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AulasModule } from '../aulas/aulas.module';
import { AuthModule } from '../auth/auth.module';
import { CheckinModule } from '../checkin/checkin.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { PresencasModule } from '../presencas/presencas.module';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    DashboardModule,
    AulasModule,
    CheckinModule,
    PresencasModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
