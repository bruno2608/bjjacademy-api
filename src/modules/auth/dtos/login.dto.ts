import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'aluno.seed@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SenhaAluno123',
    description: 'Senha em texto puro; sera comparada com o hash em banco.',
  })
  @IsString()
  @MinLength(6)
  senha: string;
}
