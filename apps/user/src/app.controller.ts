import { Public } from '@app/shared/auth';
import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: '获取二维码图片' })
  @Get()
  @Public()
  getHello(): string {
    return this.appService.getHello();
  }
}
