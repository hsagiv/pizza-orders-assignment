import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

interface LanguageSelectorProps {
  language: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', rtl: true },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
}) => {
  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <LanguageIcon color="action" />
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel>Language</InputLabel>
        <Select
          value={language}
          label="Language"
          onChange={(e) => onLanguageChange(e.target.value)}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2">{lang.nativeName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ({lang.name})
                </Typography>
                {lang.rtl && (
                  <Chip 
                    label="RTL" 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                    sx={{ ml: 'auto', fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
