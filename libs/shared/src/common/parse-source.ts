import { requireEnv } from '@app/core';
import { EntityManager } from 'typeorm';
import { WxAccount } from '../entities';
import { ClientAppType } from '../enums';

export interface ISource {
  type: 'unknown' | 'invitation';
  id?: number;
  userId?: number;
  scene?: string;
}

/**
 * 解析用户来源
 * @param data
 * @param manager
 * @param unionid 小程序没有来源则继承当天公众号的来源
 */

export async function parseSource(
  data: string,
  manager: EntityManager,
  unionid?: string,
): Promise<ISource> {
  data = data || '';
  const source: ISource = { type: 'unknown' };
  if (data.startsWith('{')) {
    // json
    let obj: any;
    try {
      obj = JSON.parse(data);
    } catch (e) {}
    //{"path":"pages/scan/scan","query":{},"scene":1035,"referrerInfo":{"appId":"wx44fce6c8fa6911b8"},"mode":"default"}
    //{"path":"pages/orderDetail/orderDetail","query":{"id":"60"},"scene":1008,"referrerInfo":{},"locationInfo":{"isPrivateMessage":false},"mode":"default"}
    //{"path":"pages/scan/scan","query":{"fromKey":"shops/3","mp":"1"},"scene":1074,"referrerInfo":{},"mode":"default"}
    //{"path":"pages/scan/scan","query":{"q":"https%3A%2F%2Fglglff.com%2Fi%2Fro3mekomjp","scancode_time":"1605179075"},"scene":1011,"referrerInfo":{},"mode":"default"}
    if (obj) {
      if (obj.scene) {
        source.scene = obj.scene;
      }
      const query = obj.query || {};
      if (query.scancode_time && query.q) {
        const url = decodeURIComponent(query.q);
      }
      if (query._sourceType) {
        source.type = query._sourceType;
      }
      if (query._sourceId) {
        source.id = query._sourceId;
      }
      if (query._sourceUserId) {
        source.userId = query._sourceUserId;
      }
    }
  }
  if (unionid && source.type == 'unknown') {
    // 小程序有 unionid，未获取来源，根据公众号来源
    const account = await manager.findOne(WxAccount, {
      where: { unionid: unionid, appType: ClientAppType.WXMP },
      select: [
        'id',
        'unionid',
        'sourceType',
        'sourceId',
        'sourceOperatorId',
        'sourceUserId',
        'createdAt',
      ],
    });
    //       Date.now() - account.createdAt.getTime() < 24 * 60 * 60 * 1000 //小于二十四小时
    if (account) {
      source.type = account.sourceType as any;
      source.id = account.sourceId;
      source.userId = account.sourceUserId;
    }
  }
  return source;
}
