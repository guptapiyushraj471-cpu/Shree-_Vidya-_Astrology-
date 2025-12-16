// public/admin.js
// Admin page JS — uses sessionStorage for the admin API key and relative API paths.

const API_BASE = ''; // same origin

function promptForKey() {
  const existing = sessionStorage.getItem('ADMIN_API_KEY');
  if (existing) return existing;
  const key = prompt('Enter ADMIN API KEY (keeps in sessionStorage for this tab)');
  if (key) sessionStorage.setItem('ADMIN_API_KEY', key.trim());
  return key;
}

function signOut() {
  sessionStorage.removeItem('ADMIN_API_KEY');
  alert('Signed out. Reload to sign in again.');
}

async function fetchJson(path) {
  const key = sessionStorage.getItem('ADMIN_API_KEY') || promptForKey();
  if (!key) { alert('Admin key required'); throw new Error('No admin key'); }
  const url = (API_BASE || '') + path;
  const r = await fetch(url, {
    method: 'GET',
    headers: {
      // Important: server expects x-admin-api-key header (server.js accepts this)
      'x-admin-api-key': key,
      'Accept': 'application/json'
    }
  });

  if (r.status === 401) {
    sessionStorage.removeItem('ADMIN_API_KEY');
    alert('Unauthorized — admin key invalid or expired');
    throw new Error('Unauthorized');
  }
  if (!r.ok) {
    const txt = await r.text().catch(()=>null);
    throw new Error('API error: ' + r.status + (txt ? ' — ' + txt : ''));
  }
  return r.json();
}

function toLocal(dt) {
  try { return new Date(dt).toLocaleString(); } catch(e) { return dt || ''; }
}

let lastBookings = [];
let lastEnquiries = [];

async function load() {
  try {
    document.getElementById('refresh').disabled = true;
    // bookings
    const bookingsData = await fetchJson('/api/admin/bookings');
    const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.rows || []);
    lastBookings = bookings;
    const bookingsTbody = document.querySelector('#bookTable tbody');
    bookingsTbody.innerHTML = '';
    bookings.slice().reverse().forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="small">${r.id||''}</td>
                      <td>${toLocal(r.created_at || r.createdAt || r.createdAt)}</td>
                      <td>${(r.name||'')}</td>
                      <td>${(r.phone||'')}</td>
                      <td>${(r.service||'')}</td>
                      <td>${(r.date||'')}${r.time ? (' ' + r.time) : ''}</td>
                      <td>${(r.message||'')}</td>`;
      bookingsTbody.appendChild(tr);
    });

    // enquiries
    const enqData = await fetchJson('/api/admin/enquiries');
    const enqs = Array.isArray(enqData) ? enqData : (enqData.rows || []);
    lastEnquiries = enqs;
    const enqTbody = document.querySelector('#enqTable tbody');
    enqTbody.innerHTML = '';
    enqs.slice().reverse().forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="small">${r.id||''}</td>
                      <td>${toLocal(r.created_at || r.createdAt)}</td>
                      <td>${(r.name||'')}</td>
                      <td>${(r.phone||'')}</td>
                      <td>${(r.email||'')}</td>
                      <td>${(r.message||'')}</td>`;
      enqTbody.appendChild(tr);
    });

  } catch(err) {
    alert(err.message || String(err));
    console.error(err);
  } finally {
    document.getElementById('refresh').disabled = false;
  }
}

// CSV export helpers
function arrayToCSV(rows, columns) {
  const esc = v => `"${String(v||'').replace(/"/g,'""')}"`;
  const header = columns.map(c=>esc(c.label)).join(',');
  const lines = rows.map(r => columns.map(c => esc(r[c.key])).join(','));
  return [header].concat(lines).join('\n');
}

function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.style.display='none';
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1000);
}

document.getElementById('refresh').addEventListener('click', load);
document.getElementById('signout').addEventListener('click', ()=>{ signOut(); location.reload(); });

document.getElementById('export').addEventListener('click', ()=>{
  if (!lastBookings.length && !lastEnquiries.length) { alert('No data to export — click Refresh first'); return; }
  const bcols = [{key:'id',label:'id'},{key:'created_at',label:'created_at'},{key:'name',label:'name'},{key:'phone',label:'phone'},{key:'service',label:'service'},{key:'date',label:'date'},{key:'time',label:'time'},{key:'message',label:'message'}];
  const ec = [{key:'id',label:'id'},{key:'created_at',label:'created_at'},{key:'name',label:'name'},{key:'phone',label:'phone'},{key:'email',label:'email'},{key:'message',label:'message'}];
  if (lastBookings.length) {
    const csv = arrayToCSV(lastBookings, bcols);
    downloadCSV('bookings.csv', csv);
  }
  if (lastEnquiries.length) {
    const csv2 = arrayToCSV(lastEnquiries, ec);
    downloadCSV('enquiries.csv', csv2);
  }
});

(async function init(){
  promptForKey();
  if (sessionStorage.getItem('ADMIN_API_KEY')) await load();
})();
