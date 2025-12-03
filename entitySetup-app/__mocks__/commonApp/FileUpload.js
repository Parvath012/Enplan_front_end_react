const FileUpload = (props) => {
  return (
    <div data-testid="file-upload">
      <div data-testid="upload-label">{props.uploadLabel}</div>
      <input 
        type="file" 
        data-testid="file-input"
        onChange={(e) => props.onFileChange && props.onFileChange(e.target.files?.[0])}
      />
      <input 
        type="checkbox" 
        data-testid="checkbox-input"
        checked={props.checkboxChecked}
        onChange={(e) => props.onCheckboxChange && props.onCheckboxChange(e.target.checked)}
      />
      <label data-testid="checkbox-label">{props.checkboxLabel}</label>
      <div data-testid="supported-extensions">{props.supportedExtensions?.join(', ')}</div>
      <div data-testid="max-file-size">{props.maxFileSize}</div>
    </div>
  );
};

module.exports = FileUpload;



