let i = 0;

const nodeInfo = metaNode => {
  const astNode = metaNode.$;
  const info = {
    type: metaNode.type
  };

  switch (metaNode.type) {
    // imports
    case "ObjectExpression":
      break;
      case "ClassExpression":
    case "ClassDeclaration":
      info.name = astNode.id ? astNode.id.name : null;
      info.super = astNode.superClass ? astNode.superClass.__metaNode.select('Identifier/@name') : null;
      break;
    case "VariableDeclaration":
      const varNames = [];
      const inits = [];
      const declarations = metaNode.select('VariableDeclarator');
      declarations.forEach(declaration => {
        varNames.push(declaration.$.id.name);
        inits.push(declaration.$.init ? nodeInfo(declaration.$.init.__metaNode): undefined);
      });
      info.names = varNames;
      info.inits = inits;
      break;
    case "FunctionExpression":
    case "FunctionDeclaration":
      info.name = astNode.id && astNode.id.name;
      const params = [];
      astNode.params.forEach(param => {
        switch (param.type) {
          case "Identifier":
            params.push(param.name);
            break;
          case "AssignmentPattern":
            params.push(param.left.name);
            break;
          case "ObjectPattern":
            param.properties.forEach(property => params.push(property.key.name));
            break;
        }
      });
      info.params = params;
      try {
        info.returnType = astNode.returnType.typeAnnotation.typeName.name;
      } catch (e) {

      }
      break;
    case "Identifier":
      info.name = astNode.name;
      break;
    case "CallExpression":
    case "NewExpression":
      info.name = astNode.callee && astNode.callee.name;
      info.arguments = astNode.arguments && astNode.arguments.map(arg => nodeInfo(arg.__metaNode));
      break;
    case "BooleanLiteral":
    case "StringLiteral":
    case "NumericLiteral":
    case "NullLiteral":
      info.value = astNode.value;
      break;
    case "TemplateLiteral":
      info.value = astNode.quasis && astNode.quasis.map(quasi => quasi.value.raw);
      break;
    case "RegExpLiteral":
      info.value = astNode.pattern;
      info.flags = astNode.flags;
      break;
    case "LogicalExpression":
    case "BinaryExpression":
      info.operator = astNode.operator;
      info.left = nodeInfo(astNode.left.__metaNode);
      info.right = nodeInfo(astNode.right.__metaNode);
      break;
    case "UnaryExpression":
      // TODO...
      info.operator = astNode.operator;
      break;
    case "MemberExpression":
      info.object = astNode.object.name;
      info.property = nodeInfo(astNode.property.__metaNode);
      info.computed = astNode.computed;
      info.optional = astNode.optional;
      break;
    case "ArrowFunctionExpression":
      info.generator = astNode.expression;
      info.async = astNode.expression;
      info.expression = astNode.expression;
      info.params = astNode.params.map(param => param.name);
      break;
    case "JSXElement":
      info.todo = 'TODO...';
      info.jsx = '<jsx/>';
      break;
    case "TSInterfaceDeclaration":
      info.todo = 'TODO...';
      info.name = astNode.id.name;
      break;
    case "TaggedTemplateExpression":
      info.todo = 'TODO...';
      info.name = astNode.tag.name;
      info.quasi = nodeInfo(astNode.quasi.__metaNode);
      break;
    case "ArrayExpression":
      info.elements = astNode.elements.map(element => nodeInfo(element.__metaNode));
      break;
    case "ConditionalExpression":
      info.test = nodeInfo(astNode.test.__metaNode);
      info.alternate = nodeInfo(astNode.alternate.__metaNode);
      info.consequent = nodeInfo(astNode.consequent.__metaNode);
      break;
    case "TSTypeAliasDeclaration":
      info.todo = 'TODO...';
      info.name = astNode.id.name;
      break;
    case "TSAsExpression":
      info.todo = 'TODO...';
      break;
    case "TSDeclareFunction":
      info.todo = 'TODO...';
      break;
    case "AwaitExpression":
      info.todo = 'TODO...';
      break;
    case "AssignmentExpression":
      info.todo = 'TODO...';
      break;
    case "TSEnumDeclaration":
      info.todo = 'TODO...';
      break;
    case "SpreadElement":
      info.todo = 'TODO...';
      break;
    case "UpdateExpression":
      info.todo = 'TODO...';
      break;
    case "ThisExpression":
      info.todo = 'TODO...';
      break;
    case "TypeAlias":
      info.todo = 'TODO...';
      break;
    case "TSNonNullExpression":
      info.todo = 'TODO...';
      break;
    case "InterfaceDeclaration":
      info.todo = 'TODO...';
      break;
    case "TypeCastExpression":
      info.todo = 'TODO...';
      break;
    case "TSTypeAssertion":
      info.todo = 'TODO...';
      break;
    default:
      console.log(astNode);
      throw new Error("Unknown export type '" + metaNode.type + "'");
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