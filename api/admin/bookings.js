// api/admin/bookings.js  (CommonJS - ready to paste)
const fetch = global.fetch || require('node-fetch');

module.exports = async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ---------------------------
  //  AUTH CHECK (Admin Only)
  // ---------------------------
  try {
    const authHeader = (req.headers.authorization || '').trim();
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    const token = match ? match[1].trim() : '';

    if (!token || token !== String(process.env.ADMIN_API_KEY || '').trim()) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ---------------------------
  //  LOAD SUPABASE CREDS
  // ---------------------------
  const SUPA_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPA_URL || !SUPA_SERVICE_KEY) {
    console.error('Missing Supabase env: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return res.status(500).json({ error: 'Missing Supabase Environment Variables' });
  }

  try {
    // ---------------------------
    //  FETCH BOOKINGS DATA
    // ---------------------------
    // Select all columns, order by created_at desc (if you use a different column, change it)
    const endpoint = `${SUPA_URL}/rest/v1/bookings?select=*&order=created_at.desc&limit=1000`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: SUPA_SERVICE_KEY,
        Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
        Accept: 'application/json'
      }
    });

    let body;
    try { body = await response.json(); } catch (e) { body = await response.text().catch(()=>null); }

    console.log('ADMIN /bookings -> Supabase status:', response.status);
    console.log('ADMIN /bookings -> Supabase body preview:', Array.isArray(body) ? `array(${body.length})` : body);

    if (!response.ok) {
      return res.status(response.status || 500).json({
        error: 'Supabase fetch failed',
        status: response.status,
        detail: body
      });
    }

    const rows = Array.isArray(body) ? body : (body && body.rows ? body.rows : []);
    return res.status(200).json({
      ok: true,
      count: rows.length,
      rows
    });

  } catch (err) {
    console.error('BOOKINGS API ERROR:', err);
    return res.status(500).json({ error: 'Server Error', detail: String(err) });
  }
};
