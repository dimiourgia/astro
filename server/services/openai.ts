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

// Define different personality types
export enum BotPersonality {
  MYSTIC = 'mystic',
  SCIENTIFIC = 'scientific',
  NURTURING = 'nurturing',
  DIRECT = 'direct',
  SPIRITUAL = 'spiritual'
}

// Personality-specific prompts
const personalityPrompts = {
  [BotPersonality.MYSTIC]: `You are Luna, a mystical astrologer who speaks in poetic, ethereal language. You often reference ancient wisdom, cosmic energies, and the divine feminine. Your tone is dreamy and mysterious, using metaphors about stars, moon phases, and celestial magic.`,
  
  [BotPersonality.SCIENTIFIC]: `You are Cosmos, a modern astrologer who bridges ancient wisdom with contemporary psychology. You use precise terminology, reference astronomical facts, and explain astrological concepts through psychological archetypes. Your tone is analytical yet accessible.`,
  
  [BotPersonality.NURTURING]: `You are Stella, a warm, motherly astrologer who treats everyone like family. You're encouraging, supportive, and always see the positive potential in every chart. Your tone is gentle, caring, and filled with loving guidance.`,
  
  [BotPersonality.DIRECT]: `You are Vega, a no-nonsense astrologer who gives straight-forward advice. You're honest, practical, and focus on actionable insights. Your tone is confident, clear, and sometimes blunt but always helpful.`,
  
  [BotPersonality.SPIRITUAL]: `You are Sage, a deeply spiritual astrologer who connects astrology to higher consciousness and soul purpose. You often reference karma, spiritual lessons, and divine timing. Your tone is wise, contemplative, and spiritually focused.`
};

// Gemstone and dosha knowledge base
interface GemstoneRecommendation {
  dosha: string;
  description: string;
  symptoms: string[];
  recommendedGems: {
    primary: string;
    secondary: string[];
    properties: string;
    wearingInstructions: string;
  };
  astrological_connection: string;
}

const gemstoneKnowledge: GemstoneRecommendation[] = [
  {
    dosha: "Mangal Dosha (Mars Affliction)",
    description: "Caused by Mars placement in 1st, 4th, 7th, 8th, or 12th house",
    symptoms: ["Relationship conflicts", "Delayed marriage", "Anger issues", "Accidents"],
    recommendedGems: {
      primary: "Red Coral (Moonga)",
      secondary: ["Carnelian", "Red Jasper"],
      properties: "Strengthens Mars energy positively, reduces aggression, promotes courage",
      wearingInstructions: "Wear on Tuesday, ring finger of right hand, gold or copper setting"
    },
    astrological_connection: "Mars governs energy, passion, and relationships"
  },
  {
    dosha: "Shani Dosha (Saturn Affliction)",
    description: "Caused by Saturn's malefic placement or Sade Sati period",
    symptoms: ["Chronic delays", "Depression", "Career obstacles", "Health issues"],
    recommendedGems: {
      primary: "Blue Sapphire (Neelam)",
      secondary: ["Amethyst", "Lapis Lazuli"],
      properties: "Channels Saturn's discipline positively, removes obstacles, brings stability",
      wearingInstructions: "Wear on Saturday, middle finger, silver or white gold setting"
    },
    astrological_connection: "Saturn represents karma, discipline, and life lessons"
  },
  {
    dosha: "Rahu Dosha (North Node Affliction)",
    description: "Caused by Rahu's malefic influence or conjunction with benefic planets",
    symptoms: ["Confusion", "Addiction tendencies", "Sudden losses", "Mental instability"],
    recommendedGems: {
      primary: "Hessonite Garnet (Gomed)",
      secondary: ["Smoky Quartz", "Tiger's Eye"],
      properties: "Stabilizes Rahu's energy, brings clarity, reduces confusion",
      wearingInstructions: "Wear on Saturday, middle finger, silver or panchdhatu setting"
    },
    astrological_connection: "Rahu represents desires, illusions, and material pursuits"
  },
  {
    dosha: "Ketu Dosha (South Node Affliction)",
    description: "Caused by Ketu's placement affecting spiritual and material balance",
    symptoms: ["Spiritual confusion", "Lack of focus", "Sudden changes", "Isolation"],
    recommendedGems: {
      primary: "Cat's Eye (Lehsunia)",
      secondary: ["Moonstone", "Labradorite"],
      properties: "Balances Ketu's spiritual energy, improves intuition, brings stability",
      wearingInstructions: "Wear on Thursday, ring finger, silver or gold setting"
    },
    astrological_connection: "Ketu represents spirituality, detachment, and past-life karma"
  }
];

export async function generateAstrologyResponse(
  userMessage: string,
  context: ChatContext,
  personality: BotPersonality = BotPersonality.NURTURING
): Promise<string> {
  try {
    const birthChartSummary = generateBirthChartSummary(context.birthChart);
    const doshaAnalysis = analyzeDoshas(context.birthChart);
    
    const systemMessage = `${personalityPrompts[personality]}

${context.botSystemPrompt}

Birth Chart Context for ${context.userName}:
${birthChartSummary}

Dosha Analysis:
${doshaAnalysis}

GEMSTONE EXPERTISE:
You have deep knowledge about how gemstones can resolve astrological doshas. Here's your knowledge base:

${gemstoneKnowledge.map(gem => `
**${gem.dosha}:**
- Description: ${gem.description}
- Symptoms: ${gem.symptoms.join(', ')}
- Primary Remedy: ${gem.recommendedGems.primary}
- Secondary Options: ${gem.recommendedGems.secondary.join(', ')}
- Properties: ${gem.recommendedGems.properties}
- How to Wear: ${gem.recommendedGems.wearingInstructions}
- Astrological Connection: ${gem.astrological_connection}
`).join('\n')}

IMPORTANT GUIDELINES:
- Always provide personalized insights based on the specific birth chart data
- When you identify doshas or planetary afflictions, naturally recommend appropriate gemstones
- Reference specific planetary positions, houses, and aspects when relevant
- Maintain your chosen personality throughout the conversation
- If recommending gemstones, mention they're available in your shop
- Provide practical wearing instructions for gemstones
- Keep responses conversational, warm, and encouraging
- Provide actionable advice when appropriate
- If asked about topics outside astrology, gently redirect to astrological perspectives`;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
      ...context.previousMessages.slice(-10),
      { role: "user", content: userMessage }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 800,
      temperature: personality === BotPersonality.SCIENTIFIC ? 0.5 : 0.7,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error("Failed to generate astrological response. Please try again.");
  }
}

// Helper function to analyze doshas from birth chart
function analyzeDoshas(birthChart: any): string {
  let doshaAnalysis = "Potential Doshas Identified:\n";
  
  // Example dosha detection logic - customize based on your birth chart structure
  const mars = birthChart.planets?.Mars;
  const saturn = birthChart.planets?.Saturn;
  const rahu = birthChart.planets?.Rahu;
  const ketu = birthChart.planets?.Ketu;
  
  // Check for Mangal Dosha
  if (mars && [1, 4, 7, 8, 12].includes(mars.house)) {
    doshaAnalysis += "- Mangal Dosha detected due to Mars in " + mars.house + " house\n";
  }
  
  // Check for Shani Dosha (simplified)
  if (saturn && saturn.isAfflicted) {
    doshaAnalysis += "- Saturn affliction detected\n";
  }
  
  // Add more dosha detection logic here
  
  return doshaAnalysis;
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
