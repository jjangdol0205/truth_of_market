const ticker = "AAPL";
const modules = "financialData,recommendationTrend,upgradeDowngradeHistory";
const url = \`https://query2.finance.yahoo.com/v10/finance/quoteSummary/\${ticker}?modules=\${modules}\`;

fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  .then(res => res.json())
  .then(data => {
    const result = data?.quoteSummary?.result?.[0];
    
    // Check upgradeDowngradeHistory
    const history = result?.upgradeDowngradeHistory?.history || [];
    console.log("History length:", history.length);
    if(history.length > 0) {
        console.log("Sample history item:", history[0]);
    }

    // Check recommendationTrend
    const trend = result?.recommendationTrend?.trend || [];
    console.log("Trend length:", trend.length);
    if(trend.length > 0) {
        console.log("Sample trend item:", trend[0]);
    }
  })
  .catch(err => console.error(err));
