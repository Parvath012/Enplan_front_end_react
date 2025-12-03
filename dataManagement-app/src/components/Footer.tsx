import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './footer.scss';
import CustomTooltip from "commonApp/CustomTooltip";
import { formatTime } from 'commonApp/timeUtils';
import { footerData } from '../config/footerConfig';
import { useNifiStatus } from '../hooks/useNifiStatus';

const Footer = () => {
  const location = useLocation();
  
  // Check if we're in admin app context
  const isInAdminApp = location.pathname.includes('/data-management');
  
  // Use different path logic for admin vs standalone
  // Empty string for admin app, or first path segment for standalone
  const path = isInAdminApp 
    ? '' 
    : location.pathname.split('/')[1] ?? '';
  
  const items = footerData[path] ?? [];
  
  // Get NiFi status data
  const { getFormattedValue } = useNifiStatus(10000);

  const [currentTime, setCurrentTime] = useState<string>(() => formatTime());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-icons">
        {items.map((item, index) => {
          // Determine the text to display based on the key
          let displayText: string;
          
          if (item.key === 'lastUpdated') {
            displayText = currentTime;
          } else if (item.key && ['activeThreads', 'queuedBytes', 'startCount', 'stopCount', 
                      'queuedItems1', 'queuedItems2', 'queuedItems3', 'queuedItems4', 
                      'queuedItems5', 'queuedItems6', 'queuedItems7', 'queuedItems8', 'queuedItems9'].includes(item.key)) {
            // Get data from NiFi status
            displayText = getFormattedValue(item.key);
          } else {
            // Default to the text in the config
            displayText = item.text;
          }
          
          const content = (
            <div className="footer-item-inner">
              <span className="icon-text-wrap">
                {typeof item.icon === 'string' ? (
                  <img src={item.icon} alt="icon" className="icon" />
                ) : (
                  <div>
                    {item.icon}
                  </div>
                )}
                <span>{displayText}</span>
              </span>
            </div>
          );
          const Wrapper = item.tooltip ? CustomTooltip : React.Fragment;
          const wrapperProps = item.tooltip
            ? { title: item.tooltip, placement: 'top' }
            : {};

          return (
            <button
              key={item.key ?? index}
              type="button"
              className={`footer-item-wrapper reset-button ${index !== 0 ? 'with-border' : ''}`}
              onClick={() => console.log(`Clicked on: ${item.key}`)}
            >
              <Wrapper {...wrapperProps}>{content}</Wrapper>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
