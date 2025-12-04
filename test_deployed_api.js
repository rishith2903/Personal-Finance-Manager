const https = require('https');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
        });
        req.on('error', reject);
        if (data) req.write(data);
        req.end();
    });
}

async function test() {
    console.log('--- Step 1: Login ---');
    const loginData = JSON.stringify({});
    const loginRes = await request({
        hostname: 'personal-finance-manager-f6sr.onrender.com',
        path: '/api/auth/demo-login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': loginData.length }
    }, loginData);

    console.log('Login Status:', loginRes.statusCode);
    const token = JSON.parse(loginRes.body).token;
    console.log('Got token');

    console.log('');
    console.log('--- Step 2: Fetch Transactions ---');

    const txRes = await request({
        hostname: 'personal-finance-manager-f6sr.onrender.com',
        path: '/api/transactions',
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    console.log('TX Status:', txRes.statusCode);
    console.log('TX Body:', txRes.body);
    console.log('x-auth-success:', txRes.headers['x-auth-success']);
    console.log('x-auth-user:', txRes.headers['x-auth-user']);
}

test().catch(console.error);
