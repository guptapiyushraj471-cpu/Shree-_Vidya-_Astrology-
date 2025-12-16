// api/book.js  (Express + CommonJS)
const express = require("express");
const router = express.Router();
require("dotenv").config();

router.post("/", async (req, res) => {
  const {
    name = "",
    phone = "",
    email = "",
    service = "",
    date = "",
    time = "",
    message = ""
  } = req.body || {};

  if (!name || !phone || !service) {
    return res.status(400).json({ error: "Missing required fields: name, phone, service" });
  }

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPA_URL || !SUPA_KEY) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    const endpoint = `${SUPA_URL.replace(/\/$/, "")}/rest/v1/bookings`;
    const payload = [{ name, phone, email, service, date: date || null, time: time || null, message }];

    const insertRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPA_KEY,
        Authorization: `Bearer ${SUPA_KEY}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify(payload)
    });

    const inserted = await (insertRes.headers.get("content-type") || "").includes("application/json")
      ? await insertRes.json()
      : null;

    if (!insertRes.ok) {
      return res.status(500).json({ error: "Insert failed", detail: inserted || (await insertRes.text()) });
    }

    const record = Array.isArray(inserted) ? inserted[0] : inserted;

    // optional SendGrid (fire-and-forget)
    if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const sgKey = process.env.SENDGRID_API_KEY;
        const notifyTo = process.env.NOTIFY_EMAIL;
        const mailBody = {
          personalizations: [{ to: [{ email: notifyTo }] }],
          from: { email: notifyTo },
          subject: `New Booking: ${service} — ${name}`,
          content: [{ type: "text/html", value: `<h3>New Booking</h3><p><strong>Name:</strong> ${name}</p>` }]
        };
        fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: { Authorization: `Bearer ${sgKey}`, "Content-Type": "application/json" },
          body: JSON.stringify(mailBody)
        }).catch(e => console.error("SendGrid error:", e && e.message ? e.message : e));
      } catch (e) { console.error("SendGrid exception:", e); }
    }

    return res.status(201).json({ ok: true, id: record.id ?? null, record });
  } catch (err) {
    console.error("BOOK API ERROR:", err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

module.exports = router;
