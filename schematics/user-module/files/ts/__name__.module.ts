import { Module } from '@nestjs/common';
import { <%= classify(name) %>Service } from './<%= name %>.service';
import { <%= classify(name) %>Controller } from './<%= name %>.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { <%= classify(singular(name)) %> } from '@app/shared/entities';

@Module({
  imports: [TypeOrmModule.forFeature([<%= classify(singular(name)) %>])],
  providers: [<%= classify(name) %>Service],
  controllers: [<%= classify(name) %>Controller],
  exports: [<%= classify(name) %>Service],
})
export class <%= classify(name) %>Module {}
