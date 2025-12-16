// api/payment.js (Express + CommonJS)
const express = require("express");
const router = express.Router();
require("dotenv").config();

router.post("/", async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { name = "", phone = "", email = "", service = "", amount = 0, status = "PENDING" } = req.body || {};

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPA_URL || !SUPA_SERVICE_KEY) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    const payload = [{ name, phone, email, service, amount: Number(amount), status }];
    const endpoint = `${SUPA_URL.replace(/\/$/, "")}/rest/v1/payments`;

    const insertRes = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPA_SERVICE_KEY,
        Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
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

    if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const sgKey = process.env.SENDGRID_API_KEY;
        const notifyTo = process.env.NOTIFY_EMAIL;
        const mailBody = {
          personalizations: [{ to: [{ email: notifyTo }] }],
          from: { email: notifyTo },
          subject: `Payment Recorded — ₹${amount} (${service})`,
          content: [{ type: "text/html", value: `<h3>New Payment</h3><p><strong>Amount:</strong> ₹${amount}</p>` }]
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
    console.error("PAYMENT API ERROR:", err);
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
});

module.exports = router;
