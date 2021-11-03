import { CrudService } from '@app/core';
import { Repository } from 'typeorm';
import { Auth } from '../entities/base/auth.entity';
import {
  BadRequestException,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthLogin, AuthToken, AuthRegister } from './auth.dto';
import { JWT, JWE, JWK } from 'jose';
import { Inject, LiteralObject } from '@nestjs/common';
import { ServiceName, ClientAppType } from '../enums';
import { SessionsService } from '../sessions';
import { Session, WxAccount } from '../entities';
import { AUTH_CONFIG } from './constants';
import { AuthConfig } from './interfaces';
import { requireEnv } from '@app/core';
import { DevicesService, NewDevice } from '../devices';
import { AuthWxapp, WxAccountsService } from '../wx-accounts';

export enum AuthType {
  PASSWORD = 'password',
  TOKEN = 'token',
  WXAPP = 'wxapp',
  VERIFY_CODE = 'code',
}

export interface AuthSession<T> {
  authType: AuthType;
  accessToken: string;
  authToken?: string;
  user: T;
  wxAccount?: WxAccount;
}

export interface AccessPayload {
  id: any;
  service: ServiceName;
  app: ClientAppType;
  wxId?: any;
}

const signKey = JWK.asKey(requireEnv('AUTH_SIGN'));
const encryptKey = JWK.asKey(requireEnv('AUTH_ENCRYPT'));

const config: AuthConfig = {
  sign: {
    key: signKey,
    options: {
      expiresIn: requireEnv('AUTH_EXPIRES_IN'),
    },
  },
  verify: {
    key: signKey,
  },
  encrypt: {
    key: encryptKey,
  },
  decrypt: {
    key: encryptKey,
  },
};

export function JWTVerify(token: string): JWT.completeResult {
  const decryptKey = config.decrypt.key;
  if (decryptKey) {
    try {
      token = JWE.decrypt(token, decryptKey, config.decrypt.options).toString();
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
  const options: JWT.VerifyOptions<true> = {
    ...config.verify.options,
    complete: true,
  };
  try {
    return JWT.verify(token, config.verify.key, options);
  } catch (err) {
    throw new UnauthorizedException();
  }
}

export abstract class AuthService<T extends Auth> extends CrudService<T> {
  public readonly config: AuthConfig;
  @Inject(SessionsService)
  public readonly sessionsSerivce: SessionsService;

  @Inject(DevicesService)
  public readonly devicesService: DevicesService;

  @Optional()
  @Inject(WxAccountsService)
  public readonly wxAccountsService?: WxAccountsService;

  constructor(protected readonly repo: Repository<T>) {
    super(repo);
    this.config = config;
  }

  abstract getServiceName(): ServiceName;

  /**
   * 需要获取用户信息通过次方法查找
   */

  abstract getUserByMobile(mobile: string): Promise<T>;
  abstract getUserByOpenid(openid: string): Promise<T>;

  abstract getUserById(id: number): Promise<T>;

  async validateLocal(mobile: string, password: string): Promise<T> {
    const user = await this.getUserByMobile(mobile);
    if (user && (await user.comparePassword(password))) {
      return user;
    }
    throw new BadRequestException('手机号或密码错误');
  }

  async validateJwt(
    data: JWT.completeResult & { payload: AccessPayload },
  ): Promise<T> {
    if (!data || !data.payload || !data.payload.id) {
      throw new UnauthorizedException('未登录');
    }
    const payload = data.payload;
    if (payload.service != this.getServiceName()) {
      throw new UnauthorizedException('未登录');
    }
    const user = await this.getUserById(payload.id);
    if (user) {
      return user;
    }
    throw new UnauthorizedException('未登录');
  }

  async validateToken(token: string): Promise<T> {
    const session = await this.sessionsSerivce.validateAndRevoke(token);
    const user: T = await this.getUserById(session.authId);
    return user;
  }

  jwtSign(payload: LiteralObject): string {
    let data = JWT.sign(
      payload,
      this.config.sign.key,
      this.config.sign.options,
    );
    const encryptKey = this.config.encrypt.key;
    if (encryptKey) {
      data = JWE.encrypt(data, encryptKey, this.config.encrypt.options);
    }
    return data;
  }
  async register(data: AuthRegister, ip: string): Promise<AuthSession<T>> {
    const user = await this.getUserByMobile(data.mobile);
    if (user) {
      throw new UnauthorizedException('用户已存在');
    }
    const newUser = await this.generateUser(
      {
        mobile: data.mobile,
        name: data.nickName,
        password: data.password,
      } as T,
      data,
    );
    const session = await this.sessionsSerivce.generate(
      data.device,
      this.getServiceName(),
      newUser.id,
      ip,
    );
    return this.buildAuthSession(
      AuthType.PASSWORD,
      newUser,
      data.device,
      session,
    );
  }

  async authPassword(data: AuthLogin, ip: string): Promise<AuthSession<T>> {
    const user = await this.validateLocal(data.mobile, data.password);
    const session = await this.sessionsSerivce.generate(
      data.device,
      this.getServiceName(),
      user.id,
      ip,
    );
    return this.buildAuthSession(AuthType.PASSWORD, user, data.device, session);
  }

  async authToken(data: AuthToken, ip: string): Promise<AuthSession<T>> {
    const user = await this.validateToken(data.authToken);
    const session = await this.sessionsSerivce.generate(
      data.device,
      this.getServiceName(),
      user.id,
      ip,
    );
    return this.buildAuthSession(AuthType.TOKEN, user, data.device, session);
  }

  async generateUser(info: T, source?: any): Promise<T> {
    const user = await this.save(info as T);
    return await this.getUserById(user.id);
  }

  /**
   * 会根据手机号自动创建/绑定用户
   */
  async validateWxapp(account: WxAccount): Promise<T> {
    let user: T;
    if (account.authId) {
      user = await this.getUserById(account.authId);
      if (user) {
        // 删除 user 表中数据后 没有 user
        return user;
      }
    }
    if (account.openid && account.hasRegist) {
      let user = await this.getUserByOpenid(account.openid);
      if (!user) {
        // 自动创建用户
        user = await this.generateUser(
          {
            mobile: account.mobile,
            name: account.nickName,
            avatarUrl: account.avatarUrl,
            wxOpenid: account.openid,
          } as T,
          account,
        );
      }
      await this.wxAccountsService.updateAuthId(account, user.id);
      return user;
    }
    //TODO: check unionid
    throw new UnauthorizedException('未登录');
  }

  async authWxapp(data: AuthWxapp, ip: string): Promise<AuthSession<T>> {
    const account = await this.wxAccountsService.updateWxappAccount(
      this.getServiceName(),
      data,
    );
    const user = await this.validateWxapp(account);
    await this.sessionsSerivce.generate(
      data.device,
      this.getServiceName(),
      user.id,
      ip,
    );
    return this.buildAuthSession(
      AuthType.TOKEN,
      user,
      data.device,
      null, //不需要session，直接用wx.login code验证
      account,
    );
  }

  async buildAuthSession(
    authType: AuthType,
    user: T,
    device: NewDevice,
    session?: Session,
    wxAccount?: WxAccount,
  ): Promise<AuthSession<T>> {
    // 更新设备信息
    await this.devicesService.updateDevice(
      device,
      this.getServiceName(),
      null,
      user.id,
    );
    // 保存最近设备信息到 user
    const userObj: Partial<T> = {};
    if (device.udid) {
      if (device.udid != user.udid) {
        userObj.udid = device.udid;
      }
    }
    if (Object.keys(userObj).length) {
      Object.assign(user, userObj);
      await this.save(user);
    }

    const payload: AccessPayload = {
      id: user.id,
      service: this.getServiceName(),
      app: device.appType,
    };
    (user as any).payload = payload;
    return {
      authType,
      accessToken: this.jwtSign(payload),
      user: user,
      authToken: session?.token,
    };
  }

  // async authSendCode(data: AuthSendCode): Promise<any> {
  //   return await this.verificationCodeService.sendCode(data);
  // }

  // async authVerifyCode(
  //   data: AuthVerifyCode,
  //   ip: string,
  // ): Promise<AuthSession<T>> {
  //   const { mobile } = data;
  //   await this.verificationCodeService.verifyCode(data);
  //   if (data.wxapp) {
  //     //如果有小程序账号信息，写入手机号，走小程序逻辑。
  //     data.wxapp.mobile = mobile;
  //     return this.authWxapp(data.wxapp, ip);
  //   }
  //   let user = await this.getUserByMobile(mobile);
  //   if (!user) {
  //     // 自动创建用户
  //     user = await this.generateUser({
  //       mobile,
  //     } as T);
  //   }
  //   const session = await this.sessionsSerivce.generate(
  //     data.device,
  //     this.getServiceName(),
  //     user.id,
  //     ip,
  //   );
  //   return this.buildAuthSession(
  //     AuthType.VERIFY_CODE,
  //     user,
  //     data.device,
  //     session,
  //   );
  // }
}
