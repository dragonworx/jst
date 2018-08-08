const babelParser = require('@babel/parser');
const generate = require('@babel/generator').default;
const jsel = require('jsel');
const MetaNode = require('./metaNode');
const schema = require('./schema');
const map = require('./map');
const log = require('../lib/log');
const Table = require('../lib/table');

const logTableColors = {
  0: 'blue',
  1: 'green',
  2: 'gray',
  3: 'cyan',
  4: 'yellow',
};

module.exports = class Parser {
  constructor (sourceCode, inputFilePath, options = {}) {
    this.source = sourceCode;
    this.filePath = inputFilePath;
    this.options = options;
    if (this.options.debug || this.options.log || this.options.track) {
      log('filePath', inputFilePath, 'green');
    }
    this.logTable = new Table([
      {
        size: 3,
        align: 'center',
      },
      {
        size: 3,
        align: 'center',
      },
      {
        size: 3,
        align: 'center',
      },
      {
        size: 40,
        align: 'left',
      },
      {
        size: 50,
      }
    ]);
  }

  parse () {
    this.stack = [];
    const rootASTNode = this.getRootASTNode(this.source);
    this.rootASTNode = rootASTNode;
    this.setASTScope(rootASTNode);
    this.rootMetaNode = this.metaNode;
  }

  resetScope () {
    this.setASTScope(this.rootASTNode);
  }

  getRootASTNode (sourceCode) {
    const { options } = this;
    const babelOptions = {
      sourceType: 'unambiguous',
    };
    for (let key in options) {
      babelOptions[key] = options[key];
    }
    if (this.options.debug) {
      log('options', babelOptions, 'cyan');
    }
    return babelParser.parse(sourceCode, babelOptions);
    
  }

  setMetaScope (metaNode) {
    if (this.options.debug) {
      log('metaScope', metaNode.id, 'blue');
    }
    this.astRoot = metaNode.astNode;
    this.metaNode = metaNode;
  }

  setASTScope (astNode) {
    this.astRoot = astNode;
    if (astNode.__metaNode) {
      this.metaNode = astNode.__metaNode;
    } else {
      if (this.options.debug || this.options.log) {
        log('visit', astNode.type, 'red');
      }
      this.metaNode = this.visit(astNode, 0);
    }
  }

  visit (astNode, level, parentMetaNode) {
    if (astNode.__metaNode) {
      return astNode.__metaNode;
    }

    const metaNode = new MetaNode(astNode, this);
    metaNode.level = level;
    astNode.__metaNode = metaNode;
    const nodeType = metaNode.type;

    if (this.options.debug) {
      log('@', metaNode.id, 'red');
    }
  
    if (nodeType) {
      if (parentMetaNode) {
        metaNode.parent = parentMetaNode;
        if (this.options.debug) {
          log('parent', parentMetaNode.id, 'red');
        }
        parentMetaNode.children[nodeType] = parentMetaNode.children[nodeType] || [];
        parentMetaNode.children[nodeType].push(metaNode);
      }

      const range = metaNode.range;
      const previewMaxLen = 50;
      let preview = this.source.substring(range.start, range.end).replace(/\n/g, '↩️').trim();
      if (preview.length > previewMaxLen) {
        preview = preview.substr(0, previewMaxLen) + '...';
      }

      if (this.options.log) {
        this.logTable.log([
          range.loc.start.line,
          range.start,
          range.end - range.start,
          `${'.'.repeat(level + 1)}${nodeType}`,
          preview
        ], logTableColors);
      }
    }
  
    const children = metaNode.getChildren();
    children.forEach(childNode => {
      if (childNode === null) {
        // TODO: need to handle nulls? /Users/achamas/ms/atlaskit-mk-2/packages/editor/editor-bitbucket-transformer/src/serializer.ts:80
        return;
      }
      this.visit(childNode, level + 1, metaNode);
    });
  
    return metaNode;
  }

  select (xpath) {
    const dom = jsel(this.metaNode);
    dom.schema(schema);
    dom.map(map);
    const result = dom.select(xpath);
    return result;
  }

  selectAll (xpath) {
    const dom = jsel(this.metaNode);
    dom.schema(schema);
    dom.map(map);
    const result = dom.selectAll(xpath);
    return result;
  }

  push (metaNode) {
    this.setMetaScope(metaNode);
    this.stack.push(metaNode);
  }

  pop () {
    const metaNode = this.stack.pop();
    if (this.stack.length) {
      this.setMetaScope(metaNode);
    } else {
      this.setMetaScope(this.rootMetaNode);
    }
  }

  generate () {
    return generate(this.rootASTNode);
  }

  snippet (src) {
    const tempParser = new Parser(`function scope() { ${src} }`, null, this.options);
    return tempParser.selectAll('//BlockStatement/*');
  }

  processQuery (query, metaNode, level = 0) {
    const { parser } = this;
    this.setMetaScope(metaNode);
    const pad = '.'.repeat(level);
    let queryResult = null;
    let inlineQueryKey = null;
    if (typeof query === 'string') {
      inlineQueryKey = query;
      query = {};
      query[inlineQueryKey] = result => queryResult = result;
    }
    Object.keys(query).forEach(key => {
      const queryValue = query[key];
      const xpath = ((key.substr(0, 2) === '//' || key.charAt(0) === '@') ? '' : '//') + key;
      // const xpath = key;
      if (this.options.debug) {
        log(pad + 'scope', this.metaNode.id, 'blue');
        log(pad + 'xpath', xpath, 'magenta');
      }
      const nodes = this.selectAll(xpath);
      const wasResult = nodes && nodes.length;
      if (this.options.debug) {
        log(pad + 'count', nodes ? nodes.length : 0, wasResult ? 'green' : 'red');
      }
      if (wasResult) {
        if (typeof queryValue === 'function') {
          // pass results to function
          if (inlineQueryKey === key) {
            queryResult = nodes;
          } else {
            for (let i = 0; i < nodes.length; i++) {
              queryValue(nodes[i]);
            }
          }
          return;
        } else if (typeof queryValue === 'object') {
          for (let i = 0; i < nodes.length; i++) {
            const metaNode = nodes[i].__metaNode;
            this.push(metaNode);
            this.processQuery(queryValue, metaNode, level + 1);
            this.pop();
          }
        }
      }
    });
    // return value for single string query
    return queryResult;
  }
};