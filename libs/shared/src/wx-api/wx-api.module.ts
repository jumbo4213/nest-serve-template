import { Module } from '@nestjs/common';
import { WxApiService } from './wx-api.service';

@Module({
  providers: [WxApiService],
  exports: [WxApiService],
})
export class WxApiModule {}
