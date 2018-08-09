import * as React from "react";
import { Directory } from './directory';

export interface RootProps { 
  tree: any;
}

export class Root extends React.Component<RootProps, {}> {
  render() {
    const { tree } = this.props;
    const dirs = [];

    for (let key in tree) {
      if (key.charAt(0) !== '$') {
        dirs.push(<Directory key={tree[key].$} info={tree[key]}></Directory>);
      }
    }
    
    return <div className="container">{dirs}</div>;
  }
}