const path = require('path');
const SourceFile = require('./astQuery/sourceFile');
const walk = require('./astQuery/walk');

const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages';
// const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages/editor/editor-core/__tests__/analytics/decorator.ts';

const exclude = [
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/CodeFont.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/Color_simple.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/GridSize_c.js',
];

walk(queryPath)
  .then(paths => {
    paths.forEach(filePath => {
      if (exclude.indexOf(filePath) > -1) {
        return;
      }
      const options = {
        plugins: [],
        track: true,
      };
      const ext = path.extname(filePath).substr(1);
      try {
        if (ext === 'ts' || ext === 'tsx') {
          options.plugins.push('typescript');
        } else if (ext === 'js' || ext === 'jsx') {
          options.plugins.push('flow');
        }
        if (ext.substr(-1) === 'x') {
          options.plugins.push('jsx');
        }
        options.plugins.push('classProperties', 'objectRestSpread');
        const sourceFile = new SourceFile(filePath, options);
        sourceFile.select({
          'ExportDefaultDeclaration/*': ({ node }) => console.log(node.type),
        });
      } catch (e) {
        console.log(filePath);
        console.log(e.message, e.loc);
        throw e;
      }
    });
    console.log(paths.length + ' files parsed!');
  })
  .catch(e => {
    console.log('FAIL', e.stack);
  });

// const src = require('fs').readFileSync(queryPath).toString();
// const findJSX = require('./astQuery/findJSX');
// findJSX(src);