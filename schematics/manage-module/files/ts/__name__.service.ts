import { Injectable, BadRequestException } from '@nestjs/common';
import { <%= classify(singular(name)) %> } from '@app/shared/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CurrentOperator,
  OperatorCrudService,
} from '../operators';

@Injectable()
export class <%= classify(name) %>Service extends OperatorCrudService<<%= classify(singular(name)) %>> {
  constructor(
    @InjectRepository(<%= classify(singular(name)) %>)
    repo: Repository<<%= classify(singular(name)) %>>,
  ) {
    super(repo);
  }
}