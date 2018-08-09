module.exports = function toTree (data) {
  const hash = {};

  const paths = data.files.map(file => {
      hash[file.path] = file;
      return file.path;
  });
  
  paths.sort();
  const tree = {};
  
  function addPath (path) {
      const fields = path.split('/');
      let pointer = tree;
      for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          pointer.$ = fields.slice(0, i).join('/');
          if (!field.length) {
              continue;
          }
          if (i === fields.length - 1) {
            // leaf
            pointer.$$ = pointer.$$ || [];
            pointer.$$.push(hash[path]);
          } else {
              // branch
              if (!pointer[field]) {
                  const newBranch = {};
                  pointer[field] = newBranch;
              }
              pointer = pointer[field];
          }
      }
  }
  
  paths.forEach(path => addPath(path));

  return tree;
};