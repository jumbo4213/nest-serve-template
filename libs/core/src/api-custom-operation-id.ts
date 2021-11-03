import { OpenAPIObject } from '@nestjs/swagger';
import * as _ from 'lodash';
import { isPlural } from 'pluralize';

const methodAliases = {
  get(isDetail: boolean) {
    return isDetail ? 'Detail' : '';
  },
  all(isDetail: boolean) {
    return isDetail ? 'Detail' : '';
  },
  post(isDetail: boolean, isPlural: boolean) {
    return isDetail ? 'Update' : isPlural ? 'Create' : '';
  },
  put(isDetail: boolean) {
    return isDetail ? 'Update' : '';
  },
  patch(isDetail: boolean) {
    return isDetail ? 'PartialUpdate' : '';
  },
  delete(isDetail: boolean) {
    return isDetail ? 'Delete' : '';
  },
};

export function ApiCustomOperationId(apiObject: OpenAPIObject) {
  const paths = apiObject.paths;
  const conflict = {};

  Object.keys(paths).forEach(path => {
    Object.keys(paths[path]).forEach(method => {
      const obj = paths[path][method];
      const id = customOperationId(path, method, obj.operationId);
      if (conflict[id])
        throw new Error(
          `${method}:${path} operationId '${id}' conflict to ${conflict[id].method}:${conflict[id].path}`,
        );
      conflict[id] = { path, method };
      obj.operationId = id;
    });
  });
}

function customOperationId(path: string, method: string, old: string): string {
  if (old && old.indexOf('_') == -1) {
    return old;
  }
  const name = path.replace(/\{(\w){1,}\}/g, '');
  const ar = path.split('/');
  let last = ar.pop();
  if (!last) last = ar.pop();
  if (!last) {
    // index
    return 'index';
  }
  const isDetail = path.match(/\{(\w){1,}\}\/?$/);
  if (method == 'post' && isDetail) {
    throw new Error(`${path}: ${method} is not allowed on one resource.`);
  }
  const id =
    _.camelCase(name) + methodAliases[method](isDetail, last && isPlural(last));
  return id;
}
