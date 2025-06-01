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
  Avatar,
  Button,
  TextField,
  IconButton,
  MenuItem,
  Pagination,
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';

const Voters = () => {
  const [voters, setVoters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const mockVoters = Array.from({ length: 50 }, (_, i) => ({
      id: `voter-${i + 1}`,
      name: `Voter ${i + 1}`,
      voterId: `VOT${Math.floor(100000 + Math.random() * 900000)}`,
      age: Math.floor(18 + Math.random() * 50),
      gender: ['male', 'female'][Math.floor(Math.random() * 2)],
      constituency: `Constituency ${Math.floor(1 + Math.random() * 10)}`,
      voted: Math.random() > 0.3,
    }));
    setVoters(mockVoters);
    setLoading(false);
  }, []);

  const filteredVoters = voters.filter(voter => {
    const matchesSearch = voter.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         voter.voterId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'voted' && voter.voted) || 
                         (filter === 'notVoted' && !voter.voted);
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Voters List
      </Typography>
      
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
        <Typography>Loading...</Typography>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voter ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Constituency</TableCell>
                  <TableCell>Voted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedVoters.map((voter) => (
                  <TableRow key={voter.id}>
                    <TableCell>{voter.voterId}</TableCell>
                    <TableCell>{voter.name}</TableCell>
                    <TableCell>{voter.age}</TableCell>
                    <TableCell>
                      {voter.gender.charAt(0).toUpperCase() + voter.gender.slice(1)}
                    </TableCell>
                    <TableCell>{voter.constituency}</TableCell>
                    <TableCell>
                      {voter.voted ? (
                        <Typography color="success.main">Yes</Typography>
                      ) : (
                        <Typography color="error.main">No</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <Edit color="primary" />
                      </IconButton>
                      <IconButton>
                        <Delete color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
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