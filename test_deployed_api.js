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
    try {
        console.log('1. Testing Demo Login on Render...');
        const loginData = JSON.stringify({});
        const loginRes = await request({
            hostname: 'personal-finance-manager-f6sr.onrender.com',
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
        console.log('Token received. Length:', token.length);

        console.log('\n2. Fetching Transactions (No Filters)...');
        const txRes = await request({
            hostname: 'personal-finance-manager-f6sr.onrender.com',
            path: '/api/transactions',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Transactions Status:', txRes.statusCode);
        console.log('Transactions Body Preview:', txRes.body.substring(0, 500));

        if (txRes.statusCode === 200) {
            const txs = JSON.parse(txRes.body);
            console.log('Transaction count:', txs.length);
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
