import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class InviteValidationDto {
  @ApiProperty()
  codigo: string;

  @ApiProperty()
  valido: boolean;

  @ApiProperty({ description: 'Motivo ou status do convite' })
  status: 'VALIDO' | 'EXPIRADO' | 'INVALIDO';

  @ApiProperty({ required: false })
  academiaId?: string;

  @ApiProperty({ required: false })
  academiaNome?: string;

  @ApiProperty({ enum: UserRole, required: false })
  roleSugerido?: UserRole;

  @ApiProperty({ required: false })
  emailSugerido?: string;
}
