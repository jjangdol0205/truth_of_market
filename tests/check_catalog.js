const fs = require('fs');

function checkCatalog(filepath) {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  const products = data.parentingProducts || data.products || [];
  let errors = [];
  let malformedEncoding = [];
  let fieldMismatches = [];

  products.forEach((prod, idx) => {
    const id = prod.id;
    const name = prod.name;
    const platform = (prod.platform || '').toLowerCase();
    const url = prod.url || '';
    const affUrl = prod.affiliateUrl || '';

    // Partner ID check
    if (platform === 'coupang') {
      if (!url.includes('lptag=AF7865143')) errors.push({ id, name, platform, error: 'Missing lptag=AF7865143', url });
      if (prod.partnerTag !== 'AF7865143') errors.push({ id, name, platform, error: 'partnerTag !== AF7865143' });
    } else if (platform === 'iherb') {
      if (!url.includes('rcode=IPZ1547')) errors.push({ id, name, platform, error: 'Missing rcode=IPZ1547', url });
      if (prod.partnerTag !== 'IPZ1547') errors.push({ id, name, platform, error: 'partnerTag !== IPZ1547' });
    } else if (platform === 'cpa') {
      if (!url.includes('A100708867')) errors.push({ id, name, platform, error: 'Missing A100708867', url });
      if (prod.partnerTag !== 'A100708867') errors.push({ id, name, platform, error: 'partnerTag !== A100708867' });
    } else {
      errors.push({ id, name, platform, error: 'Unknown platform' });
    }

    // URL vs affiliateUrl equality
    if (url !== affUrl) {
      fieldMismatches.push({ id, name, url, affUrl });
    }

    // URI encoding validity
    try {
      decodeURIComponent(url);
    } catch (e) {
      malformedEncoding.push({ id, name, url, error: e.message });
    }
  });

  return { filepath, total: products.length, errors, malformedEncoding, fieldMismatches };
}

const r1 = checkCatalog('src/data/curation-catalog.json');
console.log('--- src/data/curation-catalog.json ---');
console.log('Total products:', r1.total);
console.log('Partner tag errors:', r1.errors.length);
if (r1.errors.length) console.log(r1.errors);
console.log('Malformed URI encodings:', r1.malformedEncoding.length);
if (r1.malformedEncoding.length) console.log(r1.malformedEncoding);
console.log('url vs affiliateUrl mismatches:', r1.fieldMismatches.length);
if (r1.fieldMismatches.length) console.log(r1.fieldMismatches);

const r2 = checkCatalog('dist/src/data/curation-catalog.json');
console.log('--- dist/src/data/curation-catalog.json ---');
console.log('Total products:', r2.total);
console.log('Partner tag errors:', r2.errors.length);
console.log('Malformed URI encodings:', r2.malformedEncoding.length);
console.log('url vs affiliateUrl mismatches:', r2.fieldMismatches.length);
