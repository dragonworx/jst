module.exports = schema = {
  nodeName (metaNode) {
    return metaNode.type;
  },

  childNodes (metaNode) {
    const children = [];
    for (let key in metaNode.children) {
      children.push.apply(children, metaNode.children[key]);
    }
    return children;
  },

  nodeValue (metaNode) {
    return metaNode.text;
  },
  
  attributes (metaNode) {
    const astNode = metaNode.astNode;
    const attribs = {};
    for (let key in astNode) {
      const value = astNode[key];
      // const type = typeof value;
      // if (type === 'string' || type === 'number' || type === 'boolean') {
        attribs[key] = value;
      // }
    }
    attribs.name = metaNode.text;
    return attribs;
  },
};