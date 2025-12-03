const FormFooter = (props) => {
  return (
    <div data-testid="form-footer">
      <input 
        type="checkbox" 
        data-testid="add-another-checkbox"
        checked={props.leftCheckbox?.checked}
        onChange={(e) => props.leftCheckbox?.onChange && props.leftCheckbox.onChange(e.target.checked)}
      />
      <label data-testid="add-another-label">{props.leftCheckbox?.label}</label>
    </div>
  );
};

module.exports = FormFooter;



