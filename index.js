const path = require('path');
const SourceFile = require('./astQuery/sourceFile');
const walk = require('./astQuery/walk');
const fs = require('fs');

// const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages';
// const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages/editor/editor-core/__tests__/analytics/decorator.ts';
const queryPath = '/Users/achamas/ms/atlaskit-mk-2/packages/media';
// const queryPath = './temp/test/exports-cjs-cases.js';

const exclude = [
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/CodeFont.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/Color_simple.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/bitbucket/codemod-util-shared-styles-to-theme/__fixtures__/GridSize_c.js',
  '/Users/achamas/ms/atlaskit-mk-2/packages/media/media-editor/src/engine/core/binaries/mediaEditor.d.ts',
  '/Users/achamas/ms/atlaskit-mk-2/packages/media/media-editor/src/engine/core/binaries/mediaEditor.js',
];
const loadedExclude = [];

const excludePath = './exclude.txt';

if (fs.existsSync(excludePath)) {
  const exlc = fs.readFileSync(excludePath).toString();
  loadedExclude.push.apply(exclude, exlc.split('\n'));
  exclude.push.apply(exclude, loadedExclude);
}

console.log('excluding ' + exclude.length);

const print = val => console.log(JSON.stringify(val, null, 4));

console.clear();

walk(queryPath)
  .then(paths => {
    paths.forEach(filePath => {
      if (exclude.indexOf(filePath) > -1) {
        console.log('excluded: '+  filePath);
        return;
      }
      // add to exclude...
      if (!loadedExclude.length) {
        fs.appendFileSync(excludePath, filePath + '\n');
      }
      const options = {
        plugins: [],
        track: true,
        log: false,
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
        const deps = sourceFile.getDependencies();
        const exports = sourceFile.getExports();
        console.log('deps: ' + deps.length, 'exports: ' + exports.length);
        // print(exports);
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