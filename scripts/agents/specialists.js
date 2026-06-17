const { GoogleGenerativeAI } = require('@google/generative-ai');

const SPECIALIST_PROMPTS = {
  US: `You are the USA Market Specialist Agent. Analyze the given news articles with focus on Fed policy, treasury yields, S&P 500/Nasdaq, and Big Tech.`,
  EU: `You are the Europe Market Specialist Agent. Analyze the given news articles with focus on ECB policy, Eurozone inflation, industrial output (Germany/France), and Euro movements.`,
  CN: `You are the China Market Specialist Agent. Analyze the given news articles with focus on PBOC, yuan exchange rates, tech regulation, EV/battery supply chains, and property markets.`,
  JP: `You are the Japan Market Specialist Agent. Analyze the given news articles with focus on BOJ policy, yen depreciation/intervention, industrial automation, and Nikkei index.`,
  KR: `You are the Korea Market Specialist Agent. Analyze the given news articles with focus on BOK decisions, export drivers (DRAM, automotive, batteries), KOSPI/KOSDAQ, and local housing.`
};

async function analyzeArticlesBatched(articles, region, apiKey) {
  if (articles.length === 0) return [];

  const instruction = SPECIALIST_PROMPTS[region] || SPECIALIST_PROMPTS.US;
  console.log(`[Specialist Agent - ${region}] Batch analyzing ${articles.length} articles in a single API call...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    // Format the articles list for the prompt
    let articlesPromptText = '';
    articles.forEach((art, index) => {
      articlesPromptText += `\n--- ARTICLE #${index + 1} (ID: ${art.id}) ---\n`;
      articlesPromptText += `Title: ${art.title}\n`;
      articlesPromptText += `Description: ${art.description}\n`;
    });

    const prompt = `
    ${instruction}
    
    You must evaluate the following ${articles.length} news articles.
    For each article, determine:
    1. A score of 1 to 10 on how important and impactful this news is for investors looking at this specific region or the global market (1 = minor news, 10 = major market-moving event).
    2. Write exactly 3 concise bullet points in Korean (한국어) analyzing why this matters, what key data is presented, and the regional market impact.

    List of articles to analyze:
    ${articlesPromptText}

    Output JSON Format:
    {
      "results": [
        {
          "id": "article_id_here",
          "score": 8,
          "analysis": [
            "분석 포인트 1 (한국어)",
            "분석 포인트 2 (한국어)",
            "분석 포인트 3 (한국어)"
          ]
        },
        ...
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    // Map results back by ID
    const resultsMap = {};
    if (parsed.results && Array.isArray(parsed.results)) {
      parsed.results.forEach(res => {
        resultsMap[res.id] = {
          score: Number(res.score) || 5,
          analysis: res.analysis || []
        };
      });
    }

    return articles.map(art => {
      return {
        id: art.id,
        score: (resultsMap[art.id] && resultsMap[art.id].score) || 5,
        analysis: (resultsMap[art.id] && resultsMap[art.id].analysis) || ['임시 분석 데이터']
      };
    });

  } catch (error) {
    console.error(`❌ [Specialist Agent - ${region}] 일괄 분석 오류:`, error.message);
    return articles.map(art => {
      return {
        id: art.id,
        score: 4,
        analysis: ['네트워크 오류 또는 분석 실패로 인한 임시 분석 항목입니다.']
      };
    });
  }
}

module.exports = { analyzeArticlesBatched };
