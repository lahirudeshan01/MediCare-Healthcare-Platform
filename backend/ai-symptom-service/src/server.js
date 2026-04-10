const express = require('express');
const cors = require('cors');
require('dotenv').config();

const symptomRoutes = require('./routes/symptom.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/ai', symptomRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-symptom-service' });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`AI Symptom service running on port ${PORT}`);
});
