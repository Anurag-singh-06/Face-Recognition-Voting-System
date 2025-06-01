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
// import IndiaMap from './IndiaMap'; // You'll need to create or import an IndiaMap component
import ElectionResult from '../components/ElectionResult';
import Parties from '../components/Parties';
import PreviousElections from '../components/PreviousElection';
import AddAdmin from '../components/AddAdmin';
import AddVoter from '../components/AddVoter';
// import CreateElection from '../components/CreateElection';
import Voters from '../components/Voters';
import LiveElection from '../components/LiveElection';
import AddParty from '../components/AddParty';

const AdminDashboard = () => {
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
            <Box sx={{ mt: 4 }}>
              {/* <IndiaMap /> Replace with your actual India map component */}
            </Box>
          </Box>
        );
      case 'addAdmin':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <AddAdmin />
            </Typography>
            {/* Add admin form would go here */}
          </Box>
        );
      case 'addParty':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <AddParty />
            </Typography>
            {/* Add party form would go here */}
          </Box>
        );
      case 'addVoter':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <AddVoter />
            </Typography>
            {/* Add voter form would go here */}
          </Box>
        );
      case 'createElection':
        return (
          <Box sx={{ p: 3 }}>
           
            {/* Create election form would go here */}
          </Box>
        );
      case 'previousElection':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <PreviousElections />
            </Typography>
            {/* Previous elections list would go here */}
          </Box>
        );
      case 'electionResult':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
             <ElectionResult />
            </Typography>
            {/* Election results would go here */}
          </Box>
        );
      case 'parties':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <Parties />
            </Typography>
            {/* Parties list would go here */}
          </Box>
        );
      case 'voters':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <Voters />
            </Typography>
            {/* Voters list would go here */}
          </Box>
        );
      case 'liveElection':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              <LiveElection />
            </Typography>
            {/* Live election monitoring would go here */}
          </Box>
        );
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
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">चुनाव आयोग</Typography>
          <Typography variant="subtitle2">Admin Panel</Typography>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('home')}>
              <ListItemIcon>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('addAdmin')}>
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Add Admin" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('addParty')}>
              <ListItemIcon>
                <Groups />
              </ListItemIcon>
              <ListItemText primary="Add Party" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('addVoter')}>
              <ListItemIcon>
                <HowToVote />
              </ListItemIcon>
              <ListItemText primary="Add Voter" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('createElection')}>
              <ListItemIcon>
                <HowToReg />
              </ListItemIcon>
              <ListItemText primary="Create Election" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('previousElection')}>
              <ListItemIcon>
                <History />
              </ListItemIcon>
              <ListItemText primary="Previous Election" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('electionResult')}>
              <ListItemIcon>
                <BarChart />
              </ListItemIcon>
              <ListItemText primary="Election Result" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('parties')}>
              <ListItemIcon>
                <AccountTree />
              </ListItemIcon>
              <ListItemText primary="Parties" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('voters')}>
              <ListItemIcon>
                <People />
              </ListItemIcon>
              <ListItemText primary="Voters" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setActiveTab('liveElection')}>
              <ListItemIcon>
                <LiveTv />
              </ListItemIcon>
              <ListItemText primary="Live Election" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
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