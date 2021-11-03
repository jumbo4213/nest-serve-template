import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/core';
import { Session, Device } from '../entities';
import { ServiceName } from '../enums';
import { NewDevice } from '../devices';

const ONE_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class SessionsService extends CrudService<Session> {
  constructor(
    @InjectRepository(Session)
    repo: Repository<Session>,
  ) {
    super(repo);
  }

  getRevokeTime(): number {
    return ONE_DAY;
  }

  //valid expired and revoke old token.
  //验证过期时间
  //撤销老token（设置一个稍短过期时间，避免因为网络错误用户没收到新token时老token能用一段时间）
  async validateAndRevoke(token: string): Promise<Session> {
    const session = await this.findOneBy('token', token);
    if (!session) {
      throw new UnauthorizedException('无效token');
    }
    if (session.expiredAt && session.expiredAt < new Date()) {
      throw new UnauthorizedException('token过期');
    }

    const max = new Date(Date.now() + this.getRevokeTime());
    if (!session.expiredAt || session.expiredAt > max) session.expiredAt = max;

    return this.save(session);
  }

  async generate(
    device: Device | NewDevice,
    service: ServiceName,
    authId: number,
    ip: string,
  ): Promise<Session> {
    let session = new Session();
    session.ip = ip;
    session.udid = device.udid;
    session.app = device.app;
    session.version = device.version;
    session.packageVersion = device.packageVersion;
    session.from = device.from;
    session.latitude = device.latitude;
    session.longitude = device.longitude;
    session.service = service;
    session.authId = authId;
    session = await this.save(session);
    return session;
  }
}
