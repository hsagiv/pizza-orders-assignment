import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto', mt: 4 }}>
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            An unexpected error occurred. Please try refreshing the page.
          </Typography>
          {this.state.error && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontFamily: 'monospace' }}>
              {this.state.error.message}
            </Typography>
          )}
          <Button variant="contained" onClick={this.handleRetry}>
            Try Again
          </Button>
        </Paper>
      );
    }

    return this.props.children;
  }
}
