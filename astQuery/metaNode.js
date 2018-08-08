const jsel = require('jsel');

let i = 0;

const nodeInfo = node => {
  if (!node) {
    this.toString();
  }
  const info = {
    type: node.type
  };
  switch (node.type) {
    // imports
    case "ObjectExpression":
      break;
      case "ClassExpression":
    case "ClassDeclaration":
      info.name = node.select('Identifier/@name');
      break;
    case "VariableDeclaration":
      const varNames = [];
      const inits = [];
      const declarations = node.select('VariableDeclarator');
      declarations.forEach(declaration => {
        varNames.push(declaration.$.id.name);
        inits.push(declaration.$.init ? nodeInfo(declaration.$.init.__metaNode): undefined);
      });
      info.names = varNames;
      info.inits = inits;
      break;
    case "FunctionExpression":
    case "FunctionDeclaration":
      info.name = node.$.id && node.$.id.name;
      break;
    case "Identifier":
      info.name = node.$.name;
      break;
    case "CallExpression":
    case "NewExpression":
      info.name = node.$.callee && node.$.callee.name;
      info.arguments = node.$.arguments && node.$.arguments.map(arg => nodeInfo(arg.__metaNode));
      break;
    case "BooleanLiteral":
    case "StringLiteral":
    case "NumericLiteral":
    case "NullLiteral":
      info.value = node.$.value;
      break;
    case "TemplateLiteral":
      info.value = node.$.quasis && node.$.quasis.map(quasi => quasi.value.raw);
      break;
    case "RegExpLiteral":
      info.value = node.$.pattern;
      info.flags = node.$.flags;
      break;
    case "LogicalExpression":
    case "BinaryExpression":
      info.operator = node.$.operator;
      info.left = nodeInfo(node.$.left.__metaNode);
      info.right = nodeInfo(node.$.right.__metaNode);
      break;
    case "UnaryExpression":
      // TODO...
      info.operator = node.$.operator;
      break;
    case "MemberExpression":
      info.object = node.$.object.name;
      info.property = nodeInfo(node.$.property.__metaNode);
      info.computed = node.$.computed;
      info.optional = node.$.optional;
      break;
    case "ArrowFunctionExpression":
      info.generator = node.$.expression;
      info.async = node.$.expression;
      info.expression = node.$.expression;
      info.params = node.$.params.map(param => param.name);
      break;
    case "JSXElement":
      // TODO...
      // console.log(node.$);
      info.jsx = '<jsx/>';
      break;
    case "TSInterfaceDeclaration":
      // TODO...
      // console.log(node.$);
      info.name = node.$.id.name;
      break;
    case "TaggedTemplateExpression":
      // TODO...
      // console.log(node.$);
      info.name = node.$.tag.name;
      info.quasi = nodeInfo(node.$.quasi.__metaNode);
      break;
    case "ArrayExpression":
      info.elements = node.$.elements.map(element => nodeInfo(element.__metaNode));
      break;
    case "ConditionalExpression":
      info.test = nodeInfo(node.$.test.__metaNode);
      info.alternate = nodeInfo(node.$.alternate.__metaNode);
      info.consequent = nodeInfo(node.$.consequent.__metaNode);
      break;
    case "TSTypeAliasDeclaration":
      // TODO...
      // console.log(node.$); throw new Error("!!!");
      info.name = node.$.id.name;
      break;
    case "TSAsExpression":
      // TODO...
      // console.log(node.$); throw new Error("!!!");
      // info.name = node.$.id.name;
      break;
    case "TSDeclareFunction":
      // TODO...
      // console.log(node.$); throw new Error("!!!");
      // info.name = node.$.id.name;
      break;
    case "AwaitExpression":
      // TODO...
      // console.log(node.$); throw new Error("!!!");
      // info.name = node.$.id.name;
      break;
    case "AssignmentExpression":
      // TODO...
      break;
    case "TSEnumDeclaration":
      // TODO...
      break;
    case "SpreadElement":
      // TODO...
      break;
    case "UpdateExpression":
      // TODO...
      break;
    case "ThisExpression":
      // TODO...
      break;
    case "TypeAlias":
      // TODO...
      break;
    case "TSNonNullExpression":
      // TODO...
      break;
    case "InterfaceDeclaration":
      // TODO...
      break;
    case "TypeCastExpression":
      // TODO...
      break;
    case "TSTypeAssertion":
      // TODO...
      break;
    default:
      console.log(node.$);
      throw new Error("Unknown export type '" + node.type + "'");
  }
  return info;
};

module.exports = class MetaNode {
  constructor (astNode, parser) {
    this.astNode = astNode;
    this.$ = astNode;
    this.parser = parser;
    this.children = {};
    this.id = i++;
    this.cache();
  }

  cache () {
    const { astNode } = this;
    this.range = {
      start: astNode.start,
      end: astNode.end,
      loc: astNode.loc,
    };
    this.type = astNode.type;
    this.text = astNode.name;
  }

  getChildren () {
    const { astNode } = this;
    const children = [];

    for (let key in astNode) {
      if (key === '__metaNode') {
        continue;
      }
      
      const val = astNode[key];
      if (Array.isArray(val)) {
        children.push.apply(children, val);
      } else if (typeof val === 'object' && val !== null) {
        children.push(val);
      }
    }

    return children;
  }

  is (type) {
    return this.type === type;
  }

  select (query) {
    this.parser.push(this);
    const result = this.parser.processQuery(query, this);
    this.parser.pop();
    return result;
  }

  info () {
    return nodeInfo(this);
  }
};