const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const sessionsRouter = require('./routes/sessions');
const teamsRouter = require('./routes/teams');
const roundsRouter = require('./routes/rounds');
const scoresRouter = require('./routes/scores');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/sessions', sessionsRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/rounds', roundsRouter);
app.use('/api/scores', scoresRouter);

module.exports = app;
