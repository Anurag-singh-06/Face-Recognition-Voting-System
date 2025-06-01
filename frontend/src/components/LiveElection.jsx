import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';

const LiveElection = () => {
  const [selectedElection, setSelectedElection] = useState('');
  const [results, setResults] = useState([]);
  const [constituencies, setConstituencies] = useState([]);
  const [selectedConstituency, setSelectedConstituency] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call for elections
    const mockElections = [
      { id: '1', title: 'General Election 2024' },
    ];
    setSelectedElection('1');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedElection) {
      // Simulate API call for constituencies
      const mockConstituencies = Array.from({ length: 10 }, (_, i) => ({
        id: `const-${i + 1}`,
        name: `Constituency ${i + 1}`,
      }));
      setConstituencies(mockConstituencies);

      // Simulate API call for results
      const mockResults = [
        { party: 'BJP', seats: 125, votes: 45.2, color: '#FF9933' },
        { party: 'INC', seats: 85, votes: 32.7, color: '#138808' },
        { party: 'AAP', seats: 40, votes: 12.1, color: '#000080' },
        { party: 'Others', seats: 50, votes: 10.0, color: '#808080' },
      ];
      setResults(mockResults);

      // Update last updated time
      setLastUpdated(new Date());
    }
  }, [selectedElection]);

  const handleRefresh = () => {
    // Simulate refresh
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  const totalSeats = results.reduce((sum, party) => sum + party.seats, 0);
  const totalVotes = results.reduce((sum, party) => sum + party.votes, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Live Election Monitoring</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">National Overview</Typography>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Constituency</InputLabel>
                <Select
                  value={selectedConstituency}
                  onChange={(e) => setSelectedConstituency(e.target.value)}
                  label="Constituency"
                >
                  <MenuItem value="all">All Constituencies</MenuItem>
                  {constituencies.map((constituency) => (
                    <MenuItem key={constituency.id} value={constituency.id}>
                      {constituency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Party</TableCell>
                    <TableCell align="right">Seats Won</TableCell>
                    <TableCell align="right">Vote %</TableCell>
                    <TableCell>Progress</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((party) => (
                    <TableRow key={party.party}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: party.color,
                              mr: 1,
                            }}
                          />
                          {party.party}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {party.seats} ({((party.seats / totalSeats) * 100).toFixed(1)}%)
                      </TableCell>
                      <TableCell align="right">{party.votes}%</TableCell>
                      <TableCell>
                        <LinearProgress
                          variant="determinate"
                          value={(party.seats / totalSeats) * 100}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: party.color,
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Election Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Constituencies
                </Typography>
                <Typography variant="h4">{constituencies.length}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Results Declared
                </Typography>
                <Typography variant="h4">
                  {Math.floor(constituencies.length * 0.8)} / {constituencies.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={80}
                  sx={{ height: 8, mt: 1 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Voter Turnout
                </Typography>
                <Typography variant="h4">67.4%</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Updates
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography fontWeight="bold">
                  Constituency 5: BJP candidate wins by 12,345 votes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  2 minutes ago
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">
                  Constituency 8: Close contest between INC and BJP
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  15 minutes ago
                </Typography>
              </Box>
              <Box>
                <Typography fontWeight="bold">
                  Voter turnout reaches 65% nationwide
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  1 hour ago
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LiveElection;