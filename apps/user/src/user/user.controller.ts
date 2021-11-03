import { CurrentUser } from '@app/shared/auth';
import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { CurUser, NewUser } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(public service: UserService) {}

  @Get('getUserInfo')
  @ApiOperation({ summary: '获取用户信息' })
  async getUserInfo(@CurrentUser() curUser: CurUser): Promise<any> {
    return await this.service.getOne(curUser.id);
  }

  @Put('update')
  @ApiOperation({ summary: '更新当前用户信息' })
  async update(
    @CurrentUser() curUser: CurUser,
    @Body() newUser: NewUser,
  ): Promise<any> {
    const user = await this.service.getOne(curUser.id);
    Object.assign(user, this.service.create(newUser));
    if (!user.firstCity && user.city) {
      // 注册后更新的记录
      user.firstProvince = user.province;
      user.firstCity = user.city;
      user.firstDistrict = user.district;
      user.firstLatitude = user.latitude;
      user.firstLongitude = user.longitude;
    }
    await this.service.save(user);
  }

  /*
  @Get()
  @ApiOperation({ summary: '' })
  async index(@Query() query: UserQuery): Promise<ManyUser> {
    const [users, pagination] = await this.service.paginate({
      limit: 30,
      page: query.page,
    });
    return new ManyUser(users, pagination);
  }

  @Post()
  @ApiOperation({ summary: '' })
  async create(@Body() newUser: NewUser): Promise<any> {
    const user = this.service.create(newUser);
    await this.service.save(user);
  }

  @Get(':id')
  @ApiOperation({ summary: '' })
  async detail(@Param('id') id: number): Promise<OneUser> {
    const user = await this.service.getOne(id);
    return new OneUser(user);
  }

  @Put(':id')
  @ApiOperation({ summary: '' })
  async update(
    @Param('id') id: number,
    @Body() newUser: NewUser,
  ): Promise<any> {
    const user = await this.service.getOne(id);
    Object.assign(user, this.service.create(newUser));
    await this.service.save(user);
  }
 */
}
