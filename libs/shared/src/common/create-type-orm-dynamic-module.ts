import { DynamicModule } from '@nestjs/common';
import { getConnectionOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from '@app/shared/entities';

export function createTypeOrmDynamicModule(): DynamicModule {
  return TypeOrmModule.forRootAsync({
    useFactory: async () => {
      return {
        ...(await getConnectionOptions()),
        //autoLoadEntities: true,
        //entities: [], //rewrite entities
        migrations: [], //no need migration
        entities: Object.values(entities), //rewrite entities
      };
    },
  });
}
