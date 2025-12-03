import React from 'react';

const FileUpload = ({
  onFileChange,
  acceptedFileTypes = '*',
  maxSizeMB,
  label,
  errorMessage,
  selectedFile
}: any) => {
  return (
    <div data-testid="file-upload" data-max-size={maxSizeMB} data-accepted-types={acceptedFileTypes}>
      {label}
      <input type="file" data-testid="file-input" onChange={(e) => onFileChange(e.target.files?.[0])} />
      {errorMessage && <div data-testid="error-message">{errorMessage}</div>}
      {selectedFile && <div data-testid="selected-file">{selectedFile.name}</div>}
    </div>
  );
};

export default FileUpload;
