/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-07-30 10:40:49
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 12:07:52
 */
import { requireEnv } from '@app/core';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { pick } from 'lodash';
import { Wechat, WxWork } from 'wechat-next';
import { ClientApp, ClientAppType } from '../enums';
// import { Cache } from 'cache-manager';

export interface WxAppConfig {
  appid: string;
  secret: string;
  appType: ClientAppType;
  receiverToken?: string;
  receiverAesKey?: string;
}

export type WxConfig = {
  apps: {
    [key in ClientApp]?: WxAppConfig;
  };
};

const wxConfigs: WxConfig = {
  apps: {
    [ClientApp.JJ_WXAPP]: {
      appid: requireEnv('WXAPP_APPID'),
      secret: requireEnv('WXAPP_SECRET'),
      appType: ClientAppType.WXAPP,
    },
    // [ClientApp.FF_WXMP]: {
    //   appid: requireEnv('FF_WXMP_APPID'),
    //   secret: requireEnv('FF_WXMP_SECRET'),
    //   appType: ClientAppType.WXMP,
    //   receiverToken: requireEnv('FF_WXMP_REVEIVER_TOKEN'),
    //   receiverAesKey: env('FF_WXMP_REVEIVER_AES_KEY'),
    // },
  },
};

@Injectable()
export class WxApiService {
  private apis: any;
  constructor() {
    this.apis = {};
  }
  getConfig(app: ClientApp) {
    return wxConfigs.apps[app];
  }

  getApi(app: ClientApp): Wechat {
    const conf = this.getConfig(app);
    if (!this.apis[app]) {
      const key = 'wechat_access_token:' + app;
      this.apis[app] = new Wechat(pick(conf, ['appid', 'secret']));
      //保存js ticket
      // const ticket = 'wechat_jsticket:' + appid + ':';
      // this.apis[appid].registerTicketHandle(
      //   (type) => {
      //     return store.get(ticket + type);
      //   },
      //   (type, token) => {
      //     return store.set(ticket + type, token);
      //   },
      // );
    }
    return this.apis[app];
  }

  getWorkApi(app = ClientApp.JJ_WXWORK_CUSTOMER): WxWork {
    const conf = this.getConfig(app);
    if (!this.apis[app]) {
      const key = 'wechat_access_token:' + app;
      this.apis[app] = new WxWork({
        corpid: conf.appid,
        corpsecret: conf.secret,
      });
    }
    return this.apis[app];
  }
}
