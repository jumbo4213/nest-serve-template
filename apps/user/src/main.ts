/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-07-13 17:20:57
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 11:42:28
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ApiFixEmptySecurity } from '@app/core';
import { AuthService } from '@app/shared/auth';
import { JwtAuthGuard } from '@app/shared/auth/guards/jwt-auth.guard';
import { CurUserGuard } from './user/cur-user.guard';
import * as cookieParser from 'cookie-parser';
import { nodeEnv } from '@app/core/register-env';
import { writeFileSync } from 'fs';
import { ApiCustomOperationId } from '@app/core/api-custom-operation-id';
import { LoggerService } from '@app/shared/logger';
import { LoggingInterceptor } from '@app/shared/common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  const reflector = app.get(Reflector);
  const authService = app.get(AuthService);
  if (authService) {
    app.useGlobalGuards(new JwtAuthGuard(reflector, authService));
  }
  app.useGlobalGuards(new CurUserGuard());
  app.useGlobalInterceptors(
    new LoggingInterceptor(app.get(LoggerService), 'jj-user'),
  );
  const config = new DocumentBuilder()
    .setTitle('User example')
    .setDescription('The user API description')
    .setVersion('1.0')
    .addSecurityRequirements('bearer')
    .addBearerAuth()
    .addServer('/api/v1')
    .addTag('default', '未标记')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
    deepScanRoutes: true,
  });
  ApiFixEmptySecurity(document);
  ApiCustomOperationId(document);
  if (nodeEnv == 'development') {
    writeFileSync(
      process.cwd() + '/api/user-api.json',
      JSON.stringify(document, null, 2),
    );
  }
  SwaggerModule.setup('/api/docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
    },
  });
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
