const fs = require('fs');
const Parser = require('./parser');
const path = require('path');

// replicate set.add
const setAdd = (item, collection) => {
  if (collection.indexOf(item) === -1) {
    collection.push(item);
  }
};

const resolvePath = (filePath, baseFilePath, resolvePath) => {
  if (resolvePath) {
    const basePath = path.dirname(baseFilePath);
    return path.resolve(basePath, filePath);
  }
  return filePath;
};

class SourceFile {
  constructor (filePath, parseOptions = {}) {
    this.filePath = filePath;
    this.source = fs.readFileSync(filePath, 'utf-8');
    this.options = parseOptions;
  }

  getDependencies () {
    const ins = this.getImports();
    const outs = this.getExports();
    const deps = {
      ins: {
        length: ins.length,
        es6: ins.filter(dep => dep.lang === 'es6'),
        cjs: ins.filter(dep => dep.lang === 'cjs'),
      },
      outs: {
        length: outs.length,
        es6: outs.filter(dep => dep.lang === 'es6'),
        cjs: outs.filter(dep => dep.lang === 'cjs'),
      },
    };
    // deps.hasES6In = !!(deps.ins.es6.length);
    // deps.hasES6Out = !!(deps.outs.es6.length);
    // deps.hasCJSIn = !!(deps.ins.cjs.length);
    // deps.hasCJSOut = !!(deps.outs.cjs.length);
    // deps.hasES6 = !!(deps.hasES6In || deps.hasES6Out);
    // deps.hasCJS = !!(deps.hasCJSIn || deps.hasCJSOut);
    return deps;
  }

  getImports () {
    const array = this.getES6Imports();
    array.push.apply(array, this.getCommonJSRequires());
    return array;
  }

  getExports () {
    const array = this.getES6Exports();
    array.push.apply(array, this.getCommonJSExports());
    return array;
  }

  getES6Imports () {
    const array = [];
    this.select({
      "ImportDeclaration": node => {
        const src = node.select('StringLiteral/@value');
        const absSrc = src && (src[0].charAt(0) === '.' || src[0].charAt(0) === '/') && resolvePath(src[0], this.filePath, true);
        node.select({
          "ImportDefaultSpecifier": node => array.push({ lang: 'es6', type: 'default', name: node.$.local.name, path: src && src[0], absPath: absSrc }),
          "ImportSpecifier": node => array.push({ lang: 'es6', type: 'named', name: node.$.imported.name, path: src && src[0], absPath: absSrc }),
          "ImportNamespaceSpecifier": node => array.push({ lang: 'es6', type: 'namespace', name: node.$.local.name, path: src && src[0], absPath: absSrc }),
        });
      }
    });
    return array;
  }

  getCommonJSRequires () {
    const array = [];
    this.select({
      "CallExpression/Identifier[@name = 'require']": node => {
        const src = node.parent.$.arguments[0].value;
        if (node.parent.parent.is('ExpressionStatement')) {
          array.push({ lang: 'cjs', type: 'expression', path: src });
        } else if (node.parent.parent.is('VariableDeclarator')) {
          if (node.parent.parent.$.id.type === 'Identifier') {
            array.push({ lang: 'cjs', type: 'default', name: node.parent.parent.$.id.name, path: src });
          } else if (node.parent.parent.$.id.type === 'ObjectPattern') {
            const properties = node.parent.parent.select('ObjectProperty');
            properties.forEach(property => array.push({ lang: 'cjs', type: 'named', name: property.$.key.name, path: src }));
          }
        }
      }
    });
    return array;
  }

  getES6Exports () {
    const array = [];
    this.select({
      "ExportDefaultDeclaration": node => {
        const declaration = node.$.declaration.__metaNode;
        const info = declaration.info();
        array.push({ lang: 'es6', type: 'default', info });
      },
      "ExportNamedDeclaration": node => {
        const specifiers = node.$.specifiers;
        const declaration = node.$.declaration && node.$.declaration.__metaNode;
        const source = node.$.source ? resolvePath(node.$.source.value, this.filePath, false) : null;
        const absSource = source && resolvePath(source, this.filePath, true);
        let info;
        if (declaration) {
          info = {
            declaration: declaration.info()
          };
        } else if (specifiers) {
          info = {
            specifiers: node.select('ExportSpecifier').map(specifier => specifier.$.exported.name)
          };
        }
        array.push({ lang: 'es6', type: 'named', info, source, absSource });
      },
      "ExportAllDeclaration": node => {
        const source = resolvePath(node.$.source.value, this.filePath, false);
        const absSource = source && resolvePath(source, this.filePath, true);
        array.push({ lang: 'es6', type: 'all', source, absSource });
      }
    });
    return array;
  }

  getCommonJSExports () {
    const array = [];
    this.select({
      "AssignmentExpression": node => {
        if (node.$.left.type === 'MemberExpression') {
          const expression = node.$.left;
          const isModule = !!(expression.object && expression.object.name === 'module');
          const isExports = !!(expression.property && expression.property.name === 'exports');
          if (isModule && isExports) {
            const info = node.$.right.__metaNode.info();
            array.push({ lang: 'cjs', value: info });
          }
        }
      }
    });
    return array;
  }

  select (query) {
    if (!this.parser) {
      const options = this.options;
      const parser = new Parser(this.source, this.filePath, this.options);
      this.parser = parser;
      try {
        parser.parse();
      } catch (e) {
        if (!options.plugins) {
          options.plugins = [];
        }
        const originalPluginCount = options.plugins.length;
        setAdd('jsx', options.plugins);
        const pluginErrorMatch = e.message.match(/This experimental syntax requires enabling.+: '([^']+)'/);
        if (pluginErrorMatch) {
          const plugins = pluginErrorMatch[1].split(', ');
          setAdd(plugins[0], options.plugins);
        }
        if (options.plugins.length > originalPluginCount) {
          try {
            parser.parse();
          } catch (ee) {
            throw ee;
          }
        } else {
          throw e;
        }
      }
    }
    this.parser.resetScope();
    return this.parser.processQuery(query, this.parser.rootMetaNode);
  }
}

module.exports = SourceFile;