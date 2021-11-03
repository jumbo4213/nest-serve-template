import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  Ip,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  Public,
  CurrentUser,
  AuthLogin,
  AuthSession,
  AuthToken,
  AccessTokenHeaderInterceptor,
  AuthRegister,
} from '@app/shared/auth';
import { UserSession, CurUser, UserProfile } from './user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { DevicesService, NewDevice } from '@app/shared/devices';
import { User } from '@app/shared/entities';
import { getCurUser } from './cur-user';
import { AuthWxapp } from '@app/shared/wx-accounts';

@Controller()
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly service: UserService,
    protected readonly deviceService: DevicesService,
  ) {}

  @Post('devices')
  @Public()
  @Post()
  @ApiOperation({ summary: '保存设备信息' })
  async saveDevice(@Body() device: NewDevice, @Ip() ip: string): Promise<any> {
    //更新用户每次登陆的设备信息
    await this.deviceService.updateDevice(
      device,
      this.service.getServiceName(),
      ip,
    );
  }

  @Post('auth/register')
  @Public()
  @UseInterceptors(AccessTokenHeaderInterceptor)
  async register(
    @Body() registerDto: AuthRegister,
    @Ip() ip: string,
  ): Promise<UserSession> {
    const data = await this.service.register(registerDto, ip);
    return this.createSession(data);
  }

  @Post('auth/login')
  @Public()
  @UseInterceptors(AccessTokenHeaderInterceptor)
  async login(
    @Body() loginDto: AuthLogin,
    @Ip() ip: string,
  ): Promise<UserSession> {
    const data = await this.service.authPassword(loginDto, ip);
    return this.createSession(data);
  }

  @Post('auth/token')
  @Public()
  @UseInterceptors(AccessTokenHeaderInterceptor)
  @ApiUnauthorizedResponse({
    description: 'token无效或者过期，需重新登录',
  })
  async authToken(
    @Body() accessTokenDto: AuthToken,
    @Ip() ip: string,
  ): Promise<UserSession> {
    const data = await this.service.authToken(accessTokenDto, ip);
    return this.createSession(data);
  }

  @Post('auth/wxapp')
  @Public()
  @UseInterceptors(AccessTokenHeaderInterceptor)
  @ApiUnauthorizedResponse({ description: '新用户，需要授权用户信息' })
  async authWxapp(
    @Body() authWxapp: AuthWxapp,
    @Ip() ip: string,
  ): Promise<UserSession> {
    const data = await this.service.authWxapp(authWxapp, ip);
    return this.createSession(data);
  }

  protected async createSession(
    authSession: AuthSession<User>,
  ): Promise<UserSession> {
    const dto = new UserSession();
    dto.accessToken = authSession.accessToken;
    dto.authToken = authSession.authToken;
    dto.user = getCurUser(authSession.user);
    dto.serverTime = Date.now();
    return dto;
  }

  @Get('profile')
  async getProfile(@CurrentUser() curUser: CurUser): Promise<UserProfile> {
    const dto = new UserProfile();
    dto.user = curUser;
    dto.serverTime = Date.now();
    return dto;
  }

  // @Post('auth/sendCode')
  // @Public()
  // @ApiOperation({ summary: '发送验证码' })
  // async sendCode(@Body() mobileDto: AuthSendCode): Promise<void> {
  //   await this.service.authSendCode(mobileDto);
  // }

  // @Post('auth/verifyCode')
  // @Public()
  // @ApiOperation({ summary: '验证码登录' })
  // @UseInterceptors(AccessTokenHeaderInterceptor)
  // async authCode(
  //   @Body() mobileDto: AuthVerifyCode,
  //   @Ip() ip: string,
  // ): Promise<UserSession> {
  //   const data = await this.service.authVerifyCode(mobileDto, ip);
  //   return this.createSession(data);
  // }
}
