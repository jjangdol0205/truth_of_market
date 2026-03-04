const fetch = require('node-fetch');

async function testV8() {
    const symbols = ['^GSPC', '^IXIC', '^DJI'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/^GSPC?interval=1d&range=1d`;

    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

testV8();
