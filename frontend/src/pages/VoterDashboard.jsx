import { useState, useEffect } from 'react';
import FaceVerificationDialog from '../components/FaceVerificationDialog';
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
  CardActions,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const VoterDashboard = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const [hasVoted, setHasVoted] = useState(false);
const [showFaceDialog, setShowFaceDialog] = useState(false); // Only open when voting
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchCandidates();
    checkVoteStatus();
    setShowFaceDialog(false); // Ensure face dialog is closed on mount/login
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/voter/candidates', {
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

  const checkVoteStatus = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData && userData.hasVoted) {
        setHasVoted(true);
      }
    } catch (err) {
      console.error('Error checking vote status:', err);
    }
  };

  const handleVote = (candidate) => {
    setSelectedCandidate(candidate);
    setShowFaceDialog(true);
  };

  

  // Called after successful face verification
  const handleFaceVerified = () => {
    setShowFaceDialog(false);
    setHasVoted(true);
    // Optionally update local storage
    const userData = JSON.parse(localStorage.getItem('user'));
    userData.hasVoted = true;
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <FaceVerificationDialog
        open={showFaceDialog}
        onClose={() => setShowFaceDialog(false)}
        onVerified={handleFaceVerified}
        candidate={selectedCandidate}
      />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
              <Typography component="h1" variant="h4">
                Voter Dashboard
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

            {hasVoted ? (
              <Alert severity="success" sx={{ mb: 4 }}>
                Thank you for voting! Your vote has been recorded.
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 4 }}>
                Please select a candidate to cast your vote.
              </Alert>
            )}

            <Grid container spacing={2}>
              {candidates.map((candidate) => (
                <Grid item xs={40} sm={6} md={4} key={candidate._id}>
                  <Card>
                    <CardMedia
                      component="img"
                      height="140"
                      image={candidate.partySymbol}
                      alt={candidate.partyName}
                    />
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {candidate.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Party: {candidate.partyName}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleVote(candidate)}
                        disabled={hasVoted}
                      >
                        Vote
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default VoterDashboard;
