const fetch = require('node-fetch');

async function testIndex() {
    const symbols = ['^GSPC', '^IXIC', '^RUT']; // S&P 500, Nasdaq, Russell 2000
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;

    try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const data = await res.json();
        console.log(JSON.stringify(data.quoteResponse.result.map(q => ({
            symbol: q.symbol,
            price: q.regularMarketPrice,
            change: q.regularMarketChangePercent
        })), null, 2));
    } catch (e) {
        console.error(e);
    }
}

testIndex();
