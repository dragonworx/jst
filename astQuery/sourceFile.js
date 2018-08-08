const fs = require('fs');
const Parser = require('./parser');

// replicate set.add
const setAdd = (item, collection) => {
  if (collection.indexOf(item) === -1) {
    collection.push(item);
  }
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
    return {
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
  }

  getImports () {
    const array = this.getES6Imports();
    array.push.apply(array, this.getCommonJSRequires());
    const es6 = array.filter(dep => dep.lang === 'es6');
    const cjs = array.filter(dep => dep.lang === 'es6');
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
        node.select({
          "ImportDefaultSpecifier": node => array.push({ lang: 'es6', type: 'default', name: node.$.local.name, path: src }),
          "ImportSpecifier": node => array.push({ lang: 'es6', type: 'named', name: node.$.imported.name, path: src }),
          "ImportNamespaceSpecifier": node => array.push({ lang: 'es6', type: 'namespace', name: node.$.local.name, path: src }),
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
        const source = node.$.source ? node.$.source.value : null;
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
        array.push({ lang: 'es6', type: 'named', info, source });
      },
      "ExportAllDeclaration": node => {
        const source = node.$.source.value;
        array.push({ lang: 'es6', type: 'all', source });
      }
    });
    return array;
  }

  getCommonJSExports () {
    const array = [];
    const expressions = this.select({
      "ExpressionStatement/AssignmentExpression": node => {
        const info = node.$.right.__metaNode.info();
        array.push({ lang: 'cjs', type: 'exports', info });
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