import { Base } from './base.entity';
import { Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsString, MinLength } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { ColumnWithApi } from '@app/core';

const RE_BCRYPT_HASH = /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/;

export abstract class Auth extends Base {
  @ColumnWithApi({ length: 60, nullable: true, comment: '名字' })
  name?: string;

  @MinLength(11, {
    message: '手机号位数不够',
  })
  @IsString()
  @ColumnWithApi({ length: 30, comment: '手机号' }, { example: '15000000000' })
  @Column({ nullable: true })
  mobile: string;

  @ApiHideProperty()
  @Column({ nullable: true })
  password?: string;

  @ColumnWithApi({ nullable: true, comment: '头像' })
  avatarUrl?: string;

  @ApiHideProperty()
  @Column({ length: 36, comment: '最近登录的设备ID', nullable: true })
  udid?: string;

  @ApiHideProperty()
  @Column({ nullable: true })
  wxUnionid?: string;

  @ApiHideProperty()
  @Column({ nullable: true })
  wxOpenid?: string;

  // @ApiHideProperty()
  // @Column({ length: 36, comment: '能接收个推通知的设备ID', nullable: true })
  // gtUdid?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.match(RE_BCRYPT_HASH)) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return await bcrypt.compare(attempt, this.password);
  }
}
