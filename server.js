// server.js
// Express backend for bookings/enquiries + optional Supabase + simple admin UI.
// Stores records under /data/*.json and optionally sends email notifications via SMTP.

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const basicAuth = require('basic-auth');
const nodemailer = require('nodemailer');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

require('dotenv').config(); // ensure env loads

// Optional Supabase support (only used if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY present)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    const { createClient } = require('@supabase/supabase-js');
    supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('Supabase client configured.');
  } catch (err) {
    console.warn('Supabase library not available or failed to init:', err.message || err);
    supabase = null;
  }
} else {
  console.log('Supabase not configured - local JSON fallback will be used.');
}

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

// Ensure files exist
try {
  if (!fs.existsSync(BOOKINGS_FILE)) fs.writeFileSync(BOOKINGS_FILE, '[]', 'utf8');
  if (!fs.existsSync(ENQUIRIES_FILE)) fs.writeFileSync(ENQUIRIES_FILE, '[]', 'utf8');
} catch (err) {
  console.error('Failed to ensure data files exist:', err);
  process.exit(1);
}

const app = express();
app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'adminpass';
const PORT = parseInt(process.env.PORT || '3000', 10);

// Optional SMTP notifier
let mailer = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  console.log('SMTP configured - notifications enabled.');
} else {
  console.log('SMTP not configured - email notifications disabled.');
}

// Utility: append to JSON file safely
function appendJson(filePath, obj) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8') || '[]';
    let arr = [];
    try { arr = JSON.parse(raw); } catch (e) { arr = []; }
    arr.push(obj);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('appendJson error:', err);
  }
}

// Helper: try to insert to Supabase (if configured)
async function insertToSupabase(table, payload) {
  if (!supabase) return { ok: false, reason: 'no-supabase' };
  try {
    const { error } = await supabase.from(table).insert([payload]);
    if (error) {
      console.warn(`Supabase insert error (${table}):`, error.message || error);
      return { ok: false, reason: error.message || error };
    }
    return { ok: true };
  } catch (err) {
    console.warn('Supabase insert threw:', err);
    return { ok: false, reason: err.message || err };
  }
}

// Admin auth middleware - accept header x-admin-api-key OR Basic auth
function requireAdmin(req, res, next) {
  // header check first
  const headerKey = (req.headers['x-admin-api-key'] || '').toString();
  if (ADMIN_API_KEY && headerKey && headerKey === ADMIN_API_KEY) {
    return next();
  }

  // fallback to Basic auth
  const user = basicAuth(req);
  if (!user || user.name !== ADMIN_USER || user.pass !== ADMIN_PASS) {
    res.set('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required.');
  }
  next();
}

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API: post booking
app.post('/api/book', async (req, res) => {
  const payload = {
    id: 'bk_' + Date.now(),
    createdAt: new Date().toISOString(),
    name: req.body.name || '',
    phone: req.body.phone || '',
    email: req.body.email || '',
    service: req.body.service || '',
    date: req.body.date || '',
    time: req.body.time || '',
    message: req.body.message || ''
  };

  // Try supabase first (if configured). If supabase fails we append locally as fallback.
  if (supabase) {
    const supaResult = await insertToSupabase('bookings', {
      created_at: payload.createdAt,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      service: payload.service,
      date: payload.date,
      time: payload.time,
      message: payload.message
    });
    if (!supaResult.ok) {
      console.warn('Supabase insert failed - saving locally as fallback.');
      appendJson(BOOKINGS_FILE, payload);
    } else {
      // also append locally as a backup (optional) — comment out if you don't want duplicates locally
      appendJson(BOOKINGS_FILE, payload);
    }
  } else {
    appendJson(BOOKINGS_FILE, payload);
  }

  // optional email notify
  if (mailer && process.env.NOTIFY_TO) {
    const html = `
      <h3>New Booking</h3>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Service:</strong> ${payload.service}</p>
      <p><strong>Date/Time:</strong> ${payload.date} ${payload.time}</p>
      <p><strong>Message:</strong> ${payload.message}</p>
      <p>ID: ${payload.id}</p>
    `;
    mailer.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_TO,
      subject: `New Booking - ${payload.service}`,
      html
    }).catch(err => console.error('Mailer error:', err));
  }

  return res.json({ ok: true, id: payload.id });
});

// API: post enquiry
app.post('/api/enquire', async (req, res) => {
  const payload = {
    id: 'enq_' + Date.now(),
    createdAt: new Date().toISOString(),
    name: req.body.name || '',
    phone: req.body.phone || '',
    email: req.body.email || '',
    message: req.body.message || ''
  };

  if (supabase) {
    const supaResult = await insertToSupabase('enquiries', {
      created_at: payload.createdAt,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      message: payload.message
    });
    if (!supaResult.ok) {
      appendJson(ENQUIRIES_FILE, payload);
    } else {
      appendJson(ENQUIRIES_FILE, payload);
    }
  } else {
    appendJson(ENQUIRIES_FILE, payload);
  }

  if (mailer && process.env.NOTIFY_TO) {
    const html = `
      <h3>New Enquiry</h3>
      <p><strong>Name:</strong> ${payload.name}</p>
      <p><strong>Phone:</strong> ${payload.phone}</p>
      <p><strong>Email:</strong> ${payload.email}</p>
      <p><strong>Message:</strong> ${payload.message}</p>
    `;
    mailer.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_TO,
      subject: `New Enquiry`,
      html
    }).catch(err => console.error('Mailer error:', err));
  }

  return res.json({ ok: true, id: payload.id });
});

// API: basic (demo) payment endpoint - stores as payment record in bookings.json
app.post('/api/payment', (req, res) => {
  const payload = {
    id: 'pay_' + Date.now(),
    createdAt: new Date().toISOString(),
    name: req.body.name || '',
    phone: req.body.phone || '',
    email: req.body.email || '',
    amount: req.body.amount || '',
    service: req.body.service || '',
    status: 'PENDING'
  };

  appendJson(BOOKINGS_FILE, { ...payload, note: 'payment-simulated' });

  if (mailer && process.env.NOTIFY_TO) {
    mailer.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.NOTIFY_TO,
      subject: `Payment Received (demo) - ${payload.amount}`,
      html: `<p>Payment record: ${JSON.stringify(payload)}</p>`
    }).catch(err => console.error('Mailer error:', err));
  }

  return res.json({ ok: true, id: payload.id, confirmUrl: '/payment-success.html' });
});

// Admin API (protected): get bookings & enquiries
app.get('/api/admin/bookings', requireAdmin, (req, res) => {
  try {
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf8') || '[]';
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read bookings file:', err);
    res.status(500).json([]);
  }
});
app.get('/api/admin/enquiries', requireAdmin, (req, res) => {
  try {
    const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf8') || '[]';
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Failed to read enquiries file:', err);
    res.status(500).json([]);
  }
});

// Admin export (CSV)
app.get('/api/admin/export/bookings.csv', requireAdmin, (req, res) => {
  try {
    const raw = fs.readFileSync(BOOKINGS_FILE, 'utf8') || '[]';
    const arr = JSON.parse(raw);
    let csv = 'id,createdAt,name,phone,email,service,date,time,message\n';
    arr.forEach(r => {
      csv += `"${r.id}","${r.createdAt}","${(r.name||'').replace(/"/g,'""')}","${(r.phone||'').replace(/"/g,'""')}","${(r.email||'').replace(/"/g,'""')}","${(r.service||'').replace(/"/g,'""')}","${r.date||''}","${r.time||''}","${(r.message||'').replace(/"/g,'""')}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="bookings.csv"');
    res.send(csv);
  } catch (err) {
    console.error('Export failed:', err);
    res.status(500).send('Export failed');
  }
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Admin user: ${ADMIN_USER} (set ADMIN_USER/ADMIN_PASS env to change)`);
  if (ADMIN_API_KEY) console.log('Admin API key is configured (x-admin-api-key allowed).');
});
