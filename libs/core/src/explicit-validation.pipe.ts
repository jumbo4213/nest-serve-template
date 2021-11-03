import {
  ValidationPipe,
  ValidationError,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { iterate } from 'iterare';
import {
  HttpErrorByCode,
  ErrorHttpStatusCode,
} from '@nestjs/common/utils/http-error-by-code.util';

export interface ExplicitValidationError {
  validation: true;
  messages: string[];
  errors: ValidationError[];
}

export class ExplicitValidationPipe extends ValidationPipe {
  public createExceptionFactory() {
    //const factory = super.createExceptionFactory();
    return (errors: ValidationError[] = []): HttpException => {
      return createValidationError(
        errors,
        this.isDetailedOutputDisabled,
        this.errorHttpStatusCode,
      );
    };
  }
}

export function createValidationError(
  errors: any[] = [],
  disableErrorMessages = false,
  errorCode: ErrorHttpStatusCode = HttpStatus.BAD_REQUEST,
): HttpException {
  if (disableErrorMessages) {
    return <HttpException>new HttpErrorByCode[errorCode]('Validation Error');
  }
  const messages = flattenValidationErrors(errors);
  const data: ExplicitValidationError = {
    validation: true,
    messages: messages,
    errors: errors.map(mapError),
  };
  const err = <HttpException>(
    new HttpErrorByCode[errorCode](messages.join('\n') || 'Bad Request', data)
  );
  return err;
}

function mapError(err: ValidationError): any {
  return {
    property: err.property,
    constraints: err.constraints,
    children: err.children ? err.children.map(mapError) : undefined,
  };
}

/**
 * @link https://github.com/nestjs/nest/blob/master/packages/common/pipes/validation.pipe.ts
 *
 */
function flattenValidationErrors(
  validationErrors: ValidationError[],
): string[] {
  return iterate(validationErrors)
    .map(error => mapChildrenToValidationErrors(error))
    .flatten()
    .flatten()
    .flatten() //TODO: fix more nest
    .filter(item => !!item.constraints)
    .map(item => Object.values(item.constraints))
    .flatten()
    .toArray();
}

function mapChildrenToValidationErrors(
  error: ValidationError,
): ValidationError[] {
  if (!(error.children && error.children.length)) {
    return [error];
  }
  const validationErrors = [];
  for (const item of error.children) {
    if (item.children && item.children.length) {
      validationErrors.push(mapChildrenToValidationErrors(item));
    }
    validationErrors.push(prependConstraintsWithParentProp(error, item));
  }
  return validationErrors;
}

function prependConstraintsWithParentProp(
  parentError: ValidationError,
  error: ValidationError,
): ValidationError {
  const constraints = {};
  for (const key in error.constraints) {
    //constraints[key] = `${parentError.property}.${error.constraints[key]}`;
    constraints[key] = `${error.constraints[key]}`;
  }
  return {
    ...error,
    constraints,
  };
}
