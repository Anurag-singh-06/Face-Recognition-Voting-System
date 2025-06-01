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
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Checkbox,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
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
    fetchCandidates();
  }, []);

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

  const handleDeleteCandidate = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/candidates/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete candidate');
      }

      fetchCandidates();
    } catch (err) {
      setError(err.message);
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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Typography component="h1" variant="h4">
            चुनाव आयोग नियंत्रण केंद्र 
            </Typography>
            <Button variant="outlined" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowAddDialog(true)}
                >
                  Add Candidate
                </Button>
              </Grid>
              <Grid item>
                {deleteMode ? (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleDeleteSelected}
                    disabled={selectedCandidates.length === 0}
                  >
                    Delete Selected ({selectedCandidates.length})
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleToggleDeleteMode}
                  >
                    Delete Candidates
                  </Button>
                )}
              </Grid>

              <Grid item>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleResetVotes}
                >
                  Reset All Votes
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="info"
                  onClick={handleViewResults}
                >
                  View Results
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {candidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate._id}>
                <Card sx={{
                  position: 'relative',
                  opacity: deleteMode && !selectedCandidates.includes(candidate._id) ? 0.7 : 1
                }}>
                  {deleteMode && (
                    <Checkbox
                      checked={selectedCandidates.includes(candidate._id)}
                      onChange={() => handleToggleSelect(candidate._id)}
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)'
                        }
                      }}
                    />
                  )}
                  <CardMedia
                    component="img"
                    height="140"
                    image={candidate.partySymbol}
                    alt={candidate.partyName}
                    sx={{
                      cursor: deleteMode ? 'pointer' : 'default'
                    }}
                    onClick={() => deleteMode && handleToggleSelect(candidate._id)}
                  />
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {candidate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Party: {candidate.partyName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Votes: {candidate.votes}
                    </Typography>
                  </CardContent>
                  <CardActions>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
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
    </Container>
  );
};

export default AdminDashboard;
