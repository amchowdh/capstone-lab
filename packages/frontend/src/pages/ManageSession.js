import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider
} from '@mui/material';
import {
  getSession,
  listTeams,
  listRounds,
  addRound,
  listScores,
  upsertScore
} from '../api';

// Host screen: add rounds to a session and enter/edit each team's score.
export default function ManageSession() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [teams, setTeams] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [scores, setScores] = useState([]);
  const [category, setCategory] = useState('');
  const [maxPoints, setMaxPoints] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, t, r, sc] = await Promise.all([
        getSession(id),
        listTeams(id),
        listRounds(id),
        listScores(id)
      ]);
      setSession(s);
      setTeams(t);
      setRounds(r);
      setScores(sc);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load session');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddRound = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await addRound({ sessionId: Number(id), category, maxPoints: Number(maxPoints) });
      setCategory('');
      setMaxPoints('');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add round');
    }
  };

  const scoreFor = (roundId, teamId) => {
    const found = scores.find((s) => s.roundId === roundId && s.teamId === teamId);
    return found ? found.points : '';
  };

  const handleScoreChange = async (roundId, teamId, value) => {
    if (value === '') return;
    setError('');
    try {
      await upsertScore({ roundId, teamId, points: Number(value) });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save score');
    }
  };

  if (!session) {
    return (
      <Paper sx={{ p: 3 }}>
        {error ? <Alert severity="error">{error}</Alert> : <Typography>Loading…</Typography>}
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h5">{session.name}</Typography>
          <Typography color="text.secondary">
            Join code: <strong>{session.joinCode}</strong> · {teams.length} team
            {teams.length === 1 ? '' : 's'} joined
          </Typography>
          <Button
            variant="outlined"
            component={Link}
            to={`/session/${session.id}/leaderboard`}
            sx={{ alignSelf: 'flex-start' }}
          >
            View leaderboard
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleAddRound}>
          <Stack spacing={2}>
            <Typography variant="h6">Add a round</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              inputProps={{ 'aria-label': 'Round category' }}
            />
            <TextField
              label="Max points"
              type="number"
              value={maxPoints}
              onChange={(e) => setMaxPoints(e.target.value)}
              required
              inputProps={{ 'aria-label': 'Max points', min: 1 }}
            />
            <Button type="submit" variant="contained">
              Add round
            </Button>
          </Stack>
        </form>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6">Scores</Typography>
          {rounds.length === 0 && (
            <Typography color="text.secondary">
              Add a round to start scoring.
            </Typography>
          )}
          {teams.length === 0 && rounds.length > 0 && (
            <Typography color="text.secondary">
              No teams have joined yet.
            </Typography>
          )}
          {rounds.map((round) => (
            <div key={round.id}>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                Round {round.roundNumber}: {round.category} (max {round.maxPoints})
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell>{team.name}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          defaultValue={scoreFor(round.id, team.id)}
                          onBlur={(e) =>
                            handleScoreChange(round.id, team.id, e.target.value)
                          }
                          inputProps={{
                            'aria-label': `Points for ${team.name} in round ${round.roundNumber}`,
                            min: 0,
                            max: round.maxPoints
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ mt: 1 }} />
            </div>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
