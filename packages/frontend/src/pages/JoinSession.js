import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper
} from '@mui/material';
import { joinSession } from '../api';

export default function JoinSession() {
  const [joinCode, setJoinCode] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const joined = await joinSession({
        joinCode: joinCode.trim().toUpperCase(),
        name
      });
      setResult(joined);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join session');
    }
  };

  if (result) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">You're in!</Typography>
          <Alert severity="success">
            {result.team.name} joined {result.session.name}.
          </Alert>
          <Typography color="text.secondary">
            Sit tight — the host will start the rounds soon.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to={`/session/${result.session.id}/leaderboard`}
          >
            View leaderboard
          </Button>
          <Button onClick={() => setResult(null)}>Join another</Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h5">Join a session</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Join code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            required
            inputProps={{ 'aria-label': 'Join code', maxLength: 6 }}
          />
          <TextField
            label="Team name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            inputProps={{ 'aria-label': 'Team name' }}
          />
          <Button type="submit" variant="contained">
            Join
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
