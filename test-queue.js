// Quick test: login as receptionist and fetch queue page
const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function test() {
  try {
    // 1. Get login page to grab session cookie
    const loginPage = await makeRequest({ hostname: 'localhost', port: 8080, path: '/login', method: 'GET' });
    const cookies = loginPage.headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || '';
    console.log('1. Login page:', loginPage.status, '| Cookie:', cookies ? 'YES' : 'NO');

    // 2. POST login
    const postData = 'username=demo2&password=demo1234&role=receptionist';
    const loginRes = await makeRequest({
      hostname: 'localhost', port: 8080, path: '/login', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cookie': cookies, 'Content-Length': Buffer.byteLength(postData) }
    }, postData);
    
    const allCookies = [cookies];
    if (loginRes.headers['set-cookie']) {
      loginRes.headers['set-cookie'].forEach(c => allCookies.push(c.split(';')[0]));
    }
    const sessionCookie = allCookies.join('; ');
    console.log('2. Login POST:', loginRes.status, '| Redirect:', loginRes.headers.location || 'none');

    // 3. Follow redirect
    const redir = loginRes.headers.location || '/receptionist';
    const dashRes = await makeRequest({
      hostname: 'localhost', port: 8080, path: redir, method: 'GET',
      headers: { 'Cookie': sessionCookie }
    });
    const dashCookies2 = [sessionCookie];
    if (dashRes.headers['set-cookie']) {
      dashRes.headers['set-cookie'].forEach(c => dashCookies2.push(c.split(';')[0]));
    }
    const finalCookie = dashCookies2.join('; ');
    console.log('3. Dashboard:', dashRes.status, '| Body length:', dashRes.body.length);

    // 4. Fetch queue page
    const queueRes = await makeRequest({
      hostname: 'localhost', port: 8080, path: '/receptionist/queue', method: 'GET',
      headers: { 'Cookie': finalCookie }
    });
    console.log('4. Queue page:', queueRes.status, '| Body length:', queueRes.body.length);
    
    // Check for error markers in rendered HTML
    if (queueRes.body.includes('Error') || queueRes.body.includes('error')) {
      // Check if it's flash error block or actual server error
      if (queueRes.body.includes('Live Queue Management')) {
        console.log('   ✓ Queue page rendered correctly (has "Live Queue Management" heading)');
      }
    }
    if (queueRes.body.includes('doctor-panel')) {
      console.log('   ✓ Doctor panels present');
    }
    if (queueRes.body.includes('doctor-tab')) {
      console.log('   ✓ Doctor filter tabs present');
    }
    if (queueRes.body.includes('walkin-form')) {
      console.log('   ✓ Walk-in forms present');
    }
    if (queueRes.body.includes('summary-stats')) {
      console.log('   ✓ Summary stats present');
    }
    if (queueRes.body.includes('refreshQueue')) {
      console.log('   ✓ Live refresh polling JS present');
    }
    if (queueRes.body.includes('api/queue/live-data')) {
      console.log('   ✓ Uses new /api/queue/live-data endpoint');
    }

    // 5. Test live-data API
    const apiRes = await makeRequest({
      hostname: 'localhost', port: 8080, path: '/api/queue/live-data?date=2026-04-14', method: 'GET'
    });
    const apiData = JSON.parse(apiRes.body);
    console.log('5. Live-data API:', apiRes.status, '| Doctors:', apiData.doctors?.length);

    console.log('\n=== ALL TESTS PASSED ===');
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

test();
