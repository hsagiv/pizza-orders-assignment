import React, { useState, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { OrderList } from './components/OrderList';
import { Header } from './components/Header';
import { LanguageProvider } from './contexts/LanguageContext';
import { Container, Box } from '@mui/material';

// RTL languages
const rtlLanguages = ['he', 'ar'];

function App() {
  const [language, setLanguage] = useState('en');
  const isRTL = rtlLanguages.includes(language);

  // Create Material-UI theme with RTL support
  const theme = useMemo(() => createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    direction: isRTL ? 'rtl' : 'ltr',
  }), [isRTL]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Update document direction
    document.dir = rtlLanguages.includes(newLanguage) ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
  };

  return (
    <Provider store={store}>
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
                <Routes>
                  <Route path="/" element={<OrderList />} />
                  <Route path="/orders" element={<OrderList />} />
                </Routes>
              </Container>
            </Box>
          </Router>
        </ThemeProvider>
      </LanguageProvider>
    </Provider>
  );
}

export default App;
