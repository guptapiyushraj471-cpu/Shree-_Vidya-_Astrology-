// api/enquire.js
export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse request body
  const { name = "", phone = "", email = "", message = "" } = req.body || {};

  // Validation: must provide at least one contact field
  if (!name && !email && !phone) {
    return res.status(400).json({
      error: "Provide at least one contact field (name, email, or phone)"
    });
  }

  // Load Supabase credentials
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPA_URL || !SUPA_SERVICE_KEY) {
    return res.status(500).json({ error: "Missing Supabase environment variables" });
  }

  try {
    // Prepare payload
    const payload = [{
      name,
      phone,
      email,
      message
    }];

    // Insert into Supabase (return inserted row)
    const endpoint = `${SUPA_URL}/rest/v1/enquiries`;

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

    // ---------------------------
    // OPTIONAL: SendGrid Email Alert
    // ---------------------------
    if (process.env.SENDGRID_API_KEY && process.env.NOTIFY_EMAIL) {
      try {
        const sgKey = process.env.SENDGRID_API_KEY;
        const notifyTo = process.env.NOTIFY_EMAIL;

        const mailBody = {
          personalizations: [{ to: [{ email: notifyTo }] }],
          from: { email: notifyTo },
          subject: `New Enquiry — ${name || phone || email}`,
          content: [{
            type: "text/html",
            value: `
              <h3>New Enquiry Received</h3>
              <p><strong>Name:</strong> ${name || "-"}</p>
              <p><strong>Phone:</strong> ${phone || "-"}</p>
              <p><strong>Email:</strong> ${email || "-"}</p>
              <p><strong>Message:</strong> ${message || "-"}</p>
              <p><strong>ID:</strong> ${record.id || "-"}</p>
            `
          }]
        };

        // Fire-and-forget email sending
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

    // Return success response
    return res.status(201).json({
      ok: true,
      id: record.id ?? null,
      record
    });

  } catch (err) {
    console.error("ENQUIRY API ERROR:", err);
    return res.status(500).json({
      error: "Server error",
      detail: String(err)
    });
  }
}
