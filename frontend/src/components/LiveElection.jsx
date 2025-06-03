import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  CircularProgress,
  Alert,
  Avatar,
  Chip
} from '@mui/material';
import axios from 'axios';
import { EventAvailable } from '@mui/icons-material';

const LiveElections = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLiveElections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/election/live', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Your API returns { elections: [...] }
        const liveElections = res.data.elections || [];

        setElections(liveElections);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch elections');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveElections();
  }, []);

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Live Elections
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : elections.length === 0 ? (
        <Alert severity="info">No live elections currently running.</Alert>
      ) : (
        <Grid container spacing={3}>
          {elections.map((election) => (
            <Grid item xs={12} md={6} key={election._id}>
              <Card>
                <CardHeader
                  avatar={<EventAvailable color="primary" />}
                  title={election.title}
                  subheader={`From: ${new Date(election.startDate).toLocaleDateString()} - To: ${new Date(election.endDate).toLocaleDateString()}`}
                />
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    {election.description || 'No description provided.'}
                  </Typography>

                  {election.parties && election.parties.length > 0 && (
                    <Box mt={2}>
                      <Typography variant="subtitle2">Participating Parties:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                        {election.parties.map((party) => (
                          <Chip
                            key={party._id}
                            label={party.partyName}
                            avatar={<Avatar src={party.symbol} />}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default LiveElections;
