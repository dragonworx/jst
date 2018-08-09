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
        <a id={file.path && file.path.split('.')[0].replace(/\/index/, '')}></a>
        <img src={`/img/file.png`} /> <a title={file.path}>{file.path.split('/').pop()}</a>
        <Deps deps={file.deps} />
      </div>
    );
  }
}