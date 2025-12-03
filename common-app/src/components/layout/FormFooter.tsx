import React from 'react';
import { Box } from '@mui/material';
import CustomCheckbox from '../common/CustomCheckbox';

interface FormFooterProps {
	leftCheckbox?: {
		checked: boolean;
		onChange: (checked: boolean) => void;
		label: string;
	};
}

const FormFooter: React.FC<FormFooterProps> = ({
	leftCheckbox,
}) => {
	return (
		<Box
			sx={{
				display: 'flex',
				width: '298px',
				height: '72px',
				alignItems: 'center',
				justifyContent: 'space-between',
				borderTop: '1px solid #e0e0e0',
				border: '1px solid #e0e0e0',
				borderRadius: 2,
				px: 1.5,
				fontSize: '12px',
				gap: 2,
				flexWrap: 'wrap',
				boxSizing: 'border-box',
				backgroundColor: '#fff',
			}}
		>
			{leftCheckbox && (
				<CustomCheckbox
					checked={leftCheckbox.checked}
					label={leftCheckbox.label}
					onChange={(e) => leftCheckbox.onChange(e.target.checked)}
					labelProps={{
						sx: {
							'& .MuiFormControlLabel-label': {
								fontSize: '0.875rem',
								color: '#333',
								fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
							},
							'& .MuiCheckbox-root': {
								padding: '9px',
							},
						}
					}}
				/>
			)}
		</Box>
	);
};

export default FormFooter;