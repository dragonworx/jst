const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const SourceFile = require('./sourceFile');
const walk = require('./walk');

const excludePath = './exclude.txt';
const bypassExcludePath = './exclude.pause.txt';

const print = val => console.log(JSON.stringify(val, null, 4));

module.exports = function scan (queryPath, excludePaths = []) {
  const data = {
    entry: queryPath,
    files: [],
  };
  const excludedPaths = [];
  const loadedExclude = [];

  let fileCount = 0;

  excludedPaths.push.apply(excludedPaths, excludePaths);

  if (fs.existsSync(excludePath)) {
    const excludeData = fs.readFileSync(excludePath).toString();
    loadedExclude.push.apply(excludedPaths, excludeData.split('\n'));
    excludedPaths.push.apply(excludedPaths, loadedExclude);
  }

  return walk(queryPath)
  .then(paths => {
    paths = paths.filter(filePath => excludedPaths.indexOf(filePath) === -1);
    console.log(chalk.green(`Processing ${paths.length} file${paths.length === 1 ? '' : 's'}`));
    if (excludedPaths.length) {
      console.log(chalk.blue(`Excluding ${excludedPaths.length}  file${paths.length === 1 ? '' : 's'}`));
    }

    paths.forEach(filePath => {
      fileCount++;
      // if (fileCount > 100) {
      //   return;
      // }

      const options = {
        plugins: [],
        track: false,
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

        console.log(`[${chalk.bold.green(fileCount.toString().padStart(5, '0'))}] ${chalk.green(filePath)} [${chalk.cyan(options.plugins.join(','))}]`);
        const sourceFile = new SourceFile(filePath, options);
        const deps = sourceFile.getDependencies();
        data.files.push({
          path: filePath,
          deps,
          plugins: options.plugins,
        });

        if (!fs.existsSync(bypassExcludePath)) {
          fs.appendFileSync(excludePath, filePath + '\n');
        } else {
          print(deps);
        }
      } catch (e) {
        console.log(chalk.bold.red(filePath));
        throw e;
      }
    });
    
    return data;
  })
  .catch(e => {
    console.log(chalk.red('FAIL: ' + e.stack));
  });
};