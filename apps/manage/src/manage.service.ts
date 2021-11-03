import { Injectable } from '@nestjs/common';

@Injectable()
export class ManageService {
  getHello(): string {
    return 'Hello World!';
  }
}
