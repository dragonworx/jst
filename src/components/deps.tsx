import * as React from "react";

export interface DepsProps { 
  deps: any;
}

export interface DepsState {

}

export class Deps extends React.Component<DepsProps, DepsState> {
  es6InPackages: any;
  es6Outs: any;

  componentWillMount () {
    const { deps } = this.props;
    const es6InPackages = {};
    const es6Outs = [];

    deps.ins.es6.forEach(dep => {
      if (dep.path) {
        es6InPackages[dep.path] = es6InPackages[dep.path] || {
          names: [],
          absPath: dep.absPath,
        };
        es6InPackages[dep.path].names.push(dep.name);
      }
    });

    deps.outs.es6.forEach(dep => {
      if (dep.source) {
        es6Outs.push({
          path: dep.source,
          absPath: dep.absSource,
        });
      } else if (dep.info && dep.info.declaration) {
        let type = dep.info.declaration.type;
        const name = dep.info.declaration.name || (dep.info.declaration.names && dep.info.declaration.names.join(', '));
        switch (type) {
          case "VariableDeclaration":
            type = 'const';
            break;
          case "FunctionDeclaration":
            const returnType = dep.info.declaration.returnType;
            type = `(${dep.info.declaration.params.join(', ')}) => ${returnType || 'void'}`;
            break;
        }
        es6Outs.push({
          type,
          name,
        });
      }
    });

    this.es6InPackages = es6InPackages;
    this.es6Outs = es6Outs;
  }

  render() {
    const { es6InPackages, es6Outs } = this;

    const es6InElements = [ <div key="ins_label" className="dep_label"><b>in:</b><img src="/img/ins.png" /></div> ];
    let inKeys = 0;
    for (let pkgName in es6InPackages) {
      inKeys++;
      const absPath = es6InPackages[pkgName].absPath;
      const names = es6InPackages[pkgName].names;
      const children = [];
      const firstChar = pkgName.charAt(0);
      children.push(<span key={pkgName} className="package">{(firstChar === '.' || firstChar === '/') ? <a href={`#${absPath}`}>{pkgName}</a> : <b>{pkgName}</b>}</span>);
      names.forEach(usedName => children.push(<span key={pkgName + usedName} className="package-usedname">{usedName}</span>));
      es6InElements.push(<span key={pkgName + 'container'} className="deps-set">{children}</span>);
    }

    const es6OutElements = [ <div key="outs_label" className="dep_label"><b>out:</b><img src="/img/outs.png" /></div> ];
    es6Outs.forEach((info, i) => {
      if (info.path) {
        es6OutElements.push((
          <span key={info.path + 'container' + i} className="deps-set">
            <span className="package"><a href={`#${info.absPath}`}>{info.path}</a></span>
          </span>
        ));
      } else if (info.type) {
        es6OutElements.push((
          <span key={info.name + info.type + 'container' + i} className="deps-set">
            <span className="package">{info.name}</span>
            <span className="package-usedname">{info.type}</span>
          </span>
        ));
      }
    });

    return (
      <div className="deps">
        <div className="ins">
          {inKeys ? es6InElements : null}
        </div>
        <div className="outs">
          {es6Outs.length ? es6OutElements : null}
        </div>
      </div>
    );
  }
}