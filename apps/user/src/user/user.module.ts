import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule, AuthService } from '@app/shared/auth';
import { User } from '@app/shared/entities';
import { DevicesModule } from '@app/shared/devices';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    AuthModule.register(UserService, User, { imports: [] }),
    DevicesModule,
  ],
  controllers: [UserController, AuthController],
  providers: [],
  exports: [AuthModule],
})
export class UserModule {}
