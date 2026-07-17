import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { METADATA_KEYS } from '../../../common/constants/app.constants';
import { JWT_STRATEGY } from '../constants/auth.constants';

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      METADATA_KEYS.IS_PUBLIC,
      [context.getHandler(), context.getClass()],
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
