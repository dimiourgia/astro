import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateBirthChart } from "./services/astrology";
import { generateAstrologyResponse, generateWelcomeMessage } from "./services/openai";
import { insertUserSchema, insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register user
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phone);
      if (existingUser) {
        return res.status(400).json({ message: "User with this phone number already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: "Registration failed", error: error.message });
    }
  });

  // Get user by phone
  app.get("/api/user/:phone", async (req, res) => {
    try {
      const user = await storage.getUserByPhone(req.params.phone);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Generate birth chart
  app.post("/api/birth-chart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if chart already exists
      const existingChart = await storage.getBirthChartByUserId(userId);
      if (existingChart) {
        return res.json({ birthChart: existingChart });
      }

      // Generate new birth chart
      const chartData = await generateBirthChart(
        user.dateOfBirth,
        user.birthTime || "11:00",
        user.birthLocation,
        user.unknownBirthTime || false
      );

      const birthChart = await storage.createBirthChart({
        userId,
        chartData: chartData.chartData,
        houses: chartData.houses,
        planets: chartData.planets,
        aspects: chartData.aspects || {}
      });

      res.json({ birthChart });
    } catch (error) {
      console.error('Birth chart generation error:', error);
      res.status(500).json({ message: "Failed to generate birth chart", error: error.message });
    }
  });

  // Get birth chart
  app.get("/api/birth-chart/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const birthChart = await storage.getBirthChartByUserId(userId);
      
      if (!birthChart) {
        return res.status(404).json({ message: "Birth chart not found" });
      }
      
      res.json({ birthChart });
    } catch (error) {
      console.error('Get birth chart error:', error);
      res.status(500).json({ message: "Failed to get birth chart" });
    }
  });

  // Get all astrology bots
  app.get("/api/bots", async (req, res) => {
    try {
      const bots = await storage.getAllBots();
      res.json({ bots });
    } catch (error) {
      console.error('Get bots error:', error);
      res.status(500).json({ message: "Failed to get bots" });
    }
  });

  // Start chat session
  app.post("/api/chat/start", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      
      // Check for existing active session
      const existingSession = await storage.getActiveChatSession(sessionData.userId, sessionData.botType);
      if (existingSession) {
        return res.json({ session: existingSession });
      }

      const session = await storage.createChatSession(sessionData);
      
      // Generate welcome message
      const user = await storage.getUserById(sessionData.userId);
      const birthChart = await storage.getBirthChartByUserId(sessionData.userId);
      const bot = await storage.getBotById(sessionData.botType);
      
      if (user && birthChart && bot) {
        const welcomeMessage = await generateWelcomeMessage(user.name, birthChart, bot.name);
        
        await storage.createChatMessage({
          sessionId: session.id,
          role: 'assistant',
          content: welcomeMessage
        });
      }
      
      res.json({ session });
    } catch (error) {
      console.error('Start chat error:', error);
      res.status(400).json({ message: "Failed to start chat session", error: error.message });
    }
  });

  // Send message
  app.post("/api/chat/message", async (req, res) => {
    try {
      const messageData = insertChatMessageSchema.extend({
        sessionId: z.number()
      }).parse(req.body);

      // Save user message
      const userMessage = await storage.createChatMessage(messageData);
      
      // Get session and generate AI response
      const session = await storage.getChatSessionById(messageData.sessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      const user = await storage.getUserById(session.userId);
      const birthChart = await storage.getBirthChartByUserId(session.userId);
      const bot = await storage.getBotById(session.botType);
      const previousMessages = await storage.getMessagesBySessionId(session.id);

      if (!user || !birthChart || !bot) {
        return res.status(400).json({ message: "Missing required data for chat" });
      }

      // Generate AI response
      const aiResponse = await generateAstrologyResponse(messageData.content, {
        userName: user.name,
        birthChart,
        botSystemPrompt: bot.systemPrompt,
        previousMessages: previousMessages.slice(-10).map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      });

      // Save AI response
      const aiMessage = await storage.createChatMessage({
        sessionId: session.id,
        role: 'assistant',
        content: aiResponse
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ message: "Failed to send message", error: error.message });
    }
  });

  // Get chat messages
  app.get("/api/chat/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const messages = await storage.getMessagesBySessionId(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  // Get user's chat sessions
  app.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getChatSessionsByUserId(userId);
      res.json({ sessions });
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ message: "Failed to get chat sessions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
