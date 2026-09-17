import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Stack,
  Alert
} from '@mui/material';
import { getSession, getLeaderboard } from '../api';

// Live leaderboard screen — implemented to match
// docs/artifacts/leaderboard-ui-sketch.png.
export default function Leaderboard() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [board, setBoard] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, b] = await Promise.all([getSession(id), getLeaderboard(id)]);
      setSession(s);
      setBoard(b);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load leaderboard');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }
  if (!session || !board) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Loading…</Typography>
      </Paper>
    );
  }

  const { standings, roundsTotal, roundsScored } = board;

  return (
    <Paper
      elevation={3}
      sx={{ borderRadius: 3, overflow: 'hidden' }}
      aria-label="Live leaderboard"
    >
      {/* Brand header band */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 3,
          py: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
            TRIVIA NIGHT
          </Typography>
          <Typography variant="subtitle2">Live Leaderboard</Typography>
        </Box>
        <Typography variant="subtitle1">
          Round {roundsScored} of {roundsTotal} scored
        </Typography>
      </Box>

      <Box sx={{ p: 2 }}>
        {standings.length === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            Waiting for teams…
          </Typography>
        ) : roundsScored === 0 ? (
          <Typography color="text.secondary" sx={{ p: 2 }}>
            No scores yet — standings appear as the host enters scores.
          </Typography>
        ) : (
          <Table>
            <TableBody>
              {standings.map((row) => {
                const isFirst = row.rank === 1;
                return (
                  <TableRow
                    key={row.teamId}
                    sx={{
                      '& td': { borderBottom: 'none' },
                      bgcolor: isFirst ? 'primary.light' : 'transparent'
                    }}
                  >
                    <TableCell sx={{ width: 72 }}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="h6">{row.rank}</Typography>
                        {isFirst && (
                          <Box
                            component="span"
                            aria-label="First place"
                            sx={{ color: 'primary.main', fontSize: 20, lineHeight: 1 }}
                          >
                            ★
                          </Box>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">{row.teamName}</Typography>
                        {row.tied && (
                          <Chip
                            label="TIE"
                            size="small"
                            sx={{ bgcolor: '#ffe082', color: '#5a4600' }}
                          />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="h6"
                        color={isFirst ? 'primary.main' : 'text.primary'}
                      >
                        {row.totalPoints}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Box>

      <Box sx={{ px: 3, py: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          Updates after each round is scored · missing score = 0
        </Typography>
      </Box>
    </Paper>
  );
}
