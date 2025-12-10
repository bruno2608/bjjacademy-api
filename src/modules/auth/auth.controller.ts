import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTokensDto } from './dtos/auth-tokens.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { InviteValidationDto } from './dtos/invite-validation.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { RegisterDto } from './dtos/register.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login com email/senha' })
  @ApiOkResponse({ type: AuthTokensDto })
  async login(@Body() dto: LoginDto): Promise<AuthTokensDto> {
    return this.authService.login(dto);
  }

  @Get('convite/:codigo')
  @ApiOperation({ summary: 'Valida código de convite' })
  @ApiOkResponse({ type: InviteValidationDto })
  async validarConvite(
    @Param('codigo') codigo: string,
  ): Promise<InviteValidationDto> {
    return this.authService.validateInvite(codigo);
  }

  @Post('register')
  @ApiOperation({ summary: 'Conclui cadastro a partir de convite' })
  @ApiCreatedResponse({ type: AuthTokensDto })
  async register(@Body() dto: RegisterDto): Promise<AuthTokensDto> {
    return this.authService.register(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Renova tokens' })
  @ApiOkResponse({ type: AuthTokensDto })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    return this.authService.refresh(dto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Inicia recuperação de senha' })
  @ApiOkResponse({ schema: { example: { message: 'Token enviado' } } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Redefine senha com token' })
  @ApiOkResponse({ schema: { example: { message: 'Senha redefinida' } } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
}
