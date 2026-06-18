/**
 * columnist.js — Truth of Market 오리지널 인사이트 칼럼 작성 에이전트
 *
 * 역할: 오늘 수집된 주요 기사 5~10개를 받아 Gemini AI로
 *       1,500자 이상의 오리지널 시장 분석 칼럼을 한국어로 생성합니다.
 *
 * 구글 AdSense 관점:
 *   - 단순 번역/요약이 아닌 논설형 오리지널 텍스트 생성
 *   - /insights/:slug 독립 URL 페이지에 SSR로 렌더링되어 구글봇 크롤링 가능
 *   - E-E-A-T(경험·전문성·권위·신뢰) 요건 충족
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * 오늘의 주요 기사 목록을 받아 오리지널 인사이트 칼럼을 생성합니다.
 * @param {Array} articles - aiAnalysis가 있는 오늘의 주요 기사 배열 (최소 3개)
 * @param {string} apiKey  - Gemini API 키
 * @returns {Object|null}  - { title, slug, summary, body, tags, sources } 또는 null
 */
async function generateInsightColumn(articles, apiKey) {
  if (!articles || articles.length < 2) {
    console.warn('⚠️ [Columnist] 칼럼 작성을 위한 기사 수가 부족합니다 (최소 2건 필요).');
    return null;
  }

  console.log(`✍️ [Columnist] ${articles.length}건의 기사를 기반으로 오리지널 인사이트 칼럼을 작성합니다...`);

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // 기사 요약 텍스트 구성
  let articleSnippets = '';
  articles.slice(0, 8).forEach((art, i) => {
    const analysis = art.aiAnalysis;
    if (!analysis) return;
    articleSnippets += `\n[기사 ${i + 1}] 출처: ${art.sourceName}\n`;
    articleSnippets += `제목: ${analysis.translatedTitle || art.title}\n`;
    articleSnippets += `핵심 요약:\n`;
    if (analysis.summary) analysis.summary.forEach(s => { articleSnippets += `  - ${s}\n`; });
    if (analysis.implications) {
      articleSnippets += `투자 시사점:\n`;
      analysis.implications.forEach(imp => { articleSnippets += `  - ${imp}\n`; });
    }
    articleSnippets += '\n';
  });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
당신은 "Truth of Market"의 수석 시장 분석 칼럼니스트입니다.
오늘(${todayStr}) 수집된 주요 경제 뉴스들을 바탕으로, 투자자를 위한 **오리지널 시장 분석 칼럼**을 작성하세요.

## 작성 규칙
1. 전체 본문(body)은 반드시 **한국어** 2,000자 이상으로 작성할 것
2. 단순 뉴스 나열이 아닌, 여러 이슈를 엮어 **거시적 흐름과 투자 판단**을 제시하는 논설형 글
3. 서론(시장 배경) → 본론(주요 이슈 심층 분석) → 결론(투자 전략 방향) 구조 준수
4. 구체적인 수치, 기업명, 정책 내용을 인용하며 전문성을 드러낼 것
5. 특수문자·이모지 없이 깔끔한 한국어 텍스트만 사용할 것
6. 마크다운 헤더(##, ###)는 사용하되, 이모지나 별표 강조 최소화

## 출력 JSON 포맷 (반드시 이 구조로)
{
  "columnTitle": "칼럼 제목 (50자 이내, 핵심 키워드 포함)",
  "slug": "column-slug-in-english-with-dashes",
  "oneLinerSummary": "칼럼 핵심을 한 줄로 요약 (100자 이내)",
  "body": "전체 칼럼 본문 (마크다운 형식, 2000자 이상)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "keyTheme": "오늘의 핵심 테마 키워드 (예: 연준 긴축, 반도체 사이클 등)"
}

## 오늘의 뉴스 원고 자료
${articleSnippets}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    if (!parsed.columnTitle || !parsed.body || parsed.body.length < 500) {
      console.warn('⚠️ [Columnist] 생성된 칼럼이 기준 미달입니다.');
      return null;
    }

    const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    return {
      id: `col_${Date.now()}`,
      title: parsed.columnTitle,
      slug: parsed.slug || `market-insight-${dateStr}`,
      summary: parsed.oneLinerSummary || '',
      body: parsed.body,
      tags: parsed.tags || [],
      keyTheme: parsed.keyTheme || '',
      date: new Date().toISOString(),
      dateStr: dateStr,
      sourceArticleCount: articles.length,
      sources: articles.slice(0, 8).map(a => ({
        title: a.aiAnalysis?.translatedTitle || a.title,
        sourceName: a.sourceName,
        link: a.link
      }))
    };

  } catch (err) {
    console.error('❌ [Columnist] 칼럼 생성 중 오류:', err.message);
    return null;
  }
}

module.exports = { generateInsightColumn };
