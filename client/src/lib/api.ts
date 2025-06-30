import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  phone: string;
  name: string;
  dateOfBirth: string;
  birthTime: string | null;
  birthLocation: string;
  unknownBirthTime: boolean;
  createdAt: Date;
}

export interface BirthChart {
  id: number;
  userId: number;
  chartData: any;
  houses: any;
  planets: any;
  aspects: any;
  createdAt: Date;
}

export interface AstrologyBot {
  id: string;
  name: string;
  description: string;
  specialization: string;
  icon: string;
  color: string;
  rating: string;
  systemPrompt: string;
}

export interface ChatSession {
  id: number;
  userId: number;
  botType: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const api = {
  // Users
  async registerUser(userData: {
    phone: string;
    name: string;
    dateOfBirth: string;
    birthTime?: string;
    birthLocation: string;
    unknownBirthTime?: boolean;
  }) {
    const response = await apiRequest('POST', '/api/register', userData);
    return response.json();
  },

  async getUserByPhone(phone: string) {
    const response = await apiRequest('GET', `/api/user/${phone}`);
    return response.json();
  },

  // Birth Charts
  async generateBirthChart(userId: number) {
    const response = await apiRequest('POST', `/api/birth-chart/${userId}`);
    return response.json();
  },

  async getBirthChart(userId: number) {
    const response = await apiRequest('GET', `/api/birth-chart/${userId}`);
    return response.json();
  },

  // Bots
  async getBots() {
    const response = await apiRequest('GET', '/api/bots');
    return response.json();
  },

  // Chat
  async startChatSession(userId: number, botType: string) {
    const response = await apiRequest('POST', '/api/chat/start', { userId, botType });
    return response.json();
  },

  async sendMessage(sessionId: number, content: string) {
    const response = await apiRequest('POST', '/api/chat/message', {
      sessionId,
      role: 'user',
      content
    });
    return response.json();
  },

  async getChatMessages(sessionId: number) {
    const response = await apiRequest('GET', `/api/chat/${sessionId}/messages`);
    return response.json();
  },

  async getChatSessions(userId: number) {
    const response = await apiRequest('GET', `/api/chat/sessions/${userId}`);
    return response.json();
  }
};
