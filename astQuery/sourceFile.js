const fs = require('fs');
const Parser = require('./parser');
const log = require('../lib/log');

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

  select (query) {
    if (!this.parser) {
      const options = this.options;
      this.parser = new Parser(this.source, this.filePath, this.options);
      try {
        this.parser.parse();
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
            this.parser.parse();
          } catch (ee) {
            throw ee;
          }
        } else {
          throw e;
        }
      }

      this.parser.resetScope();
      this.processQuery(query, this.parser.rootMetaNode);
    }
  }

  processQuery (query, metaNode, level = 0) {
    const { parser } = this;
    parser.setMetaScope(metaNode);
    const pad = '.'.repeat(level);
    Object.keys(query).forEach(key => {
      const queryValue = query[key];
      const xpath = (key.substr(0, 2) === '//' ? '' : '//') + key;
      if (this.options.debug) {
        log(pad + 'scope', parser.metaNode.id, 'blue');
        log(pad + 'xpath', xpath, 'magenta');
      }
      const nodes = parser.selectAll(xpath);
      const wasResult = nodes && nodes.length;
      if (this.options.debug) {
        log(pad + 'count', nodes ? nodes.length : 0, wasResult ? 'green' : 'red');
      }
      if (wasResult) {
        if (typeof queryValue === 'function') {
          // pass results to function
          const result = {
            nodes,
            parser,
          };
          for (let i = 0; i < nodes.length; i++) {
            result.node = nodes[i];
            result.i = i;
            queryValue(result);
          }
        } else if (typeof queryValue === 'object') {
          for (let i = 0; i < nodes.length; i++) {
            const metaNode = nodes[i].__metaNode;
            parser.push(metaNode);
            this.processQuery(queryValue, metaNode, level + 1);
            parser.pop();
          }
        }
      }
    });
  }
}

module.exports = SourceFile;