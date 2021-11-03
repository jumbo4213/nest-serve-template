/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-11-03 11:08:34
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 11:14:41
 */
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from '../logger';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const req: Request = context.switchToHttp().getRequest();

    return next.handle().pipe(
      map(data => {
        LoggingInterceptor.log(this.loggerService, req, now, this.index, data);
        return data;
      }),
    );
  }
  constructor(
    private readonly loggerService: LoggerService,
    private readonly index: string,
  ) {}

  static log(
    loggerService: LoggerService,
    req: Request,
    start: number,
    index: string,
    data: any,
    err?: Error,
  ) {
    const conf = {
      method: req.method,
      path: req.path,
      url: req.url,
      udid: req.header('udid'),
      app: req.header('app'),
      // headers: JSON.stringify(req.headers),
      body: JSON.stringify(req.body || {}),
    };

    const user = (req as any).user || {};

    const logData = {
      userId: user.id,
      userMobile: user.mobile,
      ...conf,
      time: Date.now() - start,
    };
    if (err) {
      const isFail = err instanceof HttpException;
      if (isFail) {
        loggerService.fail(index, err, logData);
      } else {
        loggerService.error(index, err, logData);
      }
    } else {
      loggerService.log(
        index,
        logData,
        {
          responseData: JSON.stringify(data || {}),
        },
        data,
      );
    }
  }
}
