import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Green color for the voting theme
    },
    secondary: {
      main: '#1976D2', // Blue color for secondary actions
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/voter/dashboard" element={<VoterDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
