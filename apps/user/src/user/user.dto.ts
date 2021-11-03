import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
  PickType,
} from '@nestjs/swagger';
import { User } from '@app/shared/entities';
import { ApiOne, ApiMany, ApiQuery } from '@app/core';
import { IsOptional, IsNumberString } from 'class-validator';
import { AuthSession, AuthType, AccessPayload } from '@app/shared/auth';
import { Type } from 'class-transformer';

// 由于某些属性随时需要在列表中添加，请用 PickType 选择属性，以免列表属性被自动添加到新增。
export class NewUser {
  latitude?: number;
  longitude?: number;
  province?: string;
  city?: string;
  district?: string;
  name?: string;
  avatarUrl?: string;
}

export class CurUser extends User {
  constructor(user: User) {
    super();
    Object.assign(this, user);
  }
  @ApiHideProperty()
  payload: AccessPayload;
}

export class UserSession implements AuthSession<CurUser> {
  authType: AuthType;

  @ApiProperty({ description: '访问令牌' })
  accessToken: string;
  @ApiPropertyOptional({
    description: '验证令牌，微信小程序等第三方登录方式没有authToken',
  })
  authToken?: string;

  @ApiProperty({ description: '当前用户信息' })
  @Type(() => CurUser)
  user: CurUser;

  @ApiProperty({ description: '服务器时间' })
  serverTime: number;
}

export class UserProfile extends PickType(UserSession, [
  'user',
  'serverTime',
]) {}

export class UserQuery extends ApiQuery {
  @IsOptional()
  @IsNumberString()
  page?: number;
}

export class UserOptions {}

export class ManyUser extends ApiMany(User, UserOptions, UserQuery) {}
export class OneUser extends ApiOne(User) {}
