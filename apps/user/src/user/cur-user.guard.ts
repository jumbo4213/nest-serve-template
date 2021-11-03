import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { getCurUser } from './cur-user';

@Injectable()
export class CurUserGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (user) {
      request.user = getCurUser(user);
    }
    return true;
  }
}
