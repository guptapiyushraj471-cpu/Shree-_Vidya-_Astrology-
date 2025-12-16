// api/enquire.js  (CommonJS - ready to paste)
const fetch = global.fetch || require('node-fetch');
const { AbortController } = globalThis;

module.exports = async function handler(req, res) {
  try {
    // Allow only POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Parse request body
    const { name = '', phone = '', email = '', message = '' } = req.body || {};

    // Validation: must provide at least one contact field
    if (!name && !email && !phone) {
      return res.status(400).json({
        error: 'Provide at least one contact field (name, email, or phone)'
      });
    }

    // Load Supabase credentials
    const SUPA_URL_RAW = process.env.SUPABASE_URL;
    const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPA_URL_RAW || !SUPA_SERVICE_KEY) {
      console.error('ENQUIRE ERROR => Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
      return res.status(500).json({ error: 'Missing Supabase environment variables' });
    }

    // Normalize URL (remove trailing slash if present)
    const SUPA_URL = SUPA_URL_RAW.replace(/\/$/, '');
    const endpoint = `${SUPA_URL}/rest/v1/enquiries`;

    // Prepare payload
    const payload = [{ name, phone, email, message }];

    console.log('ENQUIRE -> POST to Supabase endpoint:', endpoint);
    console.log('ENQUIRE -> payload (preview):', JSON.stringify(payload).slice(0, 1000));

    // fetch with timeout
    const controller = new AbortController ? new AbortController() : null;
    const timeoutMs = 10000;
    let timeoutId;
    if (controller) timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let insertRes;
    try {
      insertRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPA_SERVICE_KEY,
          Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
          Prefer: 'return=representation'
        },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      });
    } catch (fetchErr) {
      const isAbort = fetchErr && fetchErr.name === 'AbortError';
      console.error('ENQUIRE -> fetch() error:', isAbort ? 'timeout/abort' : fetchErr && fetchErr.message ? fetchErr.message : fetchErr);
      if (timeoutId) clearTimeout(timeoutId);
      return res.status(500).json({ error: 'Server error', detail: isAbort ? 'Request timed out' : String(fetchErr) });
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }

    // Attempt to parse response safely
    let inserted;
    try {
      inserted = await insertRes.json();
    } catch (e) {
      try {
        inserted = await insertRes.text();
      } catch (e2) {
        inserted = null;
      }
    }

    // Log status + body for debugging
    console.log('ENQUIRE -> Supabase status:', insertRes.status);
    console.log('ENQUIRE -> Supabase response body:', inserted);

    if (!insertRes.ok) {
      // Return the raw detail for debugging on client side
      return res.status(500).json({
        error: 'Insert failed',
        status: insertRes.status,
        detail: inserted
      });
    }

    const record = Array.isArray(inserted) ? inserted[0] : inserted;

    // Optional: SendGrid non-blocking (kept as-is if env set)
    if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const sgKey = process.env.SENDGRID_API_KEY;
        const notifyTo = process.env.NOTIFY_EMAIL;
        const mailBody = {
          personalizations: [{ to: [{ email: notifyTo }] }],
          from: { email: notifyTo },
          subject: `New Enquiry — ${name || phone || email}`,
          content: [{
            type: 'text/html',
            value: `
              <h3>New Enquiry Received</h3>
              <p><strong>Name:</strong> ${name || '-'}</p>
              <p><strong>Phone:</strong> ${phone || '-'}</p>
              <p><strong>Email:</strong> ${email || '-'}</p>
              <p><strong>Message:</strong> ${message || '-'}</p>
              <p><strong>ID:</strong> ${record && record.id ? record.id : '-'}</p>
            `
          }]
        };
        // fire-and-forget
        fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: { Authorization: `Bearer ${sgKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(mailBody)
        }).catch(e => console.error('SendGrid error:', e && e.message));
      } catch (e) {
        console.error('SendGrid exception:', e);
      }
    }

    // Success
    return res.status(201).json({ ok: true, id: record && record.id ? record.id : null, record });
  } catch (err) {
    console.error('ENQUIRE API ERROR (catch):', err);
    return res.status(500).json({ error: 'Server error', detail: String(err) });
  }
};
