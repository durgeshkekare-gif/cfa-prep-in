const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, phone, email, level, message, source, page } = req.body;
    
    const SHEET_ID = '1S82OV37f0OgUREdoeFPA1djtrw2An7e5AKBTVSupFZM';
    const TAB = 'Lead Capture';
    const timestamp = new Date().toISOString();
    const rowData = [timestamp, name || '', phone || '', email || '', level || '', message || '', source || 'cfa-prep.in', page || ''];
    
    const payload = JSON.stringify({
      values: [rowData]
    });
    
    // Using Google Sheets API via Apps Script webhook (same pattern as other domains)
    const WEBHOOK_URL = process.env.SHEETS_WEBHOOK_URL || '';
    
    if (WEBHOOK_URL) {
      const url = new URL(WEBHOOK_URL);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
      };
      await new Promise((resolve, reject) => {
        const r = https.request(options, (resp) => { resp.on('data', () => {}); resp.on('end', resolve); });
        r.on('error', reject);
        r.write(payload);
        r.end();
      });
    }
    
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Lead API error:', err);
    return res.status(200).json({ success: true }); // Always 200 to prevent form errors
  }
};
