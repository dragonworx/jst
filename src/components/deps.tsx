import * as React from "react";

export interface DepsProps { 
  deps: any;
}

export interface DepsState {

}

export class Deps extends React.Component<DepsProps, DepsState> {
  packages: any;

  componentWillMount () {
    const es6InPackages = {};
    this.props.deps.ins.es6.forEach(dep => {
      if (dep.path) {
        es6InPackages[dep.path] = es6InPackages[dep.path] || [];
        es6InPackages[dep.path].push(dep.name);
      }
    });

    this.packages = {
      es6: es6InPackages,
    };
  }

  render() {
    const es6InPackages = this.packages.es6;

    const es6InPkg = [];
    for (let pkgName in es6InPackages) {
      const children = [];
      const firstChar = pkgName.charAt(0);
      children.push(<span key={pkgName} className="package">{(firstChar === '.' || firstChar === '/') ? <a href={`#${pkgName}`}>{pkgName}</a> : <b>{pkgName}</b>}</span>);
      es6InPackages[pkgName].forEach(usedName => children.push(<span key={pkgName + usedName} className="package-usedname">{usedName}</span>));
      es6InPkg.push(<span key={pkgName + 'container'} className="deps-set">{children}</span>);
    }

    return (
      <div className="deps">
        <div className="ins">
          <img src="/img/ins.png" />{es6InPkg}
        </div>
      </div>
    );
  }
}