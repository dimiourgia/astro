import { 
  users, 
  birthCharts, 
  chatSessions, 
  chatMessages, 
  astrologyBots,
  type User, 
  type InsertUser,
  type BirthChart,
  type InsertBirthChart,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type AstrologyBot
} from "@shared/schema";

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  
  // Birth Charts
  createBirthChart(chart: InsertBirthChart): Promise<BirthChart>;
  getBirthChartByUserId(userId: number): Promise<BirthChart | undefined>;
  
  // Chat Sessions
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSessionById(id: number): Promise<ChatSession | undefined>;
  getActiveChatSession(userId: number, botType: string): Promise<ChatSession | undefined>;
  getChatSessionsByUserId(userId: number): Promise<ChatSession[]>;
  
  // Chat Messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getMessagesBySessionId(sessionId: number): Promise<ChatMessage[]>;
  
  // Astrology Bots
  getAllBots(): Promise<AstrologyBot[]>;
  getBotById(id: string): Promise<AstrologyBot | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private birthCharts: Map<number, BirthChart> = new Map();
  private chatSessions: Map<number, ChatSession> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private astrologyBots: Map<string, AstrologyBot> = new Map();
  
  private currentUserId = 1;
  private currentChartId = 1;
  private currentSessionId = 1;
  private currentMessageId = 1;

  constructor() {
    this.initializeBots();
  }

  private initializeBots() {
    const bots: AstrologyBot[] = [
      {
        id: "vedic-guru",
        name: "Vedic Guru",
        description: "Deep insights from ancient Vedic astrology traditions. Specializes in karma, dharma, and life purpose analysis.",
        specialization: "Traditional Astrologer",
        icon: "fas fa-om",
        color: "from-orange-400 to-red-500",
        rating: "4.9",
        systemPrompt: "You are an expert Vedic astrologer with deep knowledge of traditional Indian astrology. Provide insights based on the user's birth chart focusing on karma, dharma, life purpose, and spiritual growth. Always reference specific planetary positions and houses when giving advice."
      },
      {
        id: "love-advisor",
        name: "Love Advisor",
        description: "Specialized in synastry, compatibility analysis, and relationship timing. Find your perfect cosmic match.",
        specialization: "Relationship Expert",
        icon: "fas fa-heart",
        color: "from-pink-400 to-rose-500",
        rating: "4.8",
        systemPrompt: "You are a relationship astrologer specializing in love, partnerships, and compatibility. Analyze the user's birth chart to provide insights about their romantic nature, ideal partner qualities, relationship patterns, and timing for love. Focus on Venus, Mars, 7th house, and relevant aspects."
      },
      {
        id: "career-guide",
        name: "Career Guide",
        description: "Navigate your professional path with 10th house analysis, planetary periods, and career timing guidance.",
        specialization: "Professional Astrologer",
        icon: "fas fa-briefcase",
        color: "from-blue-400 to-indigo-500",
        rating: "4.7",
        systemPrompt: "You are a career astrology expert. Analyze the user's birth chart to provide guidance on career path, professional strengths, ideal work environments, and timing for career moves. Focus on the 10th house, Midheaven, Saturn, Jupiter, and relevant planetary periods."
      },
      {
        id: "wellness-guide",
        name: "Wellness Guide",
        description: "Holistic health insights through medical astrology, planetary influences on wellbeing, and healing guidance.",
        specialization: "Health Astrologer",
        icon: "fas fa-leaf",
        color: "from-green-400 to-emerald-500",
        rating: "4.6",
        systemPrompt: "You are a medical astrology specialist focusing on health and wellness. Analyze the user's birth chart to provide insights about health tendencies, wellness practices, and mind-body connection. Focus on the 6th house, Mars, Moon, and health-related planetary influences."
      },
      {
        id: "spiritual-mentor",
        name: "Spiritual Mentor",
        description: "Explore your soul's journey, past life connections, and spiritual evolution through your birth chart.",
        specialization: "Soul Guide",
        icon: "fas fa-meditation",
        color: "from-purple-400 to-violet-500",
        rating: "4.9",
        systemPrompt: "You are a spiritual astrology guide focusing on soul evolution, spiritual growth, and higher consciousness. Analyze the user's birth chart to provide insights about their spiritual path, soul lessons, past life influences, and spiritual practices. Focus on the 12th house, Neptune, Pluto, and karmic indicators."
      },
      {
        id: "transit-tracker",
        name: "Transit Tracker",
        description: "Stay ahead of planetary transits, retrograde periods, and optimal timing for important life decisions.",
        specialization: "Timing Expert",
        icon: "fas fa-clock",
        color: "from-yellow-400 to-orange-500",
        rating: "4.8",
        systemPrompt: "You are a timing and transit specialist in astrology. Analyze current and upcoming planetary transits to the user's birth chart. Provide insights about timing for important decisions, upcoming opportunities and challenges, and how to work with current planetary energies."
      }
    ];

    bots.forEach(bot => {
      this.astrologyBots.set(bot.id, bot);
    });
  }

  // Users
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.phone === phone);
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Birth Charts
  async createBirthChart(insertChart: InsertBirthChart): Promise<BirthChart> {
    const id = this.currentChartId++;
    const chart: BirthChart = {
      ...insertChart,
      id,
      createdAt: new Date()
    };
    this.birthCharts.set(id, chart);
    return chart;
  }

  async getBirthChartByUserId(userId: number): Promise<BirthChart | undefined> {
    return Array.from(this.birthCharts.values()).find(chart => chart.userId === userId);
  }

  // Chat Sessions
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = this.currentSessionId++;
    const session: ChatSession = {
      ...insertSession,
      id,
      isActive: true,
      createdAt: new Date()
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async getChatSessionById(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getActiveChatSession(userId: number, botType: string): Promise<ChatSession | undefined> {
    return Array.from(this.chatSessions.values()).find(
      session => session.userId === userId && session.botType === botType && session.isActive
    );
  }

  async getChatSessionsByUserId(userId: number): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values()).filter(session => session.userId === userId);
  }

  // Chat Messages
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentMessageId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getMessagesBySessionId(sessionId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  // Astrology Bots
  async getAllBots(): Promise<AstrologyBot[]> {
    return Array.from(this.astrologyBots.values());
  }

  async getBotById(id: string): Promise<AstrologyBot | undefined> {
    return this.astrologyBots.get(id);
  }
}

export const storage = new MemStorage();
