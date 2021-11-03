import { AuthBase } from '../auth/auth.dto';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  ValidateNested,
  IsObject,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class WxappEncryptedInfo {
  iv: string;

  @IsNotEmpty({ message: '加密数据不能为空' })
  encryptedData: string;
}

export class AuthWxapp extends AuthBase {
  @ApiProperty({ description: 'wx.login code' })
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ description: '用户信息(加密)' })
  @ValidateNested()
  @Type(() => WxappEncryptedInfo)
  @IsObject()
  @IsOptional()
  accountInfo?: WxappEncryptedInfo;

  @ApiPropertyOptional({ description: '手机号信息(加密)' })
  @ValidateNested()
  @Type(() => WxappEncryptedInfo)
  @IsObject()
  @IsOptional()
  mobileInfo?: WxappEncryptedInfo;

  @ApiPropertyOptional({ description: 'from' })
  from?: string;

  // 直接绑定手机号
  @ApiHideProperty()
  mobile?: string;
}
