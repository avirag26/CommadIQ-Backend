import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { BCRYPT_SALT_ROUNDS } from '../../../common/constants/app.constants';
import { HttpMessage } from '../../../common/enums/http-message.enum';
import { TokenPayload } from '../../../common/interfaces/authenticated-user.interface';
import { hashToken } from '../../../common/utils/crypto.util';
import { successResponse } from '../../../common/utils/response.util';
import { UsersService } from '../../users/services/users.service';
import { AUTH_MESSAGES } from '../constants/auth.constants';
import { LoginDto } from '../dto/login.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthTokens } from '../interfaces/auth-tokens.interface';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException(AUTH_MESSAGES.EMAIL_IN_USE);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    const user = await this.usersService.createUser({
      email: dto.email.toLowerCase(),
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
    });

    const tokens = await this.issueTokens(user.id, user.email);

    return successResponse(
      {
        user: this.usersService.toPublicUser(user),
        ...tokens,
      },
      AUTH_MESSAGES.REGISTERED,
    );
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user || !user.isActive) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const tokens = await this.issueTokens(user.id, user.email);

    return successResponse(
      {
        user: this.usersService.toPublicUser(user),
        ...tokens,
      },
      AUTH_MESSAGES.LOGGED_IN,
    );
  }

  async refresh(dto: RefreshTokenDto) {
    const tokenHash = hashToken(dto.refreshToken);
    const stored = await this.authRepository.findValidRefreshToken(tokenHash);

    if (!stored) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<TokenPayload>(
        dto.refreshToken,
        {
          secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        },
      );
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (payload.type !== 'refresh' || payload.sub !== stored.userId) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    await this.authRepository.revokeRefreshToken(tokenHash);
    const tokens = await this.issueTokens(payload.sub, payload.email);

    return successResponse(tokens, AUTH_MESSAGES.TOKEN_REFRESHED);
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await this.authRepository.revokeRefreshToken(tokenHash);
    return successResponse(null, AUTH_MESSAGES.LOGGED_OUT);
  }

  async validateUserById(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException(HttpMessage.UNAUTHORIZED);
    }
    return this.usersService.toAuthenticatedUser(user);
  }

  private async issueTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const accessPayload: TokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };
    const refreshPayload: TokenPayload = {
      sub: userId,
      email,
      type: 'refresh',
    };

    const accessExpiresIn = this.configService.getOrThrow<string>(
      'jwt.accessExpiresIn',
    ) as StringValue;
    const refreshExpiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    ) as StringValue;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.configService.getOrThrow<string>('jwt.accessSecret'),
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      }),
    ]);

    const expiresAt = this.resolveRefreshExpiry();
    await this.authRepository.createRefreshToken({
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }

  private resolveRefreshExpiry(): Date {
    const expiresIn = this.configService.getOrThrow<string>(
      'jwt.refreshExpiresIn',
    );
    const match = /^(\d+)([smhd])$/.exec(expiresIn);
    const now = Date.now();

    if (!match) {
      return new Date(now + 7 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(now + value * multipliers[unit]);
  }
}
