import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Type as Cls, PlainLiteralObject } from '@nestjs/common';
import { Pagination } from './pagination.dto';
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor';
import { DECORATORS } from '@nestjs/swagger/dist/constants';

//TODO: 分页信息
//过滤信息

export class ApiManyBase {
  constructor(data: any, pagination?: Pagination, options?: any, query?: any) {
    this.pagination = pagination;
    this.query = query;
    this.options = options;
    this.data = data;
  }
  //new (data: any, page?: number): IApiMany;
  data: any[];
  pagination?: Pagination;
  options?: any;
  query?: any;
}

export class ApiOneBase {
  constructor(data: any, options?: any) {
    this.data = data;
    this.options = options;
  }
  data: any;
  options?: any;
}

export class ApiOption {
  @ApiProperty()
  value: string;
  @ApiProperty()
  label: string;
}

export class ApiQuery {
  constructor(obj?: PlainLiteralObject) {
    Object.assign(this, obj);
  }

  // /**
  //  * Pick the property which not empty
  //  */
  // pick<K extends keyof this>(props: K[]): PlainLiteralObject {
  //   return props.reduce<PlainLiteralObject>((obj, key) => {
  //     const val = this[key as any];
  //     if (val !== undefined && val !== null && val !== '') {
  //       obj[key as any] = val;
  //     }
  //     return obj;
  //   }, {});
  // }
}

/**
 * Pick the property which not empty
 */
export function ApiQueryPick<T, K extends keyof T>(
  query: T,
  props: K[],
): PlainLiteralObject {
  return props.reduce<PlainLiteralObject>((obj, key) => {
    const val = query[key as any];
    if (val !== undefined && val !== null && val !== '') {
      obj[key as any] = val;
    }
    return obj;
  }, {});
}

/**
export class ApiOptionsBase {
  //new (options: any);
  constructor(options: any) {
    this.options = options;
  }
  options: any;
}
*/

export function ApiMany(
  dataDto: any,
  optionsDto?: any,
  queryDto?: any,
): Cls<ApiManyBase> {
  class ApiDto extends ApiManyBase {
    @ApiProperty({ type: dataDto, isArray: true })
    @Type(() => dataDto)
    data: any[];

    @ApiPropertyOptional({ type: Pagination })
    @Type(() => Pagination)
    pagination?: Pagination;

    @ApiPropertyOptional({ type: optionsDto })
    @Type(() => optionsDto)
    options?: any;

    @ApiPropertyOptional({ type: queryDto })
    @Type(() => queryDto)
    query?: any;
  }
  return ApiDto;
}

export function ApiOne(dataDto: any, optionsDto?: any): Cls<ApiOneBase> {
  class ApiDto extends ApiOneBase {
    @ApiProperty({ type: dataDto })
    @Type(() => dataDto)
    data: any;

    @ApiPropertyOptional({ type: optionsDto })
    @Type(() => optionsDto)
    options?: any;
  }
  return ApiDto;
}
/*
export function ApiOptions(optionsDto: any): Cls<ApiOptionsBase> {
  class ApiDto extends ApiOptionsBase {
    @ApiProperty({ type: optionsDto })
    @Type(() => optionsDto)
    options: any;
  }
  return ApiDto;
}
*/

const modelPropertiesAccessor = new ModelPropertiesAccessor();

export function ApiGetPropertyKeys(prototype: any): string[] {
  modelPropertiesAccessor.applyMetadataFactory(prototype);
  const properties = modelPropertiesAccessor.getModelProperties(prototype);
  return properties;
}

export function ApiGetProperties(
  prototype: any,
): { key: string; description: string }[] {
  return ApiGetPropertyKeys(prototype).map(key => {
    const obj = Reflect.getMetadata(
      DECORATORS.API_MODEL_PROPERTIES,
      prototype,
      key,
    );
    return { key, description: obj.description };
  });
}
