import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Button, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, CircularProgress, Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newCandidate, setNewCandidate] = useState({ name: '', partyName: '', partySymbol: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/candidates', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleOpenDialog = () => {
    setNewCandidate({ name: '', partyName: '', partySymbol: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    setNewCandidate({ ...newCandidate, [e.target.name]: e.target.value });
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/admin/candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newCandidate),
      });
      if (!response.ok) throw new Error('Failed to add candidate');
      fetchCandidates();
      handleCloseDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCandidate = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/candidates/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete candidate');
        fetchCandidates();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDeleteAllCandidates = async () => {
    if (window.confirm('Delete ALL candidates?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/candidates`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to delete all candidates');
        fetchCandidates();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleResetVotes = async () => {
    if (window.confirm('Reset all votes to 0?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/reset-votes`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to reset votes');
        fetchCandidates();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Candidates</Typography>
        <Box>
          <Button variant="outlined" sx={{ mr: 1, ml:8 }} onClick={handleResetVotes}>
            Reset Votes
          </Button>
          <Button variant="outlined" sx={{ mr: 1 }} onClick={handleDeleteAllCandidates}>
            Delete All
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenDialog}>
            Add Candidate
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                 <TableCell>Party Name</TableCell>
                <TableCell>President Name</TableCell>
                <TableCell>Votes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate._id}>
                  <TableCell>
                    <Avatar src={candidate.partySymbol} alt={candidate.partyName} />
                  </TableCell>
                                    <TableCell>{candidate.partyName}</TableCell>
                  <TableCell>{candidate.name}</TableCell>
                  <TableCell>{candidate.votes}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleDeleteCandidate(candidate._id)}>
                      <Delete color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Candidate</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddCandidate} id="candidate-form">
            <TextField
              margin="normal"
              fullWidth
              label="Candidate Name"
              name="name"
              value={newCandidate.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Party Name"
              name="partyName"
              value={newCandidate.partyName}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Party Symbol URL"
              name="partySymbol"
              value={newCandidate.partySymbol}
              onChange={handleInputChange}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button type="submit" form="candidate-form" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Candidates;
