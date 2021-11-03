const core = require('@angular-devkit/core');
const schematics = require('@angular-devkit/schematics');
const {
  ModuleDeclarator,
} = require('@nestjs/schematics/dist/utils/module.declarator');
const { ModuleFinder } = require('@nestjs/schematics/dist/utils/module.finder');
const { NameParser } = require('@nestjs/schematics/dist/utils/name.parser');
const {
  mergeSourceRoot,
} = require('@nestjs/schematics/dist/utils/source-root.helpers');

const { plural, singular } = require('pluralize');

function main(options) {
  options = transform(options);
  return (tree, context) => {
    return schematics.branchAndMerge(
      schematics.chain([
        mergeSourceRoot(options),
        addDeclarationToModule(options),
        schematics.mergeWith(generate(options)),
      ]),
    )(tree, context);
  };
}
exports.main = main;
function transform(options) {
  const target = Object.assign({}, options);
  target.metadata = 'imports';
  target.type = 'module';
  const location = new NameParser().parse(target);
  target.name = plural(core.strings.dasherize(location.name));
  target.path = core.join(core.strings.dasherize(location.path), target.name);
  target.language = 'ts';
  return target;
}

function generate(options) {
  return context =>
    schematics.apply(schematics.url(core.join('./files', options.language)), [
      schematics.template(
        Object.assign({}, core.strings, options, {
          singular,
          plural,
        }),
      ),
      schematics.move(options.path),
    ])(context);
}
function addDeclarationToModule(options) {
  return tree => {
    if (options.skipImport !== undefined && options.skipImport) {
      return tree;
    }
    options.module = new ModuleFinder(tree).find({
      name: options.name,
      path: options.path,
    });
    if (!options.module) {
      return tree;
    }
    const content = tree.read(options.module).toString();
    const declarator = new ModuleDeclarator();
    // for now, we'll pass in staticOptions using the `register()` method
    // with no default options
    //const staticOptions = { name: 'register', value: {} };
    //const declarationOptions = Object.assign({ staticOptions }, options);
    tree.overwrite(options.module, declarator.declare(content, options));
    return tree;
  };
}
