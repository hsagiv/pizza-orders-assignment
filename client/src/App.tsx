import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { OrderList } from './components/OrderList';
import { Header } from './components/Header';
import { Container, Box } from '@mui/material';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
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
    </Provider>
  );
}

export default App;
