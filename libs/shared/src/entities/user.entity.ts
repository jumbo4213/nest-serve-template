import { Column, Entity } from 'typeorm';
import { Auth } from './base/auth.entity';
import { ColumnWithApi, UniqueWithFailedMessage } from '@app/core';

@Entity()
@UniqueWithFailedMessage('uq_user_mobile', ['mobile'], '用户已存在')
export class User extends Auth {
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

  @ColumnWithApi({ nullable: true, comment: '位置省份' })
  province?: string;
  @ColumnWithApi({ nullable: true, comment: '位置城市' })
  city?: string;
  @ColumnWithApi({ nullable: true, comment: '位置区县' })
  district?: string;

  @ColumnWithApi({
    type: 'numeric',
    nullable: true,
    comment: '首次纬度',
    precision: 12,
    scale: 8,
  })
  firstLatitude?: number;

  @ColumnWithApi({
    type: 'numeric',
    nullable: true,
    comment: '首次经度',
    precision: 12,
    scale: 8,
  })
  firstLongitude?: number;

  @ColumnWithApi({ nullable: true, comment: '首次位置省份' })
  firstProvince?: string;

  @ColumnWithApi({ nullable: true, comment: '首次位置城市' })
  firstCity?: string;

  @ColumnWithApi({ nullable: true, comment: '首次位置区县' })
  firstDistrict?: string;

  @Column({
    nullable: true,
    update: false,
    comment: '来源类型',
  })
  sourceType?: string;

  @Column({
    nullable: true,
    update: false,
    comment: '来源Id',
  })
  sourceId?: number;

  @Column({
    nullable: true,
    update: false,
    comment: '来源推广员Id',
  })
  sourceOperatorId?: number;

  @Column({
    nullable: true,
    update: false,
    comment: '来源用户Id',
  })
  sourceUserId?: number;
}
