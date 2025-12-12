import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class HomeQueryDto {
  @ApiPropertyOptional({
    enum: ['aluno', 'staff'],
    description:
      'Opcional. Default: STAFF se o token tiver papel staff; senao ALUNO. Override exige o papel correspondente.',
  })
  @IsOptional()
  @IsIn(['aluno', 'staff'])
  mode?: 'aluno' | 'staff';
}
