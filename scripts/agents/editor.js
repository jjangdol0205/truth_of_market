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
    Your task is to write highly detailed, professional, and readable investment reports for the following ${articles.length} curated articles.

    Your output MUST be written in natural, fluent, and highly professional financial Korean (한국어).
    Each report must be detailed enough that a busy investor can completely understand the whole context, numbers, and impact without reading the original article.

    Generate the output strictly in JSON format with the following keys:
    {
      "reports": [
        {
          "id": "article_id_here",
          "translatedTitle": "engaging Korean title here",
          "summary": [
            "🔍 [사건 개요 및 맥락] ... (Explain the background, history, and why this event happened in detail)",
            "📈 [세부 지표 및 사실 정보] ... (List specific numbers, rates, percentages, stock price changes, or data points mentioned or related in detail)",
            "💡 [투자 시사점 및 전략] ... (Offer concrete, actionable strategic guidance or warning signs in detail)"
          ],
          "implications": [
            "Detailed implication 1 in Korean",
            "Detailed implication 2 in Korean"
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
            `🔍 [사건 개요 및 맥락] ${art.title}`,
            '📈 [세부 지표 및 사실 정보] 상세 분석 데이터 로드 실패',
            '💡 [투자 시사점 및 전략] 보수적 관점 유지 권장'
          ],
          implications: rep.implications && rep.implications.length === 2 ? rep.implications : [
            '시장 방향 모니터링 필요',
            '원문 확인 권장'
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
            `🔍 [사건 개요 및 맥락] ${art.title}`,
            '📈 [세부 지표 및 사실 정보] 임시 분석 데이터 로드 중',
            '💡 [투자 시사점 및 전략] 상세 내용 다음 갱신에 확인 권장'
          ],
          implications: ['시스템 네트워크 혼잡 상태', '추후 자동 갱신 예정'],
          isPremiumCuration: true
        }
      };
    });
  }
}

module.exports = { editArticlesBatched };
