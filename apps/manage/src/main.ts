import { NestFactory } from '@nestjs/core';
import { ManageModule } from './manage.module';

async function bootstrap() {
  const app = await NestFactory.create(ManageModule);
  await app.listen(3010);
}
bootstrap();
