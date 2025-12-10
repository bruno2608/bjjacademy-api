import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CreateInviteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  roleSugerido: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiraEm?: string;
}
