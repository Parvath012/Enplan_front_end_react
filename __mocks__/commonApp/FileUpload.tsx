import React from 'react';

const FileUpload = ({ onFileSelect, accept, multiple, ...props }: any) => {
  return (
    <div data-testid="file-upload" {...props}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onFileSelect?.(e.target.files)}
      />
    </div>
  );
};

export default FileUpload;

