import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Save, RestartAlt, Delete, Add, Info } from '@mui/icons-material';
import axios from 'axios';

const CreateElection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [electionData, setElectionData] = useState({
    title: '',
    description: '',
    electionType: 'general',
    startDate: '',
    endDate: '',
    parties: [],
    status: 'draft'
  });

  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingParties, setFetchingParties] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchParties = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/admin/candidates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParties(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load parties');
      } finally {
        setFetchingParties(false);
      }
    };
    fetchParties();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setElectionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddParty = (partyId) => {
    if (!electionData.parties.includes(partyId)) {
      setElectionData((prev) => ({
        ...prev,
        parties: [...prev.parties, partyId]
      }));
    }
  };

  const handleRemoveParty = (partyId) => {
    setElectionData((prev) => ({
      ...prev,
      parties: prev.parties.filter((id) => id !== partyId)
    }));
  };

  const handleReset = () => {
    setElectionData({
      title: '',
      description: '',
      electionType: 'general',
      startDate: '',
      endDate: '',
      parties: [],
      status: 'draft'
    });
    setError('');
    setSuccess('');
  };

  const validateDate = (dateString) => !isNaN(Date.parse(dateString));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { title, startDate, endDate, parties } = electionData;

    if (!title || !startDate || !endDate) {
      return setError('All required fields must be filled');
    }

    if (!validateDate(startDate) || !validateDate(endDate)) {
      return setError('Invalid date format');
    }

    if (new Date(startDate) > new Date(endDate)) {
      return setError('End date must be after start date');
    }

    if (!parties || parties.length === 0) {
      return setError('Select at least one party');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const partyIds = parties.map(party => typeof party === 'string' ? party : party._id);

      await axios.post(
        'http://localhost:5000/api/election/add',
        {
          title,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          parties: partyIds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      handleReset();
      setTimeout(() => setSuccess('Election created successfully!'), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: 900, 
      mx: 'auto', 
      p: isMobile ? 2 : 4,
      '& .MuiFormHelperText-root': {
        ml: 0
      }
    }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: theme.palette.primary.main,
          mb: 3,
          textAlign: 'center'
        }}
      >
        Create New Election
      </Typography>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      <Paper 
        sx={{ 
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          boxShadow: theme.shadows[3]
        }} 
        component="form" 
        onSubmit={handleSubmit}
      >
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Info color="primary" />
            Basic Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Election Title"
                name="title"
                value={electionData.title}
                onChange={handleChange}
                required
                fullWidth
                size="small"
                helperText="Enter a descriptive title for the election"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description (Optional)"
                name="description"
                value={electionData.description}
                onChange={handleChange}
                multiline
                minRows={1}
                fullWidth
                size="small"
                helperText="Provide additional details about this election"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Start Date"
                name="startDate"
                type="date"
                value={electionData.startDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                size="small"
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="End Date"
                name="endDate"
                type="date"
                value={electionData.endDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                required
                size="small"
                error={
                  electionData.startDate &&
                  electionData.endDate &&
                  new Date(electionData.startDate) > new Date(electionData.endDate)
                }
                helperText={
                  electionData.startDate &&
                  electionData.endDate &&
                  new Date(electionData.startDate) > new Date(electionData.endDate)
                    ? 'End date must be after start date'
                    : 'Election end date and time'
                }
                inputProps={{
                  min: electionData.startDate || new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Election Type</InputLabel>
                <Select
                  name="electionType"
                  value={electionData.electionType}
                  onChange={handleChange}
                  label="Election Type"
                >
                  <MenuItem value="general">General Election</MenuItem>
                  <MenuItem value="primary">Primary Election</MenuItem>
                  <MenuItem value="referendum">Referendum</MenuItem>
                  <MenuItem value="by-election">By-election</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Add color="primary" />
            Participating Parties
          </Typography>
          <Divider sx={{ mb: 3 }} />
          {fetchingParties ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              <FormControl fullWidth size="small">
                <InputLabel>Add Party</InputLabel>
                <Select
                  value=""
                  onChange={(e) => handleAddParty(e.target.value)}
                  label="Add Party"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300
                      }
                    }
                  }}
                >
                  {parties.filter((p) => !electionData.parties.includes(p._id)).map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar 
                          src={p.symbol} 
                          sx={{ 
                            width: 28, 
                            height: 28,
                            border: `1px solid ${theme.palette.divider}`
                          }} 
                        />
                        <Box>
                          <Typography variant="body1">{p.partyName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.abbreviation}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {electionData.parties.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Selected Parties ({electionData.parties.length})
                  </Typography>
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    useFlexGap 
                    flexWrap="wrap" 
                    sx={{ mt: 1 }}
                  >
                    {electionData.parties.map((id) => {
                      const party = parties.find((p) => p._id === id);
                      if (!party) return null;
                      return (
                        <Chip
                          key={id}
                          avatar={
                            <Avatar 
                              src={party.symbol} 
                              sx={{ 
                                width: 24, 
                                height: 24,
                                border: `1px solid ${theme.palette.divider}`
                              }} 
                            />
                          }
                          label={party.partyName}
                          onDelete={() => handleRemoveParty(id)}
                          deleteIcon={<Delete fontSize="small" />}
                          sx={{ 
                            mb: 1,
                            '& .MuiChip-label': {
                              pr: 0.5
                            }
                          }}
                          variant="outlined"
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Box>

        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: 2,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RestartAlt />}
            onClick={handleReset}
            disabled={loading}
            fullWidth={isMobile}
            sx={{
              order: isMobile ? 2 : 1
            }}
          >
            Reset Form
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <Save />}
            disabled={loading}
            fullWidth={isMobile}
            sx={{
              order: isMobile ? 1 : 2,
              py: 1.5
            }}
          >
            {loading ? 'Creating Election...' : 'Create Election'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateElection;