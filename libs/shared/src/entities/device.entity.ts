import { Column, Entity } from 'typeorm';
import { Base } from './base/base.entity';
import { IsUUID, IsEnum } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { UniqueWithFailedMessage } from '@app/core';
import { ColumnWithApi } from '@app/core';

import {
  ServiceName,
  ClientApp,
  DevicePlatform,
  ClientAppType,
} from '../enums';

@Entity()
@UniqueWithFailedMessage('uq_device_udid', ['udid'], '设备ID不能重复')
export class Device extends Base {
  @IsUUID()
  @ColumnWithApi(
    { length: 36, comment: '设备ID' },
    { example: 'C3A036DA-6F83-436E-8FE8-9BC7A5B1BA39' },
  )
  udid: string;

  @ApiHideProperty()
  @Column({ type: 'varchar', length: 50, comment: '认证服务名称' })
  //@IsEnum(ClientApp) set by service
  service: ServiceName;

  @Column({ comment: '认证服务用户ID', nullable: true })
  authId: number;

  @ColumnWithApi({ type: 'varchar', length: 50, comment: '客户端app别名' })
  @IsEnum(ClientApp)
  app: ClientApp;

  @Column({ comment: '认证时间', nullable: true })
  @ApiHideProperty()
  authedAt?: Date;

  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '客户端平台',
  })
  platform: DevicePlatform;

  @ColumnWithApi({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '客户端app类型',
  })
  @IsEnum(ClientAppType)
  appType: ClientAppType;

  @ColumnWithApi({ length: 50, nullable: true, comment: '手机品牌' })
  brand?: string;

  @ColumnWithApi({ length: 50, nullable: true, comment: '手机型号' })
  model?: string;

  @ColumnWithApi({
    precision: 4,
    scale: 2,
    type: 'numeric',
    nullable: true,
    comment: '设备像素比',
  })
  pixelRatio?: number;

  @ColumnWithApi({ nullable: true, comment: '屏幕宽度' })
  screenWidth?: number;

  @ColumnWithApi({ nullable: true, comment: '屏幕高度' })
  screenHeight?: number;

  @ColumnWithApi({ length: 50, nullable: true, comment: '语言' })
  language?: string;

  @ColumnWithApi({ length: 50, nullable: true, comment: '操作系统及版本' })
  system?: string;

  @ColumnWithApi({ length: 100, nullable: true, comment: '小米通知token' })
  xmpushToken?: string;

  @ColumnWithApi({ length: 100, nullable: true, comment: '个推通知token' })
  gtpushToken?: string;

  @ApiHideProperty()
  @Column({ length: 100, nullable: true, comment: '通知token' })
  notificationToken?: string;

  @ApiHideProperty()
  @Column({ length: 100, nullable: true })
  idfa?: string;

  @ColumnWithApi({ length: 20, nullable: true, comment: '当前app版本' })
  version?: string;

  @ColumnWithApi({ length: 20, nullable: true, comment: '当前打包版本' })
  packageVersion?: string;

  @ApiHideProperty()
  @Column({ length: 40, nullable: true, comment: '当前设备登录ip' })
  ip?: string;

  @ColumnWithApi({ type: 'text', nullable: true, comment: '当前来源数据' })
  from?: string;

  @ColumnWithApi({
    type: 'numeric',
    nullable: true,
    comment: '纬度',
    precision: 12,
    scale: 8,
  })
  latitude?: number;

  @ColumnWithApi({
    type: 'numeric',
    nullable: true,
    comment: '经度',
    precision: 12,
    scale: 8,
  })
  longitude?: number;
}
