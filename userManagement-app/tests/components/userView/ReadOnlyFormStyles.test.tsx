import { getReadOnlyFormStyles } from '../../../src/components/userView/ReadOnlyFormStyles';
import { Theme } from '@mui/material';

describe('getReadOnlyFormStyles', () => {
  describe('Base Styles', () => {
    it('should return base styles when no options provided', () => {
      const styles = getReadOnlyFormStyles();
      
      expect(styles).toBeDefined();
      expect(typeof styles).toBe('object');
      const stylesObj = styles as any;
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiInputBase-root']).toBeDefined();
      expect(stylesObj['& .MuiSelect-select']).toBeDefined();
      expect(stylesObj['& .MuiFormControlLabel-root']).toBeDefined();
      expect(stylesObj['& .MuiFormControlLabel-label']).toBeDefined();
      expect(stylesObj['& button']).toBeDefined();
      expect(stylesObj['& .MuiCheckbox-root']).toBeUndefined();
      expect(stylesObj['& .MuiSwitch-root']).toBeUndefined();
    });

    it('should return base styles with explicit false flags', () => {
      const styles = getReadOnlyFormStyles(false, false);
      const stylesObj = styles as any;
      
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiCheckbox-root']).toBeUndefined();
      expect(stylesObj['& .MuiSwitch-root']).toBeUndefined();
    });

    it('should include required field styles', () => {
      const styles = getReadOnlyFormStyles();
      const stylesObj = styles as any;
      const requiredStyles = stylesObj['& .form-field--required'];
      
      expect(requiredStyles).toBeDefined();
      expect(requiredStyles['& .form-field__input .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline']).toBeDefined();
      expect(requiredStyles['& .form-field__input--readonly.form-field--required .MuiOutlinedInput-root::before']).toBeDefined();
      expect(requiredStyles['& .form-field__select .MuiOutlinedInput-notchedOutline']).toBeDefined();
      expect(requiredStyles['& .form-field__multiselect .MuiOutlinedInput-notchedOutline']).toBeDefined();
    });

    it('should include input base styles', () => {
      const styles = getReadOnlyFormStyles();
      const stylesObj = styles as any;
      const inputStyles = stylesObj['& .MuiInputBase-root'];
      
      expect(inputStyles).toBeDefined();
      expect(inputStyles.backgroundColor).toBe('#f5f5f5 !important');
      expect(inputStyles['& .MuiOutlinedInput-notchedOutline']).toBeDefined();
      expect(inputStyles['& .MuiInputBase-input']).toBeDefined();
    });

    it('should include select styles', () => {
      const styles = getReadOnlyFormStyles();
      const stylesObj = styles as any;
      const selectStyles = stylesObj['& .MuiSelect-select'];
      
      expect(selectStyles).toBeDefined();
      expect(selectStyles.color).toBe('#9E9E9E !important');
      expect(selectStyles.cursor).toBe('default !important');
    });

    it('should include form control label styles', () => {
      const styles = getReadOnlyFormStyles();
      const stylesObj = styles as any;
      
      expect(stylesObj['& .MuiFormControlLabel-root']).toBeDefined();
      expect(stylesObj['& .MuiFormControlLabel-root'].cursor).toBe('default !important');
      expect(stylesObj['& .MuiFormControlLabel-label']).toBeDefined();
      expect(stylesObj['& .MuiFormControlLabel-label'].cursor).toBe('default !important');
    });

    it('should include button hide styles', () => {
      const styles = getReadOnlyFormStyles();
      const stylesObj = styles as any;
      
      expect(stylesObj['& button']).toBeDefined();
      expect(stylesObj['& button'].display).toBe('none !important');
    });
  });

  describe('Checkbox Styles', () => {
    it('should include checkbox styles when includeCheckbox is true', () => {
      const styles = getReadOnlyFormStyles(true, false);
      const stylesObj = styles as any;
      
      expect(stylesObj['& .MuiCheckbox-root']).toBeDefined();
      expect(stylesObj['& .MuiSwitch-root']).toBeUndefined();
    });

    it('should include correct checkbox checked styles', () => {
      const styles = getReadOnlyFormStyles(true, false);
      const stylesObj = styles as any;
      const checkboxStyles = stylesObj['& .MuiCheckbox-root'];
      
      expect(checkboxStyles).toBeDefined();
      expect(checkboxStyles['&.Mui-checked']).toBeDefined();
      expect(checkboxStyles['&.Mui-checked'].color).toBe('#4caf50 !important');
    });

    it('should include correct checkbox hover styles', () => {
      const styles = getReadOnlyFormStyles(true, false);
      const stylesObj = styles as any;
      const checkboxStyles = stylesObj['& .MuiCheckbox-root'];
      
      expect(checkboxStyles).toBeDefined();
      expect(checkboxStyles['&:hover']).toBeDefined();
      expect(checkboxStyles['&:hover'].backgroundColor).toBe('transparent !important');
      expect(checkboxStyles['&:hover .custom-checkbox-icon.unchecked']).toBeDefined();
      expect(checkboxStyles['&:hover .custom-checkbox-icon.checked']).toBeDefined();
    });

    it('should include checkbox cursor styles', () => {
      const styles = getReadOnlyFormStyles(true, false);
      const stylesObj = styles as any;
      const checkboxStyles = stylesObj['& .MuiCheckbox-root'];
      
      expect(checkboxStyles).toBeDefined();
      expect(checkboxStyles.cursor).toBe('default !important');
    });

    it('should include base styles along with checkbox styles', () => {
      const styles = getReadOnlyFormStyles(true, false);
      const stylesObj = styles as any;
      
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiInputBase-root']).toBeDefined();
      expect(stylesObj['& .MuiCheckbox-root']).toBeDefined();
    });
  });

  describe('Switch Styles', () => {
    it('should include switch styles when includeSwitch is true', () => {
      const styles = getReadOnlyFormStyles(false, true);
      const stylesObj = styles as any;
      
      expect(stylesObj['& .MuiSwitch-root']).toBeDefined();
      expect(stylesObj['& .MuiCheckbox-root']).toBeUndefined();
    });

    it('should include correct switch checked styles', () => {
      const styles = getReadOnlyFormStyles(false, true);
      const stylesObj = styles as any;
      const switchStyles = stylesObj['& .MuiSwitch-root'];
      
      expect(switchStyles).toBeDefined();
      expect(switchStyles['& .MuiSwitch-switchBase']).toBeDefined();
      expect(switchStyles['& .MuiSwitch-switchBase']['&.Mui-checked']).toBeDefined();
      expect(switchStyles['& .MuiSwitch-switchBase']['&.Mui-checked'].color).toBe('#4caf50 !important');
      expect(switchStyles['& .MuiSwitch-switchBase']['&.Mui-checked']['& + .MuiSwitch-track']).toBeDefined();
    });

    it('should include correct switch hover styles', () => {
      const styles = getReadOnlyFormStyles(false, true);
      const stylesObj = styles as any;
      const switchStyles = stylesObj['& .MuiSwitch-root'];
      
      expect(switchStyles).toBeDefined();
      expect(switchStyles['&:hover']).toBeDefined();
      expect(switchStyles['&:hover'].backgroundColor).toBe('transparent !important');
    });

    it('should include switch cursor styles', () => {
      const styles = getReadOnlyFormStyles(false, true);
      const stylesObj = styles as any;
      const switchStyles = stylesObj['& .MuiSwitch-root'];
      
      expect(switchStyles).toBeDefined();
      expect(switchStyles.cursor).toBe('default !important');
    });

    it('should include base styles along with switch styles', () => {
      const styles = getReadOnlyFormStyles(false, true);
      const stylesObj = styles as any;
      
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiInputBase-root']).toBeDefined();
      expect(stylesObj['& .MuiSwitch-root']).toBeDefined();
    });
  });

  describe('Combined Styles', () => {
    it('should prioritize checkbox when both flags are true', () => {
      const styles = getReadOnlyFormStyles(true, true);
      const stylesObj = styles as any;
      
      // When both are true, checkbox takes priority
      expect(stylesObj['& .MuiCheckbox-root']).toBeDefined();
      expect(stylesObj['& .MuiSwitch-root']).toBeUndefined();
    });

    it('should return base styles when both flags are false', () => {
      const styles = getReadOnlyFormStyles(false, false);
      const stylesObj = styles as any;
      
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiCheckbox-root']).toBeUndefined();
      expect(stylesObj['& .MuiSwitch-root']).toBeUndefined();
    });
  });

  describe('Style Structure', () => {
    it('should return a valid SxProps object', () => {
      const styles = getReadOnlyFormStyles();
      
      expect(typeof styles).toBe('object');
      expect(styles).not.toBeNull();
    });

    it('should merge base styles with checkbox styles correctly', () => {
      const styles = getReadOnlyFormStyles(true, false);
      const stylesObj = styles as any;
      
      // Check that base styles are present
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiInputBase-root']).toBeDefined();
      
      // Check that checkbox styles are added
      expect(stylesObj['& .MuiCheckbox-root']).toBeDefined();
    });

    it('should merge base styles with switch styles correctly', () => {
      const styles = getReadOnlyFormStyles(false, true);
      const stylesObj = styles as any;
      
      // Check that base styles are present
      expect(stylesObj['& .form-field--required']).toBeDefined();
      expect(stylesObj['& .MuiInputBase-root']).toBeDefined();
      
      // Check that switch styles are added
      expect(stylesObj['& .MuiSwitch-root']).toBeDefined();
    });
  });
});

