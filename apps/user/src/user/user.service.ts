import { Injectable } from '@nestjs/common';
import { User } from '@app/shared/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '@app/shared/auth';
import { ServiceName } from '@app/shared/enums';

@Injectable()
export class UserService extends AuthService<User> {
  constructor(
    @InjectRepository(User)
    repo: Repository<User>,
  ) {
    super(repo);
  }

  getServiceName(): ServiceName {
    return ServiceName.USER;
  }

  async getUserByMobile(mobile: string): Promise<User> {
    return await this.findOne({
      where: { mobile },
    });
  }

  async getUserByOpenid(wxOpenid: string): Promise<User> {
    return await this.findOne({
      where: { wxOpenid },
    });
  }

  async getUserById(id: number): Promise<User> {
    return await this.findOne(id);
  }

  // 更新用户信息
  // async validateWxapp(account: WxAccount): Promise<User> {
  //   const user = await super.validateWxapp(account);
  //   if (
  //     user.name != account.nickName ||
  //     user.avatarUrl != account.avatarUrl ||
  //     user.wxUnionid != account.unionid
  //   ) {
  //     // user.name = account.nickName;
  //     // user.avatarUrl = account.avatarUrl;
  //     user.wxUnionid = account.unionid;
  //     return await this.save(user);
  //   }
  //   return user;
  // }

  async generateUser(info: User, source?: any): Promise<User> {
    // 新用户来源
    if (source && source.sourceType) {
      info.sourceType = source.sourceType;
      info.sourceId = source.sourceId;
      info.sourceOperatorId = source.sourceOperatorId;
      info.sourceUserId = source.sourceUserId;
    }
    console.log(info);
    return super.generateUser(info, source);
  }
}
