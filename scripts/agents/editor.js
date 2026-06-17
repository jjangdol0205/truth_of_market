const { GoogleGenerativeAI } = require('@google/generative-ai');

async function editArticlesBatched(articles, apiKey) {
  if (articles.length === 0) return [];

  console.log(`✍️ [Genius Editor] Batch editing ${articles.length} curated summaries in a single API call...`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    let articlesPromptText = '';
    articles.forEach((art, index) => {
      const specText = art.specialistAnalysis ? art.specialistAnalysis.join('\n') : 'No regional specialist analysis available.';
      articlesPromptText += `\n--- ARTICLE #${index + 1} (ID: ${art.id}) ---\n`;
      articlesPromptText += `Region: ${art.region}\n`;
      articlesPromptText += `Title: ${art.title}\n`;
      articlesPromptText += `Description: ${art.description}\n`;
      articlesPromptText += `Specialist Analysis:\n${specText}\n`;
    });

    const prompt = `
    You are the "Genius Editor" (천재 편집자) of a premium global financial publication.
    Your task is to write clean, clear, and detailed investment reports for the following ${articles.length} curated articles.

    Your output MUST be written in natural, fluent, and highly professional financial Korean (한국어).
    Each report must be detailed enough that a busy investor can completely understand the whole context, numbers, and impact without reading the original article.
    Use clean bullet points without any prefix emojis or bracketed headers (DO NOT use "🔍 [사건 개요 및 맥락]", "📈 [세부 지표]", "💡 [투자 시사점]" etc.). Just write clean, high-quality, professional Korean sentences.

    Generate the output strictly in JSON format with the following keys:
    {
      "reports": [
        {
          "id": "article_id_here",
          "translatedTitle": "engaging Korean title here",
          "summary": [
            "Detailed summary point 1 in Korean (context & background)",
            "Detailed summary point 2 in Korean (specific data, numbers, or facts)",
            "Detailed summary point 3 in Korean (general conclusion or key event status)"
          ],
          "implications": [
            "Detailed investment implication 1 in Korean (opportunities, risks, or sector impacts)",
            "Detailed investment implication 2 in Korean (watchpoints, next dates, or market direction)"
          ]
        },
        ...
      ]
    }

    Articles to process:
    ${articlesPromptText}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    const reportsMap = {};
    if (parsed.reports && Array.isArray(parsed.reports)) {
      parsed.reports.forEach(rep => {
        reportsMap[rep.id] = {
          translatedTitle: rep.translatedTitle || '',
          summary: rep.summary || [],
          implications: rep.implications || [],
          isPremiumCuration: true
        };
      });
    }

    return articles.map(art => {
      const rep = reportsMap[art.id];
      return {
        id: art.id,
        aiAnalysis: rep ? {
          translatedTitle: rep.translatedTitle || art.title,
          summary: rep.summary && rep.summary.length === 3 ? rep.summary : [
            `금일 발생한 주요 경제 사건인 "${art.title}"에 대한 핵심 개요와 사실 관계입니다.`,
            '기사 원문에서 언급된 주요 재무 지표와 거시경제적 수치 변화를 상세 모니터링해야 합니다.',
            '시장 참여자들의 투자 경계감 및 거래대금 변화 흐름을 종합 점검하는 과정이 요구됩니다.'
          ],
          implications: rep.implications && rep.implications.length === 2 ? rep.implications : [
            '거시적 금리 경로 및 위험자산 선호 심리 변화에 부합하는 포트폴리오 관리가 필요합니다.',
            '관련 핵심 섹터의 주가 지지선 구축 여부를 확인하며 보수적으로 시장을 관망하는 것이 유리합니다.'
          ],
          isPremiumCuration: true
        } : null
      };
    });

  } catch (error) {
    console.error('❌ [Genius Editor] 일괄 작성 에러:', error.message);
    return articles.map(art => {
      return {
        id: art.id,
        aiAnalysis: {
          translatedTitle: art.title,
          summary: [
            `금일 발생한 주요 경제 사건인 "${art.title}"에 대한 핵심 개요와 사실 관계입니다.`,
            '기사 원문에서 언급된 주요 재무 지표와 거시경제적 수치 변화를 상세 모니터링해야 합니다.',
            '시장 참여자들의 투자 경계감 및 거래대금 변화 흐름을 종합 점검하는 과정이 요구됩니다.'
          ],
          implications: [
            '거시적 금리 경로 및 위험자산 선호 심리 변화에 부합하는 포트폴리오 관리가 필요합니다.',
            '관련 핵심 섹터의 주가 지지선 구축 여부를 확인하며 보수적으로 시장을 관망하는 것이 유리합니다.'
          ],
          isPremiumCuration: true
        }
      };
    });
  }
}

module.exports = { editArticlesBatched };
