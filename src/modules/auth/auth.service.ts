import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthTokensDto } from './dtos/auth-tokens.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { InviteValidationDto } from './dtos/invite-validation.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    const payload = {
      sub: 'mock-user-id',
      email: dto.email,
      role: UserRole.ALUNO,
      academiaId: 'mock-academia-id',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: 'mock-refresh-token',
      user: {
        id: payload.sub,
        nome: 'Mock User',
        email: dto.email,
        role: payload.role,
        academiaId: payload.academiaId,
      },
    };
  }

  async validateInvite(codigo: string): Promise<InviteValidationDto> {
    return {
      codigo,
      valido: codigo.startsWith('BJJ-'),
      status: codigo.startsWith('BJJ-') ? 'VALIDO' : 'INVALIDO',
      academiaId: 'mock-academia-id',
      academiaNome: 'BJJ Academy Central',
      roleSugerido: UserRole.ALUNO,
      emailSugerido: 'invitee@example.com',
    };
  }

  async register(dto: RegisterDto): Promise<AuthTokensDto> {
    const payload = {
      sub: 'new-user-id',
      email: dto.email,
      role: UserRole.ALUNO,
      academiaId: 'mock-academia-id',
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: 'mock-refresh-token',
      user: {
        id: payload.sub,
        nome: dto.nome,
        email: dto.email,
        role: payload.role,
        academiaId: payload.academiaId,
      },
    };
    // TODO: criar usuário e matrícula real com base no convite (spec 3.1.3)
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthTokensDto> {
    const payload = {
      sub: 'mock-user-id',
      email: 'user@example.com',
      role: UserRole.ALUNO,
      academiaId: 'mock-academia-id',
    };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: dto.refreshToken || 'mock-refresh-token',
      user: {
        id: payload.sub,
        nome: 'Mock User',
        email: payload.email,
        role: payload.role,
        academiaId: payload.academiaId,
      },
    };
    // TODO: validar refresh token e rotação (spec 3.1.4)
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    return {
      message: `Token de recuperação enviado para ${dto.email}`,
    };
    // TODO: enviar email real (spec 3.1.5)
  }

  async resetPassword(dto: ResetPasswordDto) {
    return {
      message: `Senha redefinida para token ${dto.token} (mock)`,
    };
    // TODO: validar token de recuperação e atualizar senha (spec 3.1.6)
  }
}
