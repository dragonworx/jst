const jsel = require('jsel');
const schema = require('./schema');
const map = require('./map');
const MetaNode = require('./metaNode');

module.exports = function select (astNode, xpath) {
  const prevMetaNode = astNode.__metaNode;
  const metaNode = new MetaNode(astNode, null);
  const dom = jsel(metaNode);
  dom.schema(schema);
  dom.map(map);
  const result = dom.select(xpath);
  astNode.__metaNode = prevMetaNode;
  return result;
};