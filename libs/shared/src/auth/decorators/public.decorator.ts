import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiEmptySecurity } from '@app/core';
export function Public(): any {
  return applyDecorators(SetMetadata('isPublic', true), ApiEmptySecurity());
}
