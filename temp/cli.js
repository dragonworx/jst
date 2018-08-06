#!/usr/bin/env node
const fs = require('fs');
const AstQuery = require('./astQuery');

const [,, ...args] = process.argv;
const glob = args[0];
const query = args[1];

if (!query) {
  // just show ast of read files
  AstQuery.glob(glob);
} else {
  // load query apply to glob
  let queryPath = query.substr(-3) !== '.js' ? query + '.js' : query;
  const querySource = fs.readFileSync(queryPath, 'utf-8');
  let queryContent = null;
  eval('queryContent = ' + querySource);
  AstQuery.glob(glob, queryContent);
}