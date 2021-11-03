import { Module } from '@nestjs/common';
import { WxAccountsService } from './wx-accounts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WxAccount } from '../entities';
import { WxApiModule } from '../wx-api';

@Module({
  imports: [TypeOrmModule.forFeature([WxAccount]), WxApiModule],
  providers: [WxAccountsService],
  exports: [WxAccountsService],
})
export class WxAccountsModule {}
