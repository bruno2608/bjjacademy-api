import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../common/enums/user-role.enum';
import { UserMatriculaDto } from './user-matricula.dto';

export class TokenUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ type: [String], enum: UserRole })
  roles: UserRole[];

  @ApiProperty()
  academiaId: string;

  @ApiProperty({ type: [UserMatriculaDto], required: false })
  matriculas?: UserMatriculaDto[];
}
