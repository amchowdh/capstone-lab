const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const sessionsRouter = require('./routes/sessions');
const teamsRouter = require('./routes/teams');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/sessions', sessionsRouter);
app.use('/api/teams', teamsRouter);

module.exports = app;
