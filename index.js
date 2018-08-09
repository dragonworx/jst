const fs = require('fs');
const chalk = require('chalk');
const scan = require('./astQuery');

// const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages';
// const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages/core/polyfills/string-prototype-includes.js';
const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages/media';
// const queryPath = './temp/test/exports-cjs-cases.js';

const excludePaths = [
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/CodeFont.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/Color_simple.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/GridSize_c.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/media/media-editor/src/engine/core/binaries/mediaEditor.d.ts',
  '/Users/achamas/ms/atlaskit-mk-2/packages/media/media-editor/src/engine/core/binaries/mediaEditor.js',
];

console.clear();

scan(queryPath, excludePaths)
  .then(data => {
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 4));
    console.log('done.');
  })
  .catch(e => {
    console.log(chalk.red(e.stack));
  });