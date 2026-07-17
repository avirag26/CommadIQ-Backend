import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { HttpMessage } from '../../../common/enums/http-message.enum';
import { TokenPayload } from '../../../common/interfaces/authenticated-user.interface';
import { JWT_STRATEGY } from '../constants/auth.constants';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.accessSecret'),
    });
  }

  async validate(payload: TokenPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException(HttpMessage.UNAUTHORIZED);
    }

    return this.authService.validateUserById(payload.sub);
  }
}
