const fs = require('fs');

function checkHtmlFile(filepath) {
  const html = fs.readFileSync(filepath, 'utf8');
  const tagRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
  let m;
  let totalChecked = 0;
  let coupangCount = 0;
  let iherbCount = 0;
  let cpaCount = 0;
  let errors = [];

  while ((m = tagRegex.exec(html)) !== null) {
    const fullTag = m[0];
    const href = m[1];
    const hrefLower = href.toLowerCase();
    
    if (hrefLower.includes('coupang.com')) {
      totalChecked++;
      coupangCount++;
      if (!href.includes('lptag=AF7865143')) errors.push({ type: 'Coupang missing AF7865143', tag: fullTag, href });
      if (!fullTag.includes('target="_blank"')) errors.push({ type: 'Coupang missing target=_blank', tag: fullTag });
      if (!fullTag.includes('rel="') || !fullTag.includes('noopener')) errors.push({ type: 'Coupang missing rel noopener', tag: fullTag });
    } else if (hrefLower.includes('iherb.com')) {
      totalChecked++;
      iherbCount++;
      if (!href.includes('rcode=IPZ1547')) errors.push({ type: 'iHerb missing IPZ1547', tag: fullTag, href });
      if (!fullTag.includes('target="_blank"')) errors.push({ type: 'iHerb missing target=_blank', tag: fullTag });
      if (!fullTag.includes('rel="') || !fullTag.includes('noopener')) errors.push({ type: 'iHerb missing rel noopener', tag: fullTag });
    } else if (hrefLower.includes('linkprice.com') || fullTag.includes('data-shop-platform="cpa"') || href.includes('A100708867')) {
      totalChecked++;
      cpaCount++;
      if (!href.includes('A100708867')) errors.push({ type: 'CPA missing A100708867', tag: fullTag, href });
      if (!fullTag.includes('target="_blank"')) errors.push({ type: 'CPA missing target=_blank', tag: fullTag });
      if (!fullTag.includes('rel="') || !fullTag.includes('noopener')) errors.push({ type: 'CPA missing rel noopener', tag: fullTag });
    }
  }

  return { filepath, totalChecked, coupangCount, iherbCount, cpaCount, errors };
}

const resIndex = checkHtmlFile('index.html');
console.log('--- index.html ---');
console.log('Checked:', resIndex.totalChecked, '(Coupang:', resIndex.coupangCount, 'iHerb:', resIndex.iherbCount, 'CPA:', resIndex.cpaCount, ')');
console.log('Errors:', resIndex.errors.length);
if (resIndex.errors.length) console.log(JSON.stringify(resIndex.errors, null, 2));

const resDist = checkHtmlFile('dist/index.html');
console.log('--- dist/index.html ---');
console.log('Checked:', resDist.totalChecked, '(Coupang:', resDist.coupangCount, 'iHerb:', resDist.iherbCount, 'CPA:', resDist.cpaCount, ')');
console.log('Errors:', resDist.errors.length);
if (resDist.errors.length) console.log(JSON.stringify(resDist.errors, null, 2));
