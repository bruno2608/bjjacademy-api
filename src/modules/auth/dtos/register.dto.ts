import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  senha: string;

  @ApiPropertyOptional({
    description: 'Código de convite no formato BJJ-XXXXXX',
  })
  @IsOptional()
  @IsString()
  codigoConvite?: string;
}
