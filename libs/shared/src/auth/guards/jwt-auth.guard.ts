import { Injectable, CanActivate } from '@nestjs/common';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JWT, JWE } from 'jose';
import { AuthService, JWTVerify } from '../auth.service';

export function checkIsPublic(
  reflector: Reflector,
  context: ExecutionContext,
): boolean {
  const isAllPublic = reflector.get<boolean>('isPublic', context.getClass());
  const isPublic = reflector.get<boolean>('isPublic', context.getHandler());
  return isPublic === true || (isAllPublic === true && isPublic !== false);
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  public constructor(
    protected readonly reflector: Reflector,
    protected readonly authService: AuthService<any>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (checkIsPublic(this.reflector, context)) return true;

    const request: Request = context.switchToHttp().getRequest();
    let token = request.get('authorization');
    const prefix = 'bearer ';
    if (token && token.toLowerCase().startsWith(prefix)) {
      token = token.slice(prefix.length);
    } else if (request.cookies) {
      token = request.cookies['accessToken'];
    }

    if (!token) {
      throw new UnauthorizedException('未登录');
    }

    let payload: any;
    try {
      payload = JWTVerify(token);
    } catch (err) {
      throw new UnauthorizedException('未登录');
    }
    const user = await this.authService.validateJwt(payload);
    if (!user) {
      throw new UnauthorizedException('未登录');
    }
    (<any>request).user = user;
    (<any>user).payload = payload.payload;

    return true;
  }

  // verify(token: string): JWT.completeResult {
  //   const decryptKey = this.authService.config.decrypt.key;
  //   if (decryptKey) {
  //     token = JWE.decrypt(
  //       token,
  //       decryptKey,
  //       this.authService.config.decrypt.options,
  //     ).toString();
  //   }

  //   const options: JWT.VerifyOptions<true> = {
  //     ...this.authService.config.verify.options,
  //     complete: true,
  //   };
  //   return JWT.verify(token, this.authService.config.verify.key, options);
  // }
}
