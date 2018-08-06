const fs = require('fs');
const Parser = require('./parser');
const log = require('../lib/log');

class ASTQuery {
  constructor (query, options = {}) {
    this.query = query;
    this.options = options;
  }

  applyToFile (filePath) {
    // if (this.options.track) {
    //   log('process', filePath, 'green');
    // }
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const parser = new Parser(sourceCode, filePath, this.options);
    this.parser = parser;
    if (this.query) {
      parser.resetScope();
      this.process(this.query, parser.rootMetaNode);
    }
  }

  process (query, metaNode, level = 0) {
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
            this.process(queryValue, metaNode, level + 1);
            parser.pop();
          }
        }
      }
    });
  }
}

function applyToFile (filePath, query = undefined, arg3 = {}) {
  const options = arguments.length === 2 && typeof query === 'object' ? query : arg3;
  const astQuery = new ASTQuery(query, options);
  try {
    return astQuery.applyToFile(filePath);
  } catch (e) {
    if (e.message.indexOf('Unexpected token, expected') > -1) {
      if (!options.plugins) {
        options.plugins = [];
      }
      if (options.plugins.indexOf('jsx') === -1) {
        options.plugins.push('jsx');
        return applyToFile(filePath, query, arg3);
      }
      throw e;
    }
  }
}

function prependNodes (childNodes, parentNode) {
  const insertions = Array.isArray(childNodes) ? childNodes : [childNodes];
  parentNode.body.splice(0, 0, ...insertions);
}

function appendNodes (childNodes, parentNode) {
  const insertions = Array.isArray(childNodes) ? childNodes : [childNodes];
  parentNode.body.push.apply(parentNode.body, insertions);
}

module.exports = {
  applyToFile,
  prependNodes,
  appendNodes,
  Parser
};