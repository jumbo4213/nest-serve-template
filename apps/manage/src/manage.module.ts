import { Module } from '@nestjs/common';
import { ManageController } from './manage.controller';
import { ManageService } from './manage.service';

@Module({
  imports: [],
  controllers: [ManageController],
  providers: [ManageService],
})
export class ManageModule {}
