import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';
import { AuthRepository, UserProfileRow } from './auth.repository';
import { AuthTokensDto } from './dtos/auth-tokens.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { InviteValidationDto } from './dtos/invite-validation.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { MeResponseDto } from './dtos/me-response.dto';

type UserWithRole = {
  usuario_id: string;
  email: string;
  nome_completo: string;
  status: string;
  faixa_atual_slug: string | null;
  grau_atual: number | null;
  senha_hash: string;
  papel: UserRole;
  academia_id: string;
  academia_nome: string;
};

type CurrentUser = {
  id: string;
  email: string;
  role: UserRole;
  academiaId: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokensDto> {
    if (!dto.senha) {
      throw new BadRequestException('Senha e obrigatoria');
    }

    const usuarios =
      await this.authRepository.findUserWithRolesAndAcademiasByEmail(
        dto.email,
      );

    if (!usuarios.length) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const usuario = usuarios[0];
    const senhaValida = await bcrypt.compare(dto.senha, usuario.senha_hash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais invalidas');
    }

    const principal = this.pickPrimaryRole(usuarios);
    const payload = {
      sub: usuario.usuario_id,
      email: usuario.email,
      role: principal.papel,
      academiaId: principal.academia_id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: 'mock-refresh-token',
      user: {
        id: payload.sub,
        nome: usuario.nome_completo,
        email: payload.email,
        role: payload.role,
        academiaId: payload.academiaId,
      },
    };
  }

  async me(currentUser: CurrentUser): Promise<MeResponseDto> {
    const rows = await this.authRepository.findUserProfileByIdAndAcademia(
      currentUser.id,
      currentUser.academiaId,
    );

    if (!rows.length) {
      throw new NotFoundException('Usuario nao encontrado');
    }

    const primary = this.pickPrimaryRole<UserProfileRow>(rows);
    const role = ((primary.papel as string) ?? UserRole.ALUNO).toUpperCase() as UserRole;

    // TODO: bloquear usuarios com status diferente de ACTIVE quando login/refresh forem ajustados
    if (primary.usuario_status !== 'ACTIVE') {
      // no-op por enquanto; endpoint ainda retorna os dados
    }

    return {
      id: primary.usuario_id,
      nome: primary.nome_completo,
      email: primary.email,
      role,
      academiaId: primary.academia_id,
      academiaNome: primary.academia_nome,
      faixaAtual: primary.faixa_atual_slug,
      grauAtual: primary.grau_atual,
      matriculaStatus: primary.matricula_status,
      matriculaDataInicio: primary.matricula_data_inicio,
      matriculaDataFim: primary.matricula_data_fim,
    };
  }

  async validateInvite(codigo: string): Promise<InviteValidationDto> {
    const invite = await this.authRepository.findInviteByToken(codigo);
    if (!invite) {
      throw new NotFoundException('Convite invalido ou expirado');
    }

    const papelSugerido = (
      (invite.papel_sugerido as string) ?? UserRole.ALUNO
    ).toUpperCase() as UserRole;

    return {
      codigo,
      valido: true,
      status: 'VALIDO',
      academiaId: invite.academia_id,
      academiaNome: invite.academia_nome,
      roleSugerido: papelSugerido,
      emailSugerido: invite.email,
    };
  }

  async register(dto: RegisterDto): Promise<AuthTokensDto> {
    if (!dto.codigoConvite) {
      throw new BadRequestException('Codigo de convite e obrigatorio');
    }

    if (!dto.aceitouTermos) {
      throw new BadRequestException('Aceite dos termos e obrigatorio');
    }

    const invite = await this.authRepository.findInviteByToken(
      dto.codigoConvite,
    );
    if (!invite) {
      throw new BadRequestException('Convite invalido ou expirado');
    }

    // Caso o convite tenha um email predefinido diferente do informado, bloquear por enquanto.
    if (
      invite.email &&
      invite.email.toLowerCase() !== dto.email.toLowerCase()
    ) {
      throw new BadRequestException('Email nao bate com o convite');
    }

    const existente = await this.authRepository.findUserByEmail(dto.email);
    if (existente) {
      throw new BadRequestException('Email ja cadastrado');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const papelSugerido = (
      (invite.papel_sugerido as string) ?? UserRole.ALUNO
    ).toUpperCase() as UserRole;
    const novoUsuario =
      await this.authRepository.createUserWithRoleAndMatricula({
        email: dto.email,
        senhaHash,
        nomeCompleto: dto.nomeCompleto ?? dto.nome ?? dto.email,
        aceitouTermos: dto.aceitouTermos,
        academiaId: invite.academia_id,
        papel: papelSugerido,
      });

    await this.authRepository.markInviteAsUsed(
      invite.id,
      novoUsuario.usuario_id,
    );

    const payload = {
      sub: novoUsuario.usuario_id,
      email: dto.email,
      role: papelSugerido,
      academiaId: invite.academia_id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: 'mock-refresh-token',
      user: {
        id: payload.sub,
        nome: dto.nomeCompleto ?? dto.nome ?? dto.email,
        email: payload.email,
        role: payload.role,
        academiaId: payload.academiaId,
      },
    };
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
    // TODO: validar refresh token real (spec 3.1.4)
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    return {
      message: `Token de recuperacao enviado para ${dto.email}`,
    };
    // TODO: enviar email real (spec 3.1.5)
  }

  async resetPassword(dto: ResetPasswordDto) {
    return {
      message: `Senha redefinida para token ${dto.token} (mock)`,
    };
    // TODO: validar token de recuperacao e atualizar senha (spec 3.1.6)
  }

  private pickPrimaryRole<T extends { papel: UserRole | string }>(
    rows: T[],
  ): T {
    const priority: Record<UserRole, number> = {
      [UserRole.TI]: 1,
      [UserRole.ADMIN]: 2,
      [UserRole.PROFESSOR]: 3,
      [UserRole.INSTRUTOR]: 4,
      [UserRole.ALUNO]: 5,
    };

    let primary = rows[0];
    for (const current of rows) {
      const currentRole = (current.papel as string)?.toUpperCase() as UserRole;
      const primaryRole = (primary.papel as string)?.toUpperCase() as UserRole;
      const currentPriority = priority[currentRole] ?? Number.MAX_SAFE_INTEGER;
      const primaryPriority = priority[primaryRole] ?? Number.MAX_SAFE_INTEGER;
      if (currentPriority < primaryPriority) {
        primary = current;
      }
    }

    return {
      ...primary,
      papel: ((primary.papel as string) ?? UserRole.ALUNO).toUpperCase() as UserRole,
    } as T;
  }
}
