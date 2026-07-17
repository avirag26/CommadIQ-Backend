import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

export class AuthTokensResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType!: string;
}

export class AuthResponseDto extends AuthTokensResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;
}
