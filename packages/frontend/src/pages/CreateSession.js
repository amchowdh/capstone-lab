import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper
} from '@mui/material';
import { createSession } from '../api';

export default function CreateSession() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [session, setSession] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const created = await createSession({ name, date: date || null });
      setSession(created);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session');
    }
  };

  if (session) {
    return (
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Session created</Typography>
          <Typography>{session.name}</Typography>
          <Alert severity="success">
            Share this join code with teams: <strong>{session.joinCode}</strong>
          </Alert>
          <Button onClick={() => setSession(null)}>Create another</Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h5">Host a new session</Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Session name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            inputProps={{ 'aria-label': 'Session name' }}
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button type="submit" variant="contained">
            Create session
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
