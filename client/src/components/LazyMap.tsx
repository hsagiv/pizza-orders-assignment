import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';

// Lazy load the SimpleMap component
const SimpleMap = lazy(() => import('./SimpleMap').then(module => ({ default: module.SimpleMap })));

interface LazyMapProps {
  orders: any[];
  onOrderSelect?: (order: any) => void;
  selectedOrderId?: string | undefined;
}

export const LazyMap: React.FC<LazyMapProps> = (props) => {
  return (
    <Suspense 
      fallback={
        <Paper sx={{ p: 3, textAlign: 'center', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading map...
            </Typography>
          </Box>
        </Paper>
      }
    >
      <SimpleMap {...props} />
    </Suspense>
  );
};
