/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-11-03 10:29:18
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 10:57:09
 */
import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
