import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  CssBaseline,
  useTheme,
  styled,
  Avatar,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  HowToVote,
  History,
  BarChart,
  Person,
  Logout,
  Home,
  VerifiedUser,
  HowToReg,
  Event,
  Groups
} from '@mui/icons-material';
import FaceVerificationDialog from '../components/FaceVerificationDialog';

const VoterDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [error, setError] = useState('');
  const [selectedParty, setSelectedParty] = useState(null);
  const [selectedElection, setSelectedElection] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showFaceDialog, setShowFaceDialog] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elections, setElections] = useState([]);
  const [parties, setParties] = useState([]);
  const [voteSuccess, setVoteSuccess] = useState(false);

  // Custom styled components
  const StyledCard = styled(Card)(({ theme }) => ({
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[8],
    },
  }));

  const VoteButton = styled(Button)(({ theme, hasvoted }) => ({
    background: hasvoted === 'true' ? theme.palette.success.main : theme.palette.primary.main,
    color: theme.palette.common.white,
    '&:hover': {
      background: hasvoted === 'true' ? theme.palette.success.dark : theme.palette.primary.dark,
    },
  }));

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchLiveElections();
    checkVoteStatus();
    setLoading(false);
  }, []);

  const fetchLiveElections = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/election/live', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch elections');
      const data = await response.json();
      setElections(data.elections);
    } catch (err) {
      setError(err.message);
    }
  };
  const fetchElectionParties = async (electionId) => {
    try {
      setLoading(true);
      setError('');
      setParties([]); // Clear previous parties

      const response = await fetch(`http://localhost:5000/api/election/${electionId}/parties`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch parties (status: ${response.status})`);
      }

      const data = await response.json();

      // Assuming backend returns { success: true, data: [...] }
      const partiesData = data.data || data;

      if (!Array.isArray(partiesData)) {
        throw new Error('Received invalid parties data format');
      }

      setParties(partiesData);
    } catch (err) {
      console.error('Error fetching parties:', err);
      setError(err.message || 'Failed to load parties. Please try again.');
      setParties([]);
    } finally {
      setLoading(false);
    }
  };

  const checkVoteStatus = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData?.hasVoted) setHasVoted(true);
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const handleElectionSelect = (electionId) => {
    setSelectedElection(electionId);
    fetchElectionParties(electionId);
    setSelectedParty(null);
  };

  const handlePartySelect = (party) => {
    setSelectedParty(party);
  };

  const handleVote = () => {
    if (!selectedParty) {
      setError('Please select a party to vote for');
      return;
    }
    setShowFaceDialog(true);
  };
const handleFaceVerified = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/election/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        electionId: selectedElection,
        partyId: selectedParty._id
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit vote');
    }

    // Update UI and local storage
    setShowFaceDialog(false);
    setHasVoted(true);
    setVoteSuccess(true);

    const userData = JSON.parse(localStorage.getItem('user'));
    userData.votes = userData.votes || [];
    userData.votes.push({
      election: selectedElection,
      party: selectedParty._id,
      votedAt: new Date().toISOString()
    });
    localStorage.setItem('user', JSON.stringify(userData));

  } catch (err) {
    console.error('Voting error:', err);
    setError(err.message);
    setShowFaceDialog(false);
  }
};

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { key: 'home', label: 'Dashboard', icon: <Home /> },
    { key: 'vote', label: 'Cast Vote', icon: <HowToVote /> },
    { key: 'history', label: 'Voting History', icon: <History /> },
    { key: 'results', label: 'Election Results', icon: <BarChart /> },
    { key: 'profile', label: 'My Profile', icon: <Person /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.name || 'Voter'}!
            </Typography>
            <Typography variant="body1" paragraph>
              You are registered to vote in the upcoming elections. Please review the available
              elections and cast your vote when ready.
            </Typography>

            {hasVoted && (
              <Alert severity="success" icon={<VerifiedUser />} sx={{ mb: 3 }}>
                You've already voted in the current election. Thank you for participating!
              </Alert>
            )}

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Voter Information
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Name:</strong> {user?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>Voter ID:</strong> {user?.voterId || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {hasVoted ? 'Voted' : 'Not Voted'}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<HowToVote />}
                    onClick={() => setActiveTab('vote')}
                    sx={{ mb: 2, width: '100%' }}
                  >
                    Cast Your Vote
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BarChart />}
                    onClick={() => setActiveTab('results')}
                    sx={{ width: '100%' }}
                  >
                    View Results
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );
      case 'vote':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Cast Your Vote
            </Typography>

            {voteSuccess ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                Your vote has been successfully recorded for {selectedParty.name} in the election.
                Thank you for participating!
              </Alert>
            ) : (
              <>
                <Typography variant="body1" paragraph>
                  Please follow these steps to cast your vote:
                </Typography>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Event sx={{ mr: 1 }} /> 1. Select an Election
                  </Typography>
                  {elections.length === 0 ? (
                    <Alert severity="info">No active elections available at this time.</Alert>
                  ) : (
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="election-select-label">Select Election</InputLabel>
                      <Select
                        labelId="election-select-label"
                        value={selectedElection || ''}
                        label="Select Election"
                        onChange={(e) => handleElectionSelect(e.target.value)}
                      >
                        {elections.map((election) => (
                          <MenuItem key={election._id} value={election._id}>
                            {election.title} ({new Date(election.startDate).toLocaleDateString()} - {new Date(election.endDate).toLocaleDateString()})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>

                {selectedElection && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Groups sx={{ mr: 1 }} /> 2. Select a Party
                    </Typography>
                    {loading ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : parties.length === 0 ? (
                      <Alert severity="info">No parties available for this election</Alert>
                    ) : (
                      <Grid container spacing={3}>
                        {parties.map((party) => (
                          <Grid item xs={12} sm={6} md={4} key={party._id}>
                            <StyledCard
                              onClick={() => handlePartySelect(party)}
                              sx={{
                                border: selectedParty?._id === party._id ? `2px solid ${theme.palette.primary.main}` : 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="140"
                                image={party.partySymbol || party.partySymbol || '/default-party.png'}
                                alt={party.name}
                                sx={{ objectFit: 'contain', p: 2 }}
                              />
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {party.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {party.description || 'No description available'}
                                </Typography>
                                {party.leader && (
                                  <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                    <Avatar src={party.leader.image} sx={{ mr: 1.5 }} />
                                    <Typography variant="body2">
                                      <strong>Leader:</strong> {party.leader.name}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </StyledCard>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </Box>
                )}

                {selectedParty && (
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      You are about to vote for: <strong>{selectedParty.name}</strong>
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Please confirm your selection. This action cannot be undone.
                    </Typography>
                    <VoteButton
                      variant="contained"
                      size="large"
                      startIcon={<HowToReg />}
                      onClick={handleVote}
                      disabled={hasVoted}
                      sx={{ px: 4, py: 2 }}
                    >
                      {hasVoted ? 'Already Voted' : 'Confirm Vote'}
                    </VoteButton>
                  </Box>
                )}
              </>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 3 }}>
                {error}
              </Alert>
            )}
          </Box>
        );
      case 'results':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Election Results
            </Typography>
            <Typography variant="body1" paragraph>
              Current standings in the elections will be displayed here once voting is complete.
            </Typography>
          </Box>
        );
      default:
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              {navItems.find(item => item.key === activeTab)?.label || 'Dashboard'}
            </Typography>
          </Box>
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Sidebar Navigation */}
      <Paper
        elevation={3}
        sx={{
          width: 280,
          minHeight: '100vh',
          borderRadius: 0,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2 }}>
          <Avatar src="/voter-icon.png" sx={{ mr: 2 }} />
          <Box>
            <Typography variant="subtitle1">{user?.name || 'Voter'}</Typography>
            <Typography variant="caption">Voter ID: {user?.voterId?.slice(0, 8)}...</Typography>
          </Box>
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', mb: 2 }} />

        <Box sx={{ mb: 2 }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              startIcon={item.icon}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                color: activeTab === item.key ? theme.palette.primary.main : 'inherit',
                bgcolor: activeTab === item.key ? theme.palette.background.paper : 'transparent',
                mb: 0.5,
                '&:hover': {
                  bgcolor: activeTab === item.key ? theme.palette.background.paper : 'rgba(255,255,255,0.1)',
                }
              }}
              onClick={() => {
                setActiveTab(item.key);
                setError('');
                setVoteSuccess(false);
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />

        <Button
          startIcon={<Logout />}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            color: 'inherit',
            '&:hover': {
              bgcolor: 'rgba(255,255,255,0.1)',
            }
          }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Paper>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {renderContent()}
      </Box>

      {/* Face Verification Dialog */}
    <FaceVerificationDialog
  open={showFaceDialog}
  onClose={() => setShowFaceDialog(false)}
  onVerified={handleFaceVerified}
  party={selectedParty}
  electionId={selectedElection}  // Add this prop
/>
    </Box>
  );
};

export default VoterDashboard;