import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Button, Stack } from '@mui/material';

export default function Home() {
  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h4">Welcome to Trivia Night</Typography>
      <Typography color="text.secondary" align="center">
        Hosts run live trivia sessions; teams join with a code and watch the
        live leaderboard.
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" component={Link} to="/create">
          Host a session
        </Button>
        <Button variant="outlined" component={Link} to="/join">
          Join a session
        </Button>
      </Stack>
    </Stack>
  );
}
