import { ApiProperty, PickType } from '@nestjs/swagger';
import {
  ValidateNested,
  MinLength,
  IsObject,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Device } from '../entities';
import { Type } from 'class-transformer';
import { NewDevice } from '../devices';

export class AuthBase {
  @ApiProperty({ description: '设备' })
  @ValidateNested()
  @IsObject()
  device: NewDevice;
}

export class AuthLogin extends AuthBase {
  @ApiProperty({
    description: '登录手机号',
    example: '15000000000',
  })
  @MinLength(11, {
    message: '手机号位数不够',
  })
  mobile: string;

  @ApiProperty({ description: '登录密码', example: '111111' })
  @MinLength(6, {
    message: '密码位数不够',
  })
  password: string;
}
export class AuthRegister extends AuthBase {
  @ApiProperty({
    description: '登录手机号',
    example: '15000000000',
  })
  @MinLength(11, {
    message: '手机号位数不够',
  })
  mobile: string;

  @ApiProperty({ description: '用户名', example: '小军' })
  @IsNotEmpty({ message: '用户名不能为空' })
  nickName: string;

  @ApiProperty({ description: '登录密码', example: '111111' })
  @MinLength(6, {
    message: '密码位数不够',
  })
  password: string;
}

export class AuthToken extends AuthBase {
  @ApiProperty({ description: '验证令牌' })
  @IsNotEmpty()
  @IsString()
  authToken: string;
}

export class AuthSendCode extends PickType(AuthLogin, ['mobile']) {}

export class AuthVerifyCode extends PickType(AuthLogin, ['device', 'mobile']) {
  @ApiProperty({ description: '验证码' })
  @IsNotEmpty()
  @IsString()
  code: string;
}
