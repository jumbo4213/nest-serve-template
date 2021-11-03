import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import { ApiHideProperty } from '@nestjs/swagger';
import * as moment from 'moment-timezone';

export abstract class IdBase {
  @PrimaryGeneratedColumn()
  id: number;
}

export abstract class Base extends IdBase {
  @ApiHideProperty()
  @CreateDateColumn()
  createdAt?: Date;

  @ApiHideProperty()
  @UpdateDateColumn()
  updatedAt?: Date;

  @ApiHideProperty()
  @VersionColumn({ select: false })
  updateVersion?: number;

  @Column({ type: 'date', nullable: true, comment: '创建日期' })
  createdDate?: string;

  @BeforeInsert()
  addCreatedDate(): void {
    this.createdDate = moment()
      .tz('Asia/Shanghai')
      .format('YYYY-MM-DD');
  }
}
