const FormHeader = (props) => {
  return (
    <div data-testid="form-header">
      <div data-testid="form-title">{props.title}</div>
      <button data-testid="back-button" onClick={props.onBack}>Back</button>
      <button data-testid="reset-button" onClick={props.onReset}>Reset</button>
      <button data-testid="cancel-button" onClick={props.onCancel}>Cancel</button>
      <button 
        data-testid="save-button" 
        onClick={props.onSave}
        disabled={props.isSaveDisabled}
      >
        Save
      </button>
      <div data-testid="form-modified">{props.isFormModified ? 'Modified' : 'Not Modified'}</div>
      <div data-testid="save-loading">{props.isSaveLoading ? 'Loading' : 'Not Loading'}</div>
    </div>
  );
};

module.exports = FormHeader;



