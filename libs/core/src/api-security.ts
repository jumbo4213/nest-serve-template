import { SetMetadata, CustomDecorator } from '@nestjs/common';

export const ApiEmptySecurity = (): CustomDecorator =>
  SetMetadata('swagger/apiSecurity', ['']);

export function ApiFixEmptySecurity(apiObject: any): void {
  Object.values(apiObject.paths).forEach((path: any) => {
    Object.values(path).forEach((method: any) => {
      if (Array.isArray(method.security)) {
        method.security = method.security.filter((s: any) => !!s);
      }
    });
  });
}
