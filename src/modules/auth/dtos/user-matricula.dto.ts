import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';

export class UserMatriculaDto {
  @ApiProperty()
  academiaId: string;

  @ApiProperty()
  academiaNome: string;

  @ApiProperty()
  status: string;

  @ApiProperty({ enum: UserRole })
  papel: UserRole;
}
