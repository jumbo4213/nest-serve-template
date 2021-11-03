import { HttpStatus } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { QueryFailedError, Unique } from 'typeorm';

export const queryFailedConstraintErrors: Record<string, string> = {};

export function UniqueWithFailedMessage(
  name: string,
  fields: string[],
  message: string,
): any {
  if (queryFailedConstraintErrors[name]) {
    throw new Error(`unique name exists for '${name}'`);
  }
  queryFailedConstraintErrors[name] = message;
  return Unique(name, fields);
}
