import React, { useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider, useSelector } from 'react-redux';
import { store } from './store/store';
import { OrderList } from './components/OrderList';
import { Header } from './components/Header';
import { LanguageProvider } from './contexts/LanguageContext';
import { Container, Box } from '@mui/material';
import { RootState } from './store/store';

// RTL languages
const rtlLanguages = ['he', 'ar'];

function AppContent() {
  const { language, rtl } = useSelector((state: RootState) => state.settings);
  const isRTL = rtl || rtlLanguages.includes(language);

  // Update document direction when language changes
  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

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

  return (
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
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
