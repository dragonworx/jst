const findit = require('findit');
const path = require('path');

module.exports = function walk (baseRootPath, includeExtensions = ['js', 'ts', 'jxs', 'tsx'], excludeFilter = ['.git', 'node_modules']) {
  return new Promise((resolve, reject) => {
    const finder = findit(baseRootPath);
    const paths = [];
  
    finder.on('directory', (dir, stat, stop) => {
      excludeFilter.forEach(exclude => dir.indexOf(exclude) > -1 ? stop() : void(0));
    });
    
    finder.on('file', function (file, stat) {
      const ext = path.extname(file).substr(1);
      for (let i = 0; i < includeExtensions.length; i++) {
        if (ext === includeExtensions[i]) {
          paths.push(file);
          break;
        }
      }
    });
  
    finder.on('end', function () {
      resolve(paths);
    });
  });
};