import { Column, Entity, Unique } from 'typeorm';
import { Base } from './base/base.entity';
import { IsUUID, IsEnum } from 'class-validator';
import { ServiceName, ClientAppType, ClientApp } from '../enums';
import { UniqueWithFailedMessage } from '@app/core';
import { ColumnWithApi } from '@app/core';
import { ApiHideProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Entity()
@UniqueWithFailedMessage(
  'uq_wx_account_appid_openid',
  ['appid', 'openid'],
  'openid不能重复',
)
export class WxAccount extends Base {
  @ApiHideProperty()
  @Column({ type: 'varchar', length: 50, comment: '认证服务名称' })
  @IsEnum(ServiceName)
  service: ServiceName;

  @Column({ comment: '认证服务用户ID', nullable: true })
  authId: number;

  @Column({ length: 100 })
  openid: string;

  @Column({ length: 100, nullable: true })
  unionid: string;

  @Column({ length: 30, nullable: true })
  mobile: string;

  @Column({ length: 30, comment: 'app id' })
  appid: string;

  @Column({ type: 'varchar', length: 50, comment: '客户端app别名' })
  @IsEnum(ClientApp)
  app: ClientApp;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    comment: '客户端app类型',
  })
  @IsEnum(ClientAppType)
  appType: ClientAppType;

  @Column({ length: 36, comment: '当前设备ID', nullable: true })
  @IsUUID()
  udid: string;

  @Column({ default: false, comment: '是否关注公众号' })
  subscribe?: boolean;

  @Column({ default: false, comment: '是否授权过用户信息' })
  hasRegist?: boolean;

  @ColumnWithApi({ nullable: true })
  nickName?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ default: 0, comment: '性别 {0：未知、1：男、2：女}' })
  gender?: number;

  @Column({ nullable: true })
  language?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  province?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  groupid?: number;

  @Column({ nullable: true })
  remark?: string;

  @Column({ nullable: true })
  sessionKey?: string;

  @Column({ nullable: true })
  subscribedAt?: Date;

  @Column({
    update: false,
    nullable: true,
    type: 'text',
    comment: '小程序首次访问路径，公众号扫码scene',
  })
  firstFrom?: string;

  @Column({
    nullable: true,
    type: 'text',
    comment: '当前访问路径',
  })
  from?: string;

  @Column({
    nullable: true,
    update: false,
    comment: '来源场景',
  })
  @Expose({ groups: ['operator'] })
  sourceScene?: string;

  @Column({
    nullable: true,
    update: false,
    comment: '来源类型',
  })
  @Expose({ groups: ['operator'] })
  sourceType?: string;
  @Column({
    nullable: true,
    update: false,
    comment: '来源Id',
  })
  @Expose({ groups: ['operator'] })
  sourceId?: number;
  @Column({
    nullable: true,
    update: false,
    comment: '来源推广员Id',
  })
  @Expose({ groups: ['operator'] })
  sourceOperatorId?: number;
  @Column({
    nullable: true,
    update: false,
    comment: '来源用户Id',
  })
  @Expose({ groups: ['operator'] })
  sourceUserId?: number;
}
