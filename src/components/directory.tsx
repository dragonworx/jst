import * as React from "react";
import { File } from './file';

export interface DirectoryProps { 
  info: any;
}

export interface DirectoryState {
  isOpen: boolean;
}

export class Directory extends React.Component<DirectoryProps, DirectoryState> {
  state = {
    isOpen: true
  };

  onToggleOpen = e => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  render() {
    const { info } = this.props;
    const { isOpen } = this.state;
    const dirs = [];
    const files = [];

    for (let key in info) {
      if (key.charAt(0) !== '$') {
        dirs.push(<Directory key={info[key].$} info={info[key]}></Directory>);
      }
    }

    if (info.$$) {
      files.push.apply(files, info.$$.map(file => <File key={file.path} file={file}></File>));
    }

    const openStyle = {
      display: isOpen ? 'block': 'none'
    };
    
    return (
      <div className="directory">
        <div className="title" onClick={this.onToggleOpen}>
          <img src={`/img/folder_${isOpen ? 'open' : 'closed'}.png`} />
          {info.$.split('/').pop()}
        </div>
        <div className="subDirs" style={openStyle}>{dirs}</div>
        <div className="files" style={openStyle}>{files}</div>
      </div>
    );
  }
}