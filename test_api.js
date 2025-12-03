const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
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
    try {
        // 1. Login
        console.log('Logging in...');
        const loginData = JSON.stringify({});
        const loginRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/auth/demo-login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            }
        }, loginData);

        console.log('Login Status:', loginRes.statusCode);
        if (loginRes.statusCode !== 200) {
            console.error('Login failed:', loginRes.body);
            return;
        }

        const token = JSON.parse(loginRes.body).token;
        console.log('Token received (length):', token.length);

        // 2. Fetch Transactions
        console.log('Fetching transactions...');
        const txRes = await request({
            hostname: 'localhost',
            port: 8080,
            path: '/api/transactions',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Transactions Status:', txRes.statusCode);
        if (txRes.headers['x-auth-error']) {
            console.log('X-Auth-Error Header:', txRes.headers['x-auth-error']);
        } else {
            console.log('No X-Auth-Error header found.');
        }
        if (txRes.headers['x-auth-success']) {
            console.log('X-Auth-Success Header:', txRes.headers['x-auth-success']);
            console.log('X-Auth-User Header:', txRes.headers['x-auth-user']);
        }
        console.log('Transactions Body:', txRes.body.substring(0, 200) + '...');

    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
