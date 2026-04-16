const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const User = require('./models/User');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/medicare-auth';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@medicare.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

async function seedAdmin() {
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({ name: 'Admin', email: ADMIN_EMAIL, password: hashed, role: 'admin' });
    console.log(`Default admin created — email: ${ADMIN_EMAIL}  password: ${ADMIN_PASSWORD}`);
  }
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
