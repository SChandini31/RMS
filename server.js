const express = require('express');
require('dotenv').config();
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

// Initialize express app
const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
connectDB();

// Import routes
const publicationRoutes = require('./routes/publicationRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const fundRoutes = require('./routes/fundRoutes');
const documentRoutes = require('./routes/documentRoutes');

console.log({
  publicationRoutes,
  userRoutes,
  projectRoutes,
  proposalRoutes,
  fundRoutes,
  documentRoutes
});

// Use routes
app.use('/api/publications', publicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
// Default route
app.get('/', (req, res) => {
  res.send('RMS Backend is running 🚀');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

