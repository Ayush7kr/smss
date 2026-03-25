const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to master database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/complaints', require('./src/routes/complaintRoutes'));
app.use('/api/visitors', require('./src/routes/visitorRoutes'));
app.use('/api/vendors', require('./src/routes/vendorRoutes'));
app.use('/api/billing', require('./src/routes/billingRoutes'));
app.use('/api/dashboard', require('./src/routes/analyticsRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/notices', require('./src/routes/noticeRoutes'));
app.use('/api/superadmin', require('./src/routes/superAdminRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
