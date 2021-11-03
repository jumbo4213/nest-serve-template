import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CrudService } from '@app/core';
import { WxAccount } from '../entities';
import { WechatOauth } from 'wechat-next';
import { ClientApp, ServiceName } from '../enums';
import { AuthWxapp } from './wx-accounts.dto';
import { WxApiService } from '../wx-api';
import { parseSource } from '../common/parse-source';

@Injectable()
export class WxAccountsService extends CrudService<WxAccount> {
  constructor(
    @InjectRepository(WxAccount)
    repo: Repository<WxAccount>,
    protected readonly wxApi: WxApiService,
  ) {
    super(repo);
  }

  async updateWxmpAccount(
    service: ServiceName,
    app: ClientApp,
    openid: string,
    forceUpdate: boolean,
    from: string,
  ): Promise<WxAccount> {
    const conf = this.wxApi.getConfig(app);
    const oldAccount = await this.findOne({
      where: {
        appid: conf.appid,
        openid: openid,
      },
    });
    if (!oldAccount || forceUpdate) {
      const api = this.wxApi.getApi(app);
      const info = await api.get('cgi-bin/user/info', {
        openid,
        lang: 'zh_CN',
      });
      let account = new WxAccount();
      account.app = app;
      account.service = service;
      account.appid = conf.appid;
      account.appType = conf.appType;
      account.openid = openid;
      account.subscribe = !!info.subscribe;
      if (info.unionid) account.unionid = info.unionid;
      if (info.subscribe) {
        account.nickName = info.nickname;
        account.gender = info.sex;
        account.language = info.language;
        account.city = info.city;
        account.province = info.province;
        account.country = info.country;
        account.avatarUrl = info.headimgurl;
        account.groupid = info.groupid;
        account.subscribedAt = new Date(info.subscribe_time * 1000);
        account.remark = info.remark;
      }
      if (oldAccount) {
        account = this.repo.merge(oldAccount, account);
      }
      if (from) {
        account.from = String(from);
        if (!oldAccount) {
          account.firstFrom = String(from); //数据库不会更新
          const source = await parseSource(String(from), this.repo.manager);
          account.sourceType = source.type;
          account.sourceId = source.id;
          account.sourceUserId = source.userId;
        }
      }
      return await this.save(account);
    }
    return oldAccount;
  }

  async updateAuthId(account: WxAccount, authId: number): Promise<WxAccount> {
    if (account.authId != authId) {
      account.authId = authId;
      await this.repo.update(account.id, {
        authId,
      });
    }
    return account;
  }
  /**
   * 更新小程序账号信息
   *
   */
  async updateWxappAccount(
    service: ServiceName,
    data: AuthWxapp,
  ): Promise<WxAccount> {
    const { code, device, from, accountInfo, mobileInfo, mobile } = data;
    const app = device.app;
    const conf = this.wxApi.getConfig(app);
    const oauth = new WechatOauth(conf);

    let res: any;
    try {
      res = await oauth.code2Session(code);
    } catch (err) {
      console.log(err);
      throw new BadRequestException('code无效', 'Invalid');
    }
    let account = new WxAccount();
    account.app = app;
    account.service = service;
    account.appid = conf.appid;
    account.udid = device.udid;
    account.appType = conf.appType;
    account.sessionKey = res.session_key;
    account.openid = res.openid;
    if (res.unionid) account.unionid = res.unionid;

    const oldAccount = await this.findOne({
      where: {
        appid: account.appid,
        openid: account.openid,
      },
    });

    if (accountInfo) {
      let info: any;
      try {
        info = oauth.decryptData(
          accountInfo.encryptedData,
          res.session_key,
          accountInfo.iv,
        );
      } catch (err) {
        throw new BadRequestException('无效的用户数据', 'Invalid');
      }
      account.hasRegist = true;
      if (info.unionId) account.unionid = info.unionId;
      account.nickName = info.nickName;
      account.gender = info.gender;
      account.language = info.language;
      account.city = info.city;
      account.province = info.province;
      account.country = info.country;
      account.avatarUrl = info.avatarUrl;
    } else if (account.unionid && (!oldAccount || !oldAccount.nickName)) {
      // 没有用户资料，查询其他账号有没有
      const otherAccount = await this.findOne({
        where: {
          nickName: Not(IsNull()),
          unionid: account.unionid,
        },
      });
      if (otherAccount) {
        account.nickName = otherAccount.nickName;
        account.gender = otherAccount.gender;
        account.language = otherAccount.language;
        account.city = otherAccount.city;
        account.province = otherAccount.province;
        account.country = otherAccount.country;
        account.avatarUrl = otherAccount.avatarUrl;
      }
    }

    if (mobileInfo) {
      let info: any;
      try {
        info = oauth.decryptData(
          mobileInfo.encryptedData,
          res.session_key,
          mobileInfo.iv,
        );
      } catch (err) {
        throw new BadRequestException('无效的手机号数据', 'Invalid');
      }
      account.mobile = info.phoneNumber;
    }

    // 通过短信验证码绑定手机号
    if (mobile) {
      account.mobile = mobile;
    }

    if (oldAccount) {
      account = this.repo.merge(oldAccount, account);
    }
    if (from) {
      account.from = String(from);
      if (!oldAccount) {
        account.firstFrom = String(from); //数据库不会更新
        const source = await parseSource(
          String(from),
          this.repo.manager,
          account.unionid, //默认根据公众号判断来源
        );
        account.sourceType = source.type;
        account.sourceId = source.id;
        account.sourceUserId = source.userId;
        account.sourceScene = source.scene;
      }
    }
    return await this.save(account);
  }
}
