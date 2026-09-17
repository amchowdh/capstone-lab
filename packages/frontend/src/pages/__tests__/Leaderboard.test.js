import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Leaderboard from '../Leaderboard';
import * as api from '../../api';

vi.mock('../../api');

function renderAt(id = '1') {
  return render(
    <MemoryRouter initialEntries={[`/session/${id}/leaderboard`]}>
      <Routes>
        <Route path="/session/:id/leaderboard" element={<Leaderboard />} />
      </Routes>
    </MemoryRouter>
  );
}

test('renders ranked standings with a TIE chip and progress', async () => {
  api.getSession.mockResolvedValue({ id: 1, name: 'Quiz', joinCode: 'ABC123' });
  api.getLeaderboard.mockResolvedValue({
    roundsTotal: 3,
    roundsScored: 3,
    standings: [
      { teamId: 1, teamName: 'Quiz Lords', totalPoints: 58, rank: 1, tied: false },
      { teamId: 2, teamName: 'Wit', totalPoints: 42, rank: 2, tied: true },
      { teamId: 3, teamName: 'Newton', totalPoints: 42, rank: 2, tied: true }
    ]
  });

  renderAt();

  expect(await screen.findByText('Quiz Lords')).toBeInTheDocument();
  expect(screen.getByText('58')).toBeInTheDocument();
  expect(screen.getByText(/Round 3 of 3 scored/i)).toBeInTheDocument();
  expect(screen.getAllByText('TIE')).toHaveLength(2);
});

test('shows a waiting state when there are no teams', async () => {
  api.getSession.mockResolvedValue({ id: 1, name: 'Quiz', joinCode: 'ABC123' });
  api.getLeaderboard.mockResolvedValue({
    roundsTotal: 0,
    roundsScored: 0,
    standings: []
  });

  renderAt();

  expect(await screen.findByText(/Waiting for teams/i)).toBeInTheDocument();
});

test('shows a Final Results state when the session is closed', async () => {
  api.getSession.mockResolvedValue({ id: 1, name: 'Quiz', joinCode: 'ABC123' });
  api.getLeaderboard.mockResolvedValue({
    isFinal: true,
    roundsTotal: 2,
    roundsScored: 2,
    standings: [
      { teamId: 1, teamName: 'Winners', totalPoints: 20, rank: 1, tied: false }
    ]
  });

  renderAt();

  expect(await screen.findByText('Final Results')).toBeInTheDocument();
  expect(screen.getByText('Winners')).toBeInTheDocument();
});
