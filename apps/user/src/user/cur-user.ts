import { CurUser } from './user.dto';
import { User } from '@app/shared/entities';

export function getCurUser(user: User): CurUser {
  return new CurUser(user);
}
