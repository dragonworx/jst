import * as React from "react";

export interface DepsProps { 
  deps: any;
}

export interface DepsState {

}

export class Deps extends React.Component<DepsProps, DepsState> {
  es6InPackages: any;
  absPackages: any;

  componentWillMount () {
    const es6InPackages = {};
    const absPackages = {};

    this.props.deps.ins.es6.forEach(dep => {
      if (dep.path) {
        es6InPackages[dep.path] = es6InPackages[dep.path] || {
          names: [],
          absPath: dep.absPath,
        };
        es6InPackages[dep.path].names.push(dep.name);
      }
    });

    this.es6InPackages = es6InPackages;
    this.absPackages = absPackages;
  }

  render() {
    const es6InPackages = this.es6InPackages;

    const es6InPkg = [ <img key="ins_img" src="/img/ins.png" /> ];
    for (let pkgName in es6InPackages) {
      const absPath = es6InPackages[pkgName].absPath;
      const names = es6InPackages[pkgName].names;
      const children = [];
      const firstChar = pkgName.charAt(0);
      children.push(<span key={pkgName} className="package">{(firstChar === '.' || firstChar === '/') ? <a href={`#${absPath}`}>{pkgName}</a> : <b>{pkgName}</b>}</span>);
      names.forEach(usedName => children.push(<span key={pkgName + usedName} className="package-usedname">{usedName}</span>));
      es6InPkg.push(<span key={pkgName + 'container'} className="deps-set">{children}</span>);
    }

    return (
      <div className="deps">
        <div className="ins">
          {es6InPkg}
        </div>
      </div>
    );
  }
}