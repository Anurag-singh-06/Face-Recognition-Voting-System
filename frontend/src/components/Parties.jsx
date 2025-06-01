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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentParty, setCurrentParty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const mockParties = [
      {
        id: '1',
        name: 'Bharatiya Janata Party',
        abbreviation: 'BJP',
        symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1200px-Bharatiya_Janata_Party_logo.svg.png',
        foundedYear: '1980',
        president: 'J.P. Nadda',
      },
      {
        id: '2',
        name: 'Indian National Congress',
        abbreviation: 'INC',
        symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Indian_National_Congress_hand_logo.svg/1200px-Indian_National_Congress_hand_logo.svg.png',
        foundedYear: '1885',
        president: 'Mallikarjun Kharge',
      },
    ];
    setParties(mockParties);
    setLoading(false);
  }, []);

  const handleOpenDialog = (party = null) => {
    setCurrentParty(party);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentParty(null);
  };

  const handleDeleteParty = (id) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      // API call to delete party would go here
      setParties(parties.filter(party => party.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call to save party would go here
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Political Parties</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Party
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Abbreviation</TableCell>
                <TableCell>Founded</TableCell>
                <TableCell>President</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parties.map((party) => (
                <TableRow key={party.id}>
                  <TableCell>
                    <Avatar src={party.symbol} alt={party.name} />
                  </TableCell>
                  <TableCell>{party.name}</TableCell>
                  <TableCell>{party.abbreviation}</TableCell>
                  <TableCell>{party.foundedYear}</TableCell>
                  <TableCell>{party.president}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(party)}>
                      <Edit color="primary" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteParty(party.id)}>
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
        <DialogTitle>
          {currentParty ? 'Edit Party' : 'Add New Party'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              fullWidth
              label="Party Name"
              defaultValue={currentParty?.name || ''}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Abbreviation"
              defaultValue={currentParty?.abbreviation || ''}
              required
            />
            <TextField
              margin="normal"
              fullWidth
              label="Symbol URL"
              defaultValue={currentParty?.symbol || ''}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Founded Year"
              type="number"
              defaultValue={currentParty?.foundedYear || ''}
            />
            <TextField
              margin="normal"
              fullWidth
              label="President"
              defaultValue={currentParty?.president || ''}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentParty ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Parties;