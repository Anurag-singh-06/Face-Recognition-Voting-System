import { Box, Button, Container, Typography, Paper, Stack, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import votingPeople from '../assets/img.webp';

const Home = () => {
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      }}
    >
      {/* First div: Full image */}
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 220, md: '100vh' },
          width: { xs: '100%', md: '50vw' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Box
          component="img"
          src={votingPeople}
          alt="People voting"
          sx={{
            width: '95%',
            height: '70%',
            objectFit: 'cover',
            minHeight: 220,
            marginLeft:"30px",
            borderRadius: '24px'
          }}
        />
      </Box>

      {/* Second div: Content section */}
      <Box
        sx={{
          flex: 1,
          minHeight: { xs: 320, md: '100vh' },
          width: { xs: '100%', md: '40vw' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, md: 8 },
          py: { xs: 4, md: 0 },
        }}
      >
        <HowToVoteIcon sx={{ fontSize: 70, color: 'primary.main', mb: 2 }} />
        <Typography
          component="h1"
          variant="h3"
          color="primary"
          fontWeight={700}
          align="center"
          gutterBottom
        >
          iVoteSecure
        </Typography>
        <Typography align="center" color="text.secondary" sx={{ mb: 2, fontSize: 18 }}>
          Secure, Fast, and Modern Online Voting Platform<br />
          Cast your vote with confidence and innovation.
        </Typography>
        <Stack spacing={2} sx={{ width: '100%', maxWidth: 400 }}>
        <Button
            variant="contained"
            color="secondary"
            size="large"
            fullWidth
            onClick={() => navigate('/register')}
          >
            Register as Voter
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={() => navigate('/login')}
          >
            Voter Login
          </Button>          
          <Button
            variant="outlined"
            color="error"
            size="large"
            fullWidth
            onClick={() => navigate('/admin/login')}
            sx={{ borderRadius: 2, height: 50, fontSize: 18 }}
          >
            Admin Login
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;
