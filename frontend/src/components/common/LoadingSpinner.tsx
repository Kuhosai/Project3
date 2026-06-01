import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

const LoadingSpinner: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 6,
        width: '100%',
      }}
    >
      <CircularProgress color="primary" />
    </Box>
  );
};

export default LoadingSpinner;
