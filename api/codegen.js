const { parseSchemas } = require('swagger-typescript-api/src/schema');
const {
  parseRoutes,
  groupRoutes,
} = require('swagger-typescript-api/src/routes');
const { createApiConfig } = require('swagger-typescript-api/src/apiConfig');
const { getModelType } = require('swagger-typescript-api/src/modelTypes');
const {
  createComponentsMap,
  filterComponentsMap,
} = require('swagger-typescript-api/src/components');
const mustache = require('mustache');
const prettier = require('prettier');
const { readFileSync, writeFileSync } = require('fs');
const _ = require('lodash');
const { isPlural } = require('pluralize');
const program = require('commander');
const { resolve } = require('path');

mustache.escape = value => value;

const prettierConfig = {
  printWidth: 80,
  trailingComma: 'all',
  singleQuote: true,
  parser: 'typescript',
};

//const methodAliases = {
//  get(isDetail) {
//    return isDetail ? 'Detail' : '';
//  },
//  post(isDetail, isPlural) {
//    return isDetail ? 'Update' : isPlural ? 'Create' : '';
//  },
//  put(isDetail) {
//    return isDetail ? 'Update' : '';
//  },
//  patch(isDetail) {
//    return isDetail ? 'PartialUpdate' : '';
//  },
//  delete(isDetail) {
//    return isDetail ? 'Delete' : '';
//  },
//};

exports.codegen = codegen;

program
  .requiredOption('-p, --path <path>', 'path to swagger scheme')
  .requiredOption(
    '-o, --output <output>',
    'output path of typescript api file',
  );

program.parse(process.argv);
const path = resolve(process.cwd(), program.path);
const output = resolve(process.cwd(), program.output);
codegen(JSON.parse(readFileSync(path, 'UTF8')), output);
console.log(`codegen ${path} to ${output}`);

function codegen(apiObject, toFile) {
  customFix(apiObject);
  const { info, servers, components } = apiObject;

  const componentsMap = createComponentsMap(components);
  const schemasMap = filterComponentsMap(componentsMap, 'schemas');

  const parsedSchemas = parseSchemas(components);
  const routes = parseRoutes(
    apiObject,
    parsedSchemas,
    componentsMap,
    components,
  );
  const apiConfig = createApiConfig({ info, servers }, true);

  const configuration = {
    apiConfig,
    modelTypes: schemasMap.map(getModelType),
    routes: routes,
  };
  routes.forEach(route => {
    route.specificArgs.requestParams.type = 'RequestConfig';
    route.specificArgs.requestParams.name = 'requestConfig';
  });

  const source = prettier.format(
    [
      mustache.render(
        readFileSync(__dirname + '/templates/api.mustache', 'UTF8'),
        configuration,
      ),
      mustache.render(
        readFileSync(__dirname + '/templates/client.mustache', 'UTF8'),
        configuration,
      ),
    ].join(''),
    prettierConfig,
  );
  if (toFile) {
    writeFileSync(toFile, source);
  }
  return source;
}

/**
 * custom operationId from path
 * Fix security
 * @see https://swagger.io/docs/specification/authentication/
 *
 */
function customFix(apiObject) {
  const paths = apiObject.paths;
  const security = apiObject.security;
  const conflict = {};

  Object.keys(paths).forEach(path => {
    Object.keys(paths[path]).forEach(method => {
      const obj = paths[path][method];
      obj.security = obj.security || security;
      //let id = customOperationId(path, method, obj.operationId);
      //if (conflict[id])
      //  throw new Error(
      //    `${method}:${path} operationId '${id}' conflict to ${conflict[id].method}:${conflict[id].path}`,
      //  );
      //conflict[id] = { path, method };
      //obj.operationId = id;
    });
  });
}

//function customOperationId(path, method, old) {
//  if (old && old.indexOf('_') == -1) {
//    return old;
//  }
//  let name = path.replace(/\{(\w){1,}\}/g, '');
//  const ar = path.split('/');
//  let last = ar.pop();
//  if (!last) last = ar.pop();
//  if (!last) {
//    // index
//    return 'index';
//  }
//  const isDetail = path.match(/\{(\w){1,}\}\/?$/);
//  if (method == 'post' && isDetail) {
//    throw new Error(`${path}: ${method} is not allowed on one resource.`);
//  }
//  let id =
//    _.camelCase(name) + methodAliases[method](isDetail, last && isPlural(last));
//  return id;
//}
