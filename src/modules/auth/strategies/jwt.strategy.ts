import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../../common/enums/user-role.enum';
import { DatabaseService } from '../../../database/database.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  roles?: UserRole[];
  academiaId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly databaseService: DatabaseService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'changeme',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const userAcademiaId = payload.academiaId;
    const headerAcademiaId = req.headers['x-academia-id'] as string;

    let activeAcademiaId = userAcademiaId;

    if (headerAcademiaId && headerAcademiaId !== userAcademiaId) {
      const hasMatricula = await this.databaseService.queryOne(
        `SELECT id FROM matriculas WHERE usuario_id = $1 AND academia_id = $2 AND status = 'ATIVA' LIMIT 1`,
        [payload.sub, headerAcademiaId],
      );

      if (hasMatricula) {
        activeAcademiaId = headerAcademiaId;
      }
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      roles: payload.roles ?? (payload.role ? [payload.role] : []),
      academiaId: activeAcademiaId,
    };
  }
}
