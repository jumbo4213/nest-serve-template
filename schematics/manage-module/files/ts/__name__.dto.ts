import { PickType } from '@nestjs/swagger';
import { <%= classify(singular(name)) %> } from '@app/shared/entities';
import { ApiOne, ApiMany, ApiQuery, ApiOption, TransformToNumber } from '@app/core';
import { IsOptional } from 'class-validator';
// 由于某些属性随时需要在列表中添加，请用 PickType 选择属性，以免列表属性被自动添加到新增。
export class New<%= classify(singular(name)) %> extends PickType(<%= classify(singular(name)) %>, []) {}

export class <%= classify(singular(name)) %>Query extends ApiQuery {
  @TransformToNumber()
  page?: number;
}

export class <%= classify(singular(name)) %>Options {
}

export class Many<%= classify(singular(name)) %> extends ApiMany(
  <%= classify(singular(name)) %>, 
  <%= classify(singular(name)) %>Options,
  <%= classify(singular(name)) %>Query,
  ) {}
export class One<%= classify(singular(name)) %> extends ApiOne(<%= classify(singular(name)) %>, <%= classify(singular(name)) %>Options) {}