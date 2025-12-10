import { ApiProperty } from '@nestjs/swagger';
import { TokenUserDto } from './token-user.dto';

export class AuthTokensDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty({ type: TokenUserDto })
  user: TokenUserDto;
}
