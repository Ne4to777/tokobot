/**
 * AI service for generating ideas using Hugging Face Inference API
 * Free tier available at https://huggingface.co/inference-api
 */

export async function generateIdea(topic?: string): Promise<string> {
  const HF_TOKEN = process.env.HUGGINGFACE_TOKEN;
  
  if (!HF_TOKEN) {
    // Fallback to local generation if no token provided
    return generateLocalIdea(topic);
  }

  const prompt = topic 
    ? `Generate a creative and innovative idea related to: ${topic}`
    : `Generate a creative and innovative startup or project idea`;

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 200,
            temperature: 0.9,
            top_p: 0.95,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("HuggingFace API error:", response.status);
      return generateLocalIdea(topic);
    }

    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return cleanupAIResponse(data[0].generated_text);
    }

    return generateLocalIdea(topic);
  } catch (error) {
    console.error("Error calling AI API:", error);
    return generateLocalIdea(topic);
  }
}

function cleanupAIResponse(text: string): string {
  // Clean up the AI response
  return text.trim().split('\n')[0] || text.trim();
}

function generateLocalIdea(topic?: string): string {
  const ideas = [
    "🚀 Создайте приложение для обмена навыками между соседями",
    "💡 Разработайте платформу для микро-обучения на 5 минут в день",
    "🌱 Сделайте AR-приложение для определения растений и советов по уходу",
    "🎮 Создайте образовательную игру для изучения программирования",
    "📱 Разработайте трекер привычек с геймификацией и социальным элементом",
    "🎨 Платформа для коллаборации художников и программистов",
    "🏃 Приложение для поиска спортивных партнеров поблизости",
    "📚 Сервис для обмена и аренды книг между пользователями",
    "🍳 AI-повар, который предлагает рецепты на основе продуктов в холодильнике",
    "🎵 Социальная сеть для создания коллаборативных плейлистов",
  ];

  const topicIdeas: { [key: string]: string[] } = {
    tech: [
      "Создайте блокчейн-платформу для верификации цифровых сертификатов",
      "Разработайте low-code платформу для создания чат-ботов",
      "AI-ассистент для автоматизации рутинных задач разработчиков",
    ],
    business: [
      "Marketplace для фрилансеров с автоматическим матчингом проектов",
      "Платформа для B2B нетворкинга с AI-рекомендациями",
      "Сервис для автоматизации бухгалтерии малого бизнеса",
    ],
    social: [
      "Приложение для организации локальных мероприятий и встреч",
      "Платформа для менторства с видео-звонками и трекингом прогресса",
      "Социальная сеть для путешественников с совместными маршрутами",
    ],
  };

  if (topic && topicIdeas[topic.toLowerCase()]) {
    const categoryIdeas = topicIdeas[topic.toLowerCase()];
    return categoryIdeas[Math.floor(Math.random() * categoryIdeas.length)];
  }

  return ideas[Math.floor(Math.random() * ideas.length)];
}

