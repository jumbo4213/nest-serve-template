/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-07-13 17:20:57
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 11:17:02
 */
import { createTypeOrmDynamicModule } from '@app/shared';
import { LoggerModule } from '@app/shared/logger';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';

@Module({
  imports: [createTypeOrmDynamicModule(), UserModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
