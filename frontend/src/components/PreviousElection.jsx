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
  Button,
  Chip,
} from '@mui/material';
import { Link } from 'react-router-dom';

const PreviousElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchElections = async () => {
      try {
        // Replace with actual API call
        const mockData = [
          {
            id: '1',
            title: 'General Election 2024',
            type: 'National',
            startDate: '2024-04-10',
            endDate: '2024-04-20',
            status: 'completed',
            totalVoters: 850000000,
            turnoutPercentage: 67.4,
          },
          {
            id: '2',
            title: 'State Assembly Elections 2023',
            type: 'State',
            startDate: '2023-11-15',
            endDate: '2023-11-25',
            status: 'completed',
            totalVoters: 150000000,
            turnoutPercentage: 72.1,
          },
        ];
        setElections(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching elections:', error);
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'ongoing': return 'warning';
      case 'upcoming': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Previous Elections
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Voter Turnout</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {elections.map((election) => (
                <TableRow key={election.id}>
                  <TableCell>{election.title}</TableCell>
                  <TableCell>{election.type}</TableCell>
                  <TableCell>
                    {new Date(election.startDate).toLocaleDateString()} -{' '}
                    {new Date(election.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={election.status} 
                      color={getStatusColor(election.status)} 
                    />
                  </TableCell>
                  <TableCell>
                    {election.turnoutPercentage}% of {election.totalVoters.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button 
                      component={Link}
                      to={`/elections/${election.id}`}
                      variant="outlined"
                      size="small"
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default PreviousElections;