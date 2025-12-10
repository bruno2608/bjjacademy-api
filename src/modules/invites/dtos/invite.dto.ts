import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class InviteDto {
  @ApiProperty()
  codigo: string;

  @ApiProperty({ enum: UserRole })
  roleSugerido: UserRole;

  @ApiProperty()
  validoAte: string;

  @ApiProperty()
  academiaId: string;
}
