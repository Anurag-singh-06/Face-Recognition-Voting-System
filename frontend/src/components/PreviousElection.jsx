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
  Chip,
  Stack,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';
import { EmojiEvents, CalendarToday, Description } from '@mui/icons-material';

const PreviousElection = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchPreviousElections = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/election/previous', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setElections(res.data.elections || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch previous elections');
      } finally {
        setLoading(false);
      }
    };

    fetchPreviousElections();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: isMobile ? 2 : 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: theme.palette.primary.main,
          mb: 4,
          textAlign: 'center'
        }}
      >
        Previous Elections
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="body1">{error}</Typography>
        </Alert>
      ) : elections.length === 0 ? (
        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body1">No previous elections found.</Typography>
        </Alert>
      ) : (
        <Grid container spacing={4}>
          {elections.map((election) => {
            const winnerParty = election.parties?.find(
              (party) => party._id === election.winnerParty
            );

            return (
              <Grid item xs={12} md={6} key={election._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 3,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    }
                  }}
                >
                <CardHeader
  title={
    <Typography variant="h6" fontWeight="600">
      {election.title}
    </Typography>
  }
  subheader={
    <Stack 
      direction="row" 
      spacing={1} 
      alignItems="center"
      justifyContent="space-between"
      width="100%"
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <CalendarToday fontSize="small" color="action" />
        <Typography variant="body2" color="text.secondary">
          {formatDate(election.startDate)} - {formatDate(election.endDate)}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip 
          label={`${election.voters?.length || 0} voters`} 
          size="small" 
          color="info"
          variant="outlined"
        />
        {winnerParty ? (
          <Stack 
            direction="row" 
            alignItems="center" 
            spacing={1}
            sx={{ 
              backgroundColor: theme.palette.success.light,
              p: 1,
              borderRadius: 1
            }}
          >
            <EmojiEvents color="success" />
            <Avatar 
              src={winnerParty.symbol} 
              alt={winnerParty.partyName} 
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="subtitle2" color="success.dark" fontWeight="500">
              {winnerParty.partyName}
            </Typography>
          </Stack>
        ) : (
          <Chip 
            label="Result Pending" 
            color="warning" 
            variant="outlined"
            size="small"
          />
        )}
      </Stack>
    </Stack>
  }
  sx={{
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiCardHeader-content': {
      overflow: 'visible' // Ensures long titles don't push elements
    }
  }}
/>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <Description color="action" />
                      <Typography variant="subtitle1" color="text.primary">
                        Description
                      </Typography>
                    </Stack>
                    <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                      {election.description || 'No description provided.'}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {election.parties && election.parties.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Participating Parties ({election.parties.length})
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {election.parties.map((party) => (
                            <Chip
                              key={party._id}
                              label={party.partyName}
                              avatar={<Avatar src={party.symbol} sx={{ width: 24, height: 24 }} />}
                              variant="outlined"
                              size="medium"
                              sx={{
                                '& .MuiChip-avatar': {
                                  width: 24,
                                  height: 24
                                }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PreviousElection;