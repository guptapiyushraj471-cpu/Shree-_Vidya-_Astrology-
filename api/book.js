// api/book.js
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse body (body should be JSON)
  const {
    name = "",
    phone = "",
    email = "",
    service = "",
    date = "",
    time = "",
    message = ""
  } = req.body || {};

  // Basic validation
  if (!name || !phone || !service) {
    return res.status(400).json({ error: "Missing required fields: name, phone, service" });
  }

  // Load Supabase credentials
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPA_URL || !SUPA_KEY) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    // Insert via Supabase REST (return representation)
    const endpoint = `${SUPA_URL}/rest/v1/bookings`;
    const payload = [{
      name,
      phone,
      email,
      service,
      date: date || null,
      time: time || null,
      message
    }];

    const insertRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPA_KEY,
        "Authorization": `Bearer ${SUPA_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const inserted = await insertRes.json();

    if (!insertRes.ok) {
      // If Supabase returned a useful error object, forward it
      return res.status(500).json({
        error: "Insert failed",
        detail: inserted || (await insertRes.text())
      });
    }

    const record = Array.isArray(inserted) ? inserted[0] : inserted;

    // Optional: Send notification using SendGrid (non-blocking)
    if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const sgKey = process.env.SENDGRID_API_KEY;
        const notifyTo = process.env.NOTIFY_EMAIL;

        const mailBody = {
          personalizations: [{ to: [{ email: notifyTo }] }],
          from: { email: notifyTo },
          subject: `New Booking: ${service} — ${name}`,
          content: [{
            type: "text/html",
            value: `
              <h3>New Booking</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Date/Time:</strong> ${date || "-"} ${time || ""}</p>
              <p><strong>Message:</strong> ${message || "-"}</p>
              <p><strong>ID:</strong> ${record.id || "-"}</p>
            `
          }]
        };

        // Fire-and-forget: do not block response if SendGrid fails
        fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${sgKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(mailBody)
        }).catch(e => console.error("SendGrid error:", e.message));
      } catch (e) {
        console.error("SendGrid exception:", e);
      }
    }

    // Return success with created record id
    return res.status(201).json({ ok: true, id: record.id ?? null, record });
  } catch (err) {
    console.error("BOOK API ERROR:", err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
