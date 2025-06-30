import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  birthTime: text("birth_time"), // Can be null if unknown
  birthLocation: text("birth_location").notNull(),
  unknownBirthTime: boolean("unknown_birth_time").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const birthCharts = pgTable("birth_charts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  chartData: jsonb("chart_data").notNull(), // Stores the flatlib chart calculation results
  houses: jsonb("houses").notNull(), // House positions
  planets: jsonb("planets").notNull(), // Planet positions
  aspects: jsonb("aspects"), // Planetary aspects
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  botType: text("bot_type").notNull(), // vedic-guru, love-advisor, career-guide, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const astrologyBots = pgTable("astrology_bots", {
  id: text("id").primaryKey(), // vedic-guru, love-advisor, etc.
  name: text("name").notNull(),
  description: text("description").notNull(),
  specialization: text("specialization").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  rating: text("rating").notNull(),
  systemPrompt: text("system_prompt").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBirthChartSchema = createInsertSchema(birthCharts).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  isActive: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type BirthChart = typeof birthCharts.$inferSelect;
export type InsertBirthChart = z.infer<typeof insertBirthChartSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type AstrologyBot = typeof astrologyBots.$inferSelect;
