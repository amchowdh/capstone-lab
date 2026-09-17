import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import Home from './pages/Home';
import CreateSession from './pages/CreateSession';
import JoinSession from './pages/JoinSession';

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ color: 'inherit', textDecoration: 'none', flexGrow: 1 }}
          >
            Trivia Night
          </Typography>
          <Button color="inherit" component={Link} to="/create">
            Host
          </Button>
          <Button color="inherit" component={Link} to="/join">
            Join
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateSession />} />
            <Route path="/join" element={<JoinSession />} />
          </Routes>
        </Box>
      </Container>
    </>
  );
}
