import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ChatContext {
  userName: string;
  birthChart: any;
  botSystemPrompt: string;
  previousMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export async function generateAstrologyResponse(
  userMessage: string,
  context: ChatContext
): Promise<string> {
  try {
    const birthChartSummary = generateBirthChartSummary(context.birthChart);
    
    const systemMessage = `${context.botSystemPrompt}

Birth Chart Context for ${context.userName}:
${birthChartSummary}

Guidelines:
- Always provide personalized insights based on the specific birth chart data
- Reference specific planetary positions, houses, and aspects when relevant
- Keep responses conversational, warm, and encouraging
- Provide actionable advice when appropriate
- If asked about topics outside astrology, gently redirect to astrological perspectives`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...context.previousMessages.slice(-10), // Keep last 10 messages for context
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error("Failed to generate astrological response. Please try again.");
  }
}

function generateBirthChartSummary(birthChart: any): string {
  if (!birthChart || !birthChart.planets || !birthChart.houses) {
    return "Birth chart data is not available.";
  }

  try {
    const { planets, houses, aspects } = birthChart;
    
    let summary = "Birth Chart Summary:\n";
    
    // Add key planetary positions
    if (planets.Sun) {
      summary += `Sun: ${planets.Sun.sign} in ${planets.Sun.house}th house\n`;
    }
    if (planets.Moon) {
      summary += `Moon: ${planets.Moon.sign} in ${planets.Moon.house}th house\n`;
    }
    if (planets.Mercury) {
      summary += `Mercury: ${planets.Mercury.sign} in ${planets.Mercury.house}th house\n`;
    }
    if (planets.Venus) {
      summary += `Venus: ${planets.Venus.sign} in ${planets.Venus.house}th house\n`;
    }
    if (planets.Mars) {
      summary += `Mars: ${planets.Mars.sign} in ${planets.Mars.house}th house\n`;
    }
    
    // Add ascendant if available
    if (houses["1"]) {
      summary += `Ascendant: ${houses["1"].sign}\n`;
    }
    
    // Add major aspects if available
    if (aspects && Object.keys(aspects).length > 0) {
      summary += "\nMajor Aspects:\n";
      Object.entries(aspects).slice(0, 5).forEach(([key, aspect]: [string, any]) => {
        summary += `${aspect.planet1} ${aspect.type} ${aspect.planet2}\n`;
      });
    }
    
    return summary;
  } catch (error) {
    return "Birth chart data format is invalid.";
  }
}

export async function generateWelcomeMessage(userName: string, birthChart: any, botName: string): Promise<string> {
  const birthChartSummary = generateBirthChartSummary(birthChart);
  
  const prompt = `You are ${botName}, an AI astrology expert. Generate a warm, personalized welcome message for ${userName} that:
1. Greets them by name
2. Thanks them for taking the first step
3. Mentions 1-2 key insights from their birth chart
4. Asks what they'd like to explore

Birth Chart Summary:
${birthChartSummary}

Keep it conversational, warm, and under 150 words.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.8,
    });

    return response.choices[0].message.content || `Hi ${userName}! 👋 Thank you for taking the first step. I'm excited to explore your cosmic blueprint with you. What would you like to discover about your astrology today?`;
  } catch (error) {
    console.error('Welcome message generation error:', error);
    return `Hi ${userName}! 👋 Thank you for taking the first step. I'm excited to explore your cosmic blueprint with you. What would you like to discover about your astrology today?`;
  }
}
