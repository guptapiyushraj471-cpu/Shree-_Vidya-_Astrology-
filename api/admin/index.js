// api/admin/index.js
const express = require('express');
const fetch = global.fetch || require('node-fetch');
const router = express.Router();

const SUPA_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

// basic middleware: check admin key sent in 'x-admin-key' header
router.use((req, res, next) => {
  const adminKey = req.header('x-admin-key') || '';
  if (!ADMIN_API_KEY || adminKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// helper to call supabase rest
async function supaGet(table, qs = '') {
  const url = `${SUPA_URL}/rest/v1/${table}${qs}`;
  const r = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SUPA_KEY,
      Authorization: `Bearer ${SUPA_KEY}`
    }
  });
  const body = await (r.headers.get('content-type') || '').includes('application/json') ? r.json() : r.text();
  return { status: r.status, body };
}

// GET /api/admin/enquiries
router.get('/enquiries', async (req, res) => {
  try {
    // optionally allow ?limit= and ?order=
    const limit = req.query.limit ? `&limit=${encodeURIComponent(req.query.limit)}` : '';
    const order = req.query.order ? `&order=${encodeURIComponent(req.query.order)}` : '';
    const qs = `?select=*&order=created_at.desc${limit ? `&limit=${req.query.limit}` : ''}`;
    const result = await supaGet('enquiries', qs);
    if (result.status >= 400) return res.status(502).json({ error: 'Upstream error', detail: result.body });
    return res.json(result.body);
  } catch (e) {
    console.error('ADMIN /enquiries error', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
});

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const qs = `?select=*&order=created_at.desc`;
    const result = await supaGet('bookings', qs);
    if (result.status >= 400) return res.status(502).json({ error: 'Upstream error', detail: result.body });
    return res.json(result.body);
  } catch (e) {
    console.error('ADMIN /bookings error', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
});

// GET /api/admin/payments
router.get('/payments', async (req, res) => {
  try {
    const qs = `?select=*&order=created_at.desc`;
    const result = await supaGet('payments', qs);
    if (result.status >= 400) return res.status(502).json({ error: 'Upstream error', detail: result.body });
    return res.json(result.body);
  } catch (e) {
    console.error('ADMIN /payments error', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
});

module.exports = router;
