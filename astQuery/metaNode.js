let i = 0;

module.exports = class MetaNode {
  constructor (astNode) {
    this.astNode = astNode;
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
};