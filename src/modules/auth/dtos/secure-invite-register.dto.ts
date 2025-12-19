import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SecureInviteRegisterDto {
  @ApiProperty({ description: 'Token do convite (64 chars hex)' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ description: 'OTP de 6 dígitos' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  otp: string;

  @ApiProperty({ description: 'Assinatura HMAC (16 chars hex)' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty()
  nomeCompleto: string;

  @ApiProperty({ description: 'Senha (mínimo 6 caracteres)' })
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiProperty({ description: 'Aceite dos termos de uso' })
  @IsBoolean()
  aceitouTermos: boolean;
}
