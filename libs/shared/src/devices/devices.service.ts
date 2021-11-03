import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrudService } from '@app/core';
import { Device } from '../entities';
import { OmitType } from '@nestjs/swagger';
import { ServiceName } from '../enums';

export class NewDevice extends OmitType(Device, [
  'id',
  'authId',
  'service',
  'ip',
]) {}

@Injectable()
export class DevicesService extends CrudService<Device> {
  constructor(
    @InjectRepository(Device)
    repo: Repository<Device>,
  ) {
    super(repo);
  }

  async updateDevice(
    data: NewDevice,
    service: ServiceName,
    ip?: string,
    authId?: number,
  ): Promise<Device> {
    let device = await this.findOneBy('udid', data.udid);
    if (device) {
      device = this.repo.merge(device, data);
    } else {
      device = this.create(data);
    }
    device.service = service;
    if (authId) {
      device.authId = authId;
      device.authedAt = new Date();
    }
    if (ip) {
      device.ip = ip;
    }
    return this.save(device);
  }
}
