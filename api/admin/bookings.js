// api/admin/bookings.js
export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // ---------------------------
  //  AUTH CHECK (Admin Only)
  // ---------------------------
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || token !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // ---------------------------
  //  LOAD SUPABASE CREDS
  // ---------------------------
  const SUPA_URL = process.env.SUPABASE_URL;
  const SUPA_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPA_URL || !SUPA_SERVICE_KEY) {
    return res.status(500).json({ error: "Missing Supabase Environment Variables" });
  }

  try {
    // ---------------------------
    //  FETCH BOOKINGS DATA
    // ---------------------------
    const endpoint = `${SUPA_URL}/rest/v1/bookings?select=*&order=created_at.desc&limit=1000`;

    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPA_SERVICE_KEY,
        Authorization: `Bearer ${SUPA_SERVICE_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return res.status(500).json({ error: "Supabase fetch failed", detail: await response.text() });
    }

    const data = await response.json();

    // SUCCESS RESPONSE
    return res.status(200).json({
      ok: true,
      count: data.length,
      rows: data
    });

  } catch (err) {
    console.error("BOOKINGS API ERROR:", err);
    return res.status(500).json({ error: "Server Error", detail: err.message });
  }
}
