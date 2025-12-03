import React from 'react';

interface CommonTextSpanProps {
  fontFamily?: string;
  fontWeight?: number;
  fontSize?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: string;
  children: React.ReactNode;
}

const CommonTextSpan: React.FC<CommonTextSpanProps> = ({
  fontFamily = "'Inter Tight', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontWeight = 500,
  fontSize = '14px',
  color = '#D0F0FF',
  textAlign = 'left',
  lineHeight = '20px',
  children
}) => {
  return (
    <span style={{
      fontFamily,
      fontWeight,
      fontStyle: 'normal',
      fontSize,
      color,
      textAlign,
      lineHeight
    }}>
      {children}
    </span>
  );
};

export default CommonTextSpan;
