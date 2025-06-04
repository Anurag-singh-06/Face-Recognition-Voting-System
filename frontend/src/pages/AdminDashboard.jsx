import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  useTheme,
  styled,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  PersonAdd,
  Groups,
  HowToVote,
  HowToReg,
  History,
  BarChart,
  AccountTree,
  People,
  LiveTv,
  Logout,
  Home,
  Map
} from '@mui/icons-material';
import ElectionResult from '../components/ElectionResult';
import Parties from '../components/Parties';
import PreviousElections from '../components/PreviousElection';
import AddAdmin from '../components/AddAdmin';
import AddVoter from '../components/AddVoter';
import CreateElection from '../components/CreateElection';
import Voters from '../components/Voters';
import LiveElection from '../components/LiveElection';
import AddParty from '../components/AddParty';

const AdminDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [candidates, setCandidates] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [newCandidate, setNewCandidate] = useState({
    name: '',
    partyName: '',
    partySymbol: '',
  });

  // Custom styled ListItemButton for active state
  const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 1),
    '&.Mui-selected': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText,
      '&:hover': {
        backgroundColor: theme.palette.primary.main,
      },
      '& .MuiListItemIcon-root': {
        color: theme.palette.primary.contrastText,
      }
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  }));

  // Fetch candidates on component mount
  useEffect(() => {
    if (activeTab === 'candidates') {
      fetchCandidates();
    }
  }, [activeTab]);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/candidates', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddCandidate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newCandidate),
      });

      if (!response.ok) {
        throw new Error('Failed to add candidate');
      }

      setShowAddDialog(false);
      setNewCandidate({ name: '', partyName: '', partySymbol: '' });
      fetchCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setSelectedCandidates([]);
  };

  const handleToggleSelect = (candidateId) => {
    setSelectedCandidates(prev =>
      prev.includes(candidateId)
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedCandidates.length === 0) {
      setError('Please select candidates to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCandidates.length} candidate(s)?`)) {
      return;
    }

    try {
      await Promise.all(
        selectedCandidates.map(id =>
          fetch(`http://localhost:5000/api/admin/candidates/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
        )
      );

      setDeleteMode(false);
      setSelectedCandidates([]);
      fetchCandidates();
    } catch (err) {
      setError('Failed to delete selected candidates');
    }
  };

  const handleResetVotes = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/reset-votes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset votes');
      }

      fetchCandidates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewResults = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/results', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }

      const data = await response.json();
      setCandidates(data);
      setShowResultsDialog(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" gutterBottom>
              Election Commission Dashboard
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Welcome to the Election Commission Control Center
            </Typography>
          </Box>
        );
      case 'addAdmin':
        return <AddAdmin />;
      // case 'addParty':
      //   return <AddParty />;
      // case 'addVoter':
      //   return <AddVoter />;
      case 'createElection':
        return <CreateElection />;
      case 'previousElection':
        return <PreviousElections />;
      case 'electionResult':
        return <ElectionResult />;
      case 'parties':
        return <Parties />;
      case 'voters':
        return <Voters />;
      case 'liveElection':
        return <LiveElection />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Dashboard
            </Typography>
          </Box>
        );
    }
  };

  // Navigation items data
  const navItems = [
    { key: 'home', label: 'Dashboard', icon: <Home /> },
    { key: 'addAdmin', label: 'Add Admin', icon: <PersonAdd /> },
    // { key: 'addParty', label: 'Add Party', icon: <Groups /> },
    // { key: 'addVoter', label: 'Add Voter', icon: <HowToVote /> },
    { key: 'createElection', label: 'Create Election', icon: <HowToReg /> },
    { key: 'previousElection', label: 'Previous Election', icon: <History /> },
    { key: 'electionResult', label: 'Election Result', icon: <BarChart /> },
    { key: 'parties', label: 'Parties', icon: <AccountTree /> },
    { key: 'voters', label: 'Voters', icon: <People /> },
    { key: 'liveElection', label: 'Live Election', icon: <LiveTv /> },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
 backgroundColor: '#1E1E1E',            color: theme.palette.primary.contrastText,
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: theme.palette.primary.contrastText }}>
            चुनाव आयोग
          </Typography>
          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.light }}>
            Admin Panel
          </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.key} disablePadding>
              <StyledListItemButton
                selected={activeTab === item.key}
                onClick={() => setActiveTab(item.key)}
              >
                <ListItemIcon sx={{ color: activeTab === item.key ? theme.palette.primary.contrastText : theme.palette.primary.light }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <ListItem disablePadding>
            <StyledListItemButton onClick={handleLogout}>
              <ListItemIcon sx={{ color: theme.palette.primary.light }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </StyledListItemButton>
          </ListItem>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          marginLeft: '240px',
          minHeight: '100vh',
        }}
      >
        {renderContent()}
      </Box>

      {/* Add Candidate Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)}>
        <DialogTitle>Add New Candidate</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Candidate Name"
            fullWidth
            value={newCandidate.name}
            onChange={(e) =>
              setNewCandidate((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Party Name"
            fullWidth
            value={newCandidate.partyName}
            onChange={(e) =>
              setNewCandidate((prev) => ({ ...prev, partyName: e.target.value }))
            }
          />
          <TextField
            margin="dense"
            label="Party Symbol URL"
            fullWidth
            value={newCandidate.partySymbol}
            onChange={(e) =>
              setNewCandidate((prev) => ({ ...prev, partySymbol: e.target.value }))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCandidate} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* Results Dialog */}
      <Dialog
        open={showResultsDialog}
        onClose={() => setShowResultsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Election Results</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {candidates.map((candidate, index) => (
              <Grid item xs={12} key={candidate._id}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">
                    {index + 1}. {candidate.name} ({candidate.partyName})
                  </Typography>
                  <Typography variant="body1">Votes: {candidate.votes}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResultsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;