import { Column, Entity, Unique, BeforeInsert } from 'typeorm';
import { Base } from './base/base.entity';
import { v1, v4 } from 'uuid';
import { IsUUID, IsEnum } from 'class-validator';
import { ServiceName, ClientApp } from '../enums';
import { UniqueWithFailedMessage } from '@app/core';
import { ColumnWithApi } from '@app/core';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity()
@UniqueWithFailedMessage('uq_session_token', ['token'], 'token不能重复')
export class Session extends Base {
  @ColumnWithApi({ length: 36, nullable: true, comment: '设备ID' })
  @IsUUID()
  udid: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 50, comment: '后台服务名称' })
  @IsEnum(ServiceName)
  service: ServiceName;

  @ApiHideProperty()
  @Column({ comment: '认证服务用户ID' })
  authId: number;

  @ColumnWithApi({ type: 'varchar', length: 50, comment: '客户端app别名' })
  @IsEnum(ClientApp)
  app: ClientApp;

  @ColumnWithApi({ length: 100, comment: '存在客户端的校验token' })
  token: string;

  @ColumnWithApi({ comment: '过期时间', nullable: true })
  expiredAt: Date;

  @ColumnWithApi({ length: 20, nullable: true, comment: '当前app版本' })
  version: string;

  @ColumnWithApi({ length: 20, nullable: true, comment: '当前打包版本' })
  packageVersion: string;

  @ApiHideProperty()
  @Column({ length: 40, nullable: true, comment: '当前设备登录ip' })
  ip: string;

  @ColumnWithApi({ type: 'text', nullable: true, comment: '当前来源数据' })
  from: string;

  @ApiHideProperty()
  @Column({
    type: 'numeric',
    nullable: true,
    comment: '纬度',
    precision: 12,
    scale: 8,
  })
  latitude: number;

  @ApiHideProperty()
  @Column({
    type: 'numeric',
    nullable: true,
    comment: '经度',
    precision: 12,
    scale: 8,
  })
  longitude: number;

  @BeforeInsert()
  generateToken(): void {
    this.token = (v1() + v4()).replace(/-/g, '');
  }
}
