import { DynamicModule, Module, Type } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesModule } from '../devices';
import { SessionsModule } from '../sessions';
import { WxAccountsModule } from '../wx-accounts';
import { AuthService } from './auth.service';

@Module({
  imports: [SessionsModule, DevicesModule, WxAccountsModule],
  providers: [],
  exports: [],
})
export class AuthModule {
  static register(
    cls: Type<AuthService<any>>,
    entity: any,
    options?: { imports?: any[] },
  ): DynamicModule {
    const mod: DynamicModule = {
      module: <any>this,
      imports: [TypeOrmModule.forFeature([entity])].concat(
        ...(options?.imports || []),
      ),
      providers: [
        cls,
        {
          useExisting: cls,
          provide: AuthService,
        },
      ],
      exports: [cls, AuthService],
    };

    return mod;
  }
}
