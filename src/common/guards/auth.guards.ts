import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RequestWithUser, PAYLOAD } from 'src/interfaces/jwt.interface';
import { JwtTokenService } from 'src/shared/services/jwt-token.service';
import { UsersRepository } from 'src/modules/users/infrastructure/user.repository';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { UserStatusEnum } from '../enums/enums';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtTokenService: JwtTokenService,
    private readonly reflector: Reflector,
    private readonly usersRepository: UsersRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractBearerToken(request.headers.authorization);

    let payload: PAYLOAD;

    try {
      payload = await this.jwtTokenService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedException(
        'انتهت صلاحية جلسة الدخول. يرجى تسجيل الدخول مرة أخرى.',
      );
    }

    const user = await this.usersRepository.findById(payload.sub);

    if (!user || user.status !== UserStatusEnum.ACTIVE) {
      throw new UnauthorizedException(
        'لا يمكن التحقق من حسابك الآن. يرجى تسجيل الدخول مرة أخرى.',
      );
    }

    if (!user.last_login) {
      throw new UnauthorizedException(
        'تم تسجيل خروجك من النظام. يرجى تسجيل الدخول مرة أخرى.',
      );
    }

    if (!payload.lastLoginAt) {
      throw new UnauthorizedException('توكن غير صالح.');
    }

    const tokenLastLoginAt = Number(payload.lastLoginAt);
    const userLastLoginAt = new Date(user.last_login).getTime();

    if (Number.isNaN(tokenLastLoginAt) || Number.isNaN(userLastLoginAt)) {
      throw new UnauthorizedException('توكن غير صالح.');
    }

    if (tokenLastLoginAt !== userLastLoginAt) {
      throw new UnauthorizedException(
        'تم تسجيل الدخول إلى حسابك من جهاز آخر. يرجى تسجيل الدخول مرة أخرى.',
      );
    }

    request.user = {
      sub: payload.sub,
      email: payload.email,
      roleId: payload.roleId,
      lastLoginAt: payload.lastLoginAt,
    };

    return true;
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException(
        'يرجى تسجيل الدخول أولاً للوصول إلى هذه الصفحة.',
      );
    }

    const [scheme, token] = authorization.trim().split(/\s+/);

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException(
        'جلسة الدخول غير صالحة. تأكد من إرسال التوكن بالطريقة الصحيحة.',
      );
    }

    return token;
  }
}
