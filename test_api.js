const http = require('http');

const data = JSON.stringify({ promptText: 'Hello' });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/generateLessonPlan',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk; });
  res.on('end', () => { console.log('Response:', body); });
});

req.on('error', (e) => { console.error('Error:', e); });
req.write(data);
req.end();
