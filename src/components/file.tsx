import * as React from "react";
import { Deps } from './deps';

export interface FileProps { 
  file: any;
}

export class File extends React.Component<FileProps, {}> {
  render() {
    const { file } = this.props;
    
    return (
      <div className="file">
        <a id={file.path}></a>
        <img src={`/img/file.png`} />{file.path.split('/').pop()}
        <Deps deps={file.deps} />
      </div>
    );
  }
}