// app.js — clean and correct Express server for your project
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// ----------------------------------
// Core Middleware
// ----------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // For local dev

// ----------------------------------
// Mount API Routes Explicitly (NO tryMountRoute)
// ----------------------------------
const adminRouter = require('./api/admin/index.js');
const bookingsRouter = require('./api/book.js');
const enquiriesRouter = require('./api/enquire.js');
const paymentRouter = require('./api/payment.js');

// ADMIN ROUTES
app.use('/api/admin', adminRouter);

// PUBLIC ROUTES
app.use('/api/book', bookingsRouter);
app.use('/api/enquire', enquiriesRouter);
app.use('/api/payment', paymentRouter);

// ----------------------------------
// Serve Static Front-End
// ----------------------------------
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Access admin.html directly via:
// http://localhost:3000/public/admin.html

// ----------------------------------
// Fallback (ONLY for unknown non-API routes)
// ----------------------------------
app.get('*', (req, res) => {
  // Important: do NOT catch /api/* routes here
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }

  const indexPath = path.join(publicDir, 'index.html');
  res.sendFile(indexPath);
});

// ----------------------------------
// Start Server
// ----------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`App running → http://localhost:${PORT}`)
);
