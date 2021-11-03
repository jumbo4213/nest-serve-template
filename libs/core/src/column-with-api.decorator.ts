import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Column, ColumnOptions } from 'typeorm';
import { applyDecorators } from '@nestjs/common';

/**
 * Auto set swagger apiPropertyOptions by typeorm column options if net set
 * apiOptions.description = options.comment
 *
 * @param options
 * @param apiOptions
 */
export function ColumnWithApi(
  options?: ColumnOptions,
  apiOptions?: ApiPropertyOptions,
): PropertyDecorator {
  apiOptions = apiOptions || {};
  options = options || {};
  if (options.comment && !apiOptions.description) {
    apiOptions.description = options.comment;
  }
  if (options.default !== undefined && apiOptions.default === undefined) {
    apiOptions.default = options.default;
  }
  return applyDecorators(Column(options) as any, ApiProperty(apiOptions));
}
