import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoters = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/voter/allVoters', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Filter only users with role 'voter'
        const voterUsers = response.data.filter(user => user.role === 'voter');
        setVoters(voterUsers);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch voters');
        setLoading(false);
        console.error('Error fetching voters:', err);
      }
    };

    fetchVoters();
  }, []);

  const filteredVoters = voters.filter(voter => {
    const matchesSearch = 
      (voter.name && voter.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (voter.voterId && voter.voterId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (voter.email && voter.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'voted' && voter.hasVoted) || 
      (filter === 'notVoted' && !voter.hasVoted);
    
    return matchesSearch && matchesFilter;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVoters.length / itemsPerPage);
  const paginatedVoters = filteredVoters.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDeleteVoter = async (voterId) => {
    if (!window.confirm('Are you sure you want to delete this voter?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${voterId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVoters(voters.filter(voter => voter._id !== voterId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete voter');
      console.error('Error deleting voter:', err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Voters List
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Search voters..."
            InputProps={{
              startAdornment: <Search />,
            }}
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <TextField
            select
            variant="outlined"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="all">All Voters</MenuItem>
            <MenuItem value="voted">Voted</MenuItem>
            <MenuItem value="notVoted">Not Voted</MenuItem>
          </TextField>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voter ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Constituency</TableCell>
                  <TableCell>Voting Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedVoters.length > 0 ? (
                  paginatedVoters.map((voter) => (
                    <TableRow key={voter._id}>
                      <TableCell>{voter.voterId || 'N/A'}</TableCell>
                      <TableCell>{voter.name || 'N/A'}</TableCell>
                      <TableCell>{voter.email}</TableCell>
                      <TableCell>{voter.constituency || 'N/A'}</TableCell>
                      <TableCell>
                        {voter.hasVoted ? (
                          <Typography color="success.main">Voted</Typography>
                        ) : (
                          <Typography color="error.main">Not Voted</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton>
                          <Edit color="primary" />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteVoter(voter._id)}>
                          <Delete color="error" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No voters found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}

          <Typography variant="body2" sx={{ mt: 2 }}>
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(page * itemsPerPage, filteredVoters.length)} of{' '}
            {filteredVoters.length} voters
          </Typography>
        </>
      )}
    </Box>
  );
};

export default Voters;