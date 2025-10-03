import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setTheme, setLanguage, setRtl, setAutoRefresh } from '../store/slices/settingsSlice';

/**
 * Header component with navigation and settings
 * Provides theme switching, language selection, and real-time status
 */
export const Header: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { theme, language, rtl, autoRefresh } = useSelector((state: RootState) => state.settings);
  
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(null);

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleLanguageClick = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setSettingsAnchor(null);
    setLanguageAnchor(null);
  };

  const handleThemeToggle = () => {
    dispatch(setTheme(theme === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageChange = (newLanguage: string) => {
    dispatch(setLanguage(newLanguage));
    // Set RTL for Arabic and Hebrew
    dispatch(setRtl(['ar', 'he'].includes(newLanguage)));
    handleClose();
  };

  const handleAutoRefreshToggle = () => {
    dispatch(setAutoRefresh(!autoRefresh));
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        {/* Logo and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
            🍕 Tictuk Pizza
          </Typography>
          <Chip 
            label="Order Management" 
            size="small" 
            variant="outlined" 
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255,255,255,0.3)',
              '& .MuiChip-label': { fontSize: '0.75rem' }
            }} 
          />
          {rtl && (
            <Chip 
              label="RTL" 
              color="info"
              size="small"
              sx={{ 
                '& .MuiChip-label': { fontSize: '0.75rem' }
              }} 
            />
          )}
        </Box>

        {/* Settings Menu */}
        <IconButton
          color="inherit"
          onClick={handleSettingsClick}
          aria-label="settings"
        >
          <SettingsIcon />
        </IconButton>

        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={handleThemeToggle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              {theme === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
            </Box>
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </MenuItem>
          
          <MenuItem onClick={handleAutoRefreshToggle}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              <RefreshIcon />
            </Box>
            Auto Refresh: {autoRefresh ? 'On' : 'Off'}
          </MenuItem>

          <Divider />
          
          <MenuItem onClick={handleLanguageClick}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              <LanguageIcon />
            </Box>
            Language: {language.toUpperCase()}
          </MenuItem>
        </Menu>

        {/* Language Menu */}
        <Menu
          anchorEl={languageAnchor}
          open={Boolean(languageAnchor)}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => handleLanguageChange('en')}>
            🇺🇸 English
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('he')}>
            🇮🇱 עברית
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('ar')}>
            🇸🇦 العربية
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};