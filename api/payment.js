// api/payment.js
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Extract POST body
  const {
    name = "",
    phone = "",
    email = "",
    service = "",
    amount = 0,
    status = "PENDING"  // PENDING | PAID | FAILED
  } = req.body || {};

  // Validate amount
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  // Load Supabase credentials
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPA_URL || !SUPA_SERVICE_KEY) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    // -------------------------
    //  Insert Payment Record
    // -------------------------
    const payload = [{
      name,
      phone,
      email,
      service,
      amount: Number(amount),
      status
    }];

    const endpoint = `${SUPA_URL}/rest/v1/payments`;

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

    const inserted = await insertRes.json();

    if (!insertRes.ok) {
      return res.status(500).json({
        error: "Insert failed",
        detail: inserted || (await insertRes.text())
      });
    }

    const record = Array.isArray(inserted) ? inserted[0] : inserted;

    // -------------------------
    // OPTIONAL: Send Email Notification
    // -------------------------
    if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const sgKey = process.env.SENDGRID_API_KEY;
        const notifyTo = process.env.NOTIFY_EMAIL;

        const mailBody = {
          personalizations: [{ to: [{ email: notifyTo }] }],
          from: { email: notifyTo },
          subject: `Payment Recorded — ₹${amount} (${service})`,
          content: [
            {
              type: "text/html",
              value: `
                <h3>New Payment Received</h3>
                <p><strong>Name:</strong> ${name || "-"}</p>
                <p><strong>Phone:</strong> ${phone || "-"}</p>
                <p><strong>Email:</strong> ${email || "-"}</p>
                <p><strong>Service:</strong> ${service || "-"}</p>
                <p><strong>Amount:</strong> ₹${amount}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Payment ID:</strong> ${record.id}</p>
              `
            }
          ]
        };

        // Fire-and-forget email send
        fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sgKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(mailBody)
        }).catch(e => console.error("SendGrid error:", e.message));
      } catch (e) {
        console.error("SendGrid exception:", e);
      }
    }

    // -------------------------
    // SUCCESS RESPONSE
    // -------------------------
    return res.status(201).json({
      ok: true,
      id: record.id ?? null,
      record
    });

  } catch (err) {
    console.error("PAYMENT API ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      detail: String(err)
    });
  }
}
