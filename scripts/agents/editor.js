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
      const hasValidRep = rep && rep.summary && rep.summary.length === 3 && rep.implications && rep.implications.length === 2;
      return {
        id: art.id,
        aiAnalysis: rep ? {
          translatedTitle: rep.translatedTitle || art.title,
          summary: rep.summary && rep.summary.length === 3 ? rep.summary : [
            `"${art.title}" 보도의 사실 관계를 기반으로 핵심 사건 내용을 요약하고 있습니다.`,
            '원문 기사에서 언급된 구체적인 지표 변화 및 업계 동향을 상세히 모니터링합니다.',
            '관련 시장 참가자들의 반응과 파급 효과를 종합적으로 진단 중입니다.'
          ],
          implications: rep.implications && rep.implications.length === 2 ? rep.implications : [
            '거시적 정책 경로 및 위험 선호 심리 변화에 기반한 대응이 요구됩니다.',
            '핵심 유관 섹터의 변동성과 단기 지지선 구축 여부를 추가 확인이 필요합니다.'
          ],
          isPremiumCuration: hasValidRep
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
            `"${art.title}" 보도의 사실 관계를 기반으로 핵심 사건 내용을 요약하고 있습니다.`,
            '원문 기사에서 언급된 구체적인 지표 변화 및 업계 동향을 상세히 모니터링합니다.',
            '관련 시장 참가자들의 반응과 파급 효과를 종합적으로 진단 중입니다.'
          ],
          implications: [
            '거시적 정책 경로 및 위험 선호 심리 변화에 기반한 대응이 요구됩니다.',
            '핵심 유관 섹터의 변동성과 단기 지지선 구축 여부를 추가 확인이 필요합니다.'
          ],
          isPremiumCuration: false
        }
      };
    });
  }
}

module.exports = { editArticlesBatched };
