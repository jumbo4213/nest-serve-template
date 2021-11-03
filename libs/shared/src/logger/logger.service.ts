/*
 * @Description:
 * @Author: jumbo
 * @Date: 2021-11-03 10:28:15
 * @LastEditors: jumbo
 * @LastEditTime: 2021-11-03 12:09:25
 */
import { requireEnv } from '@app/core';
import { Injectable } from '@nestjs/common';
const SERVE_ENV = requireEnv('SERVE_ENV');
@Injectable()
export class LoggerService {
  log(index: string, data: any, prodOnly?: any, devOnly?: any) {
    if (SERVE_ENV == 'development') {
      console.log(index, data);
    }

    return;
  }

  error(index: string, err: Error, data: any, prodOnly?: any, devOnly?: any) {
    this.log(
      index + '-error',
      {
        ...data,
        error: {
          data: err && JSON.stringify((err as any).data),
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      },
      prodOnly,
      devOnly,
    );
  }

  fail(index: string, err: Error, data: any, prodOnly?: any, devOnly?: any) {
    this.log(
      index + '-fail',
      {
        ...data,
        error: {
          data: err && JSON.stringify((err as any).data),
          name: err.name,
          message: err.message,
          stack: undefined,
        },
      },
      prodOnly,
      devOnly,
    );
  }
}
