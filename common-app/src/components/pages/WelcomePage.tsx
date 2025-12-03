import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { ArrowRight } from '@carbon/icons-react';
import { getIconUrl } from '../../utils/iconUtils';

export interface WelcomePageProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonWidth?: string;
  onButtonClick: () => void;
  illustrationAlt?: string;
}

const WelcomePage: React.FC<WelcomePageProps> = ({
  title,
  subtitle,
  buttonText,
  buttonWidth = '300px',
  onButtonClick,
  illustrationAlt = 'Welcome illustration'
}) => {
  // Use the icon utility to get the correct URL for the welcome image
  const illustrationSrc = getIconUrl('welcome_image.png');

  return (
    <Box sx={{ width: '100%', minHeight: '100%', backgroundColor: 'rgba(250, 250, 249, 1)', display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Illustration */}
        <Box
          component="img"
          src={illustrationSrc}
          alt={illustrationAlt}
          sx={{
            mt: '59px',
            width: '348px',
            height: '227px',
            background: 'inherit',
            backgroundColor: 'rgba(255, 255, 255, 0)',
            display: 'block',
          }}
        />

        {/* Spacing under image */}
        <Box sx={{ height: '50px' }} />

        {/* Heading */}
        <Typography
          sx={{
            fontFamily: "'Inter18pt-Regular', 'Inter 18pt', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '16px',
            color: '#030302',
            textAlign: 'center',
            mb: 1,
          }}
        >
          {title}
        </Typography>

        {/* Subtext */}
        <Typography
          sx={{
            fontFamily: "'Inter18pt-Regular', 'Inter 18pt', sans-serif",
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '14px',
            color: '#8F8E8B',
            lineHeight: '23px',
            textAlign: 'center',
            mb: 4,
          }}
        >
          {subtitle}
        </Typography>

        {/* CTA Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Button
            onClick={onButtonClick}
            sx={{
              position: 'relative',
              width: buttonWidth,
              height: '36px',
              background: 'inherit',
              backgroundColor: 'rgba(0, 111, 230, 1)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: 'none',
              textTransform: 'none',
              px: 2,
              transition: 'background-color 0.2s ease',
              '&:hover': { backgroundColor: 'rgba(0, 81, 171, 1)', boxShadow: 'none' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Box
                component="span"
                sx={{
                  fontFamily: 'Inter Tight, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 500,
                  fontStyle: 'normal',
                  fontSize: '14px',
                  color: '#D0F0FF',
                  lineHeight: '20px',
                }}
              >
                {buttonText}
              </Box>
              <ArrowRight width={15} height={13} color="#D0F0FF" />
            </Box>
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default WelcomePage;
