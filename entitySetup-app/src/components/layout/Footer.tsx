import React from 'react';

interface FooterProps {
  label: string;
  count: number;
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ label, count, className = '' }) => {
  return (
    <div className={`footer ${className}`} data-testid="footer">
      <span className="footer-label">{label}</span>
      <span className="footer-count">{count}</span>
    </div>
  );
};

export default Footer;
