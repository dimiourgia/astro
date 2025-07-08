// import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
// import { createInsertSchema } from "drizzle-zod";
// import { z } from "zod";

// export const users = pgTable("users", {
//   id: serial("id").primaryKey(),
//   phone: text("phone").notNull().unique(),
//   name: text("name").notNull(),
//   dateOfBirth: text("date_of_birth").notNull(),
//   birthTime: text("birth_time"), // Can be null if unknown
//   birthLocation: text("birth_location").notNull(),
//   unknownBirthTime: boolean("unknown_birth_time").default(false),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const birthCharts = pgTable("birth_charts", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").notNull(),
//   chartData: jsonb("chart_data").notNull(), // Stores the flatlib chart calculation results
//   houses: jsonb("houses").notNull(), // House positions
//   planets: jsonb("planets").notNull(), // Planet positions
//   aspects: jsonb("aspects"), // Planetary aspects
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const chatSessions = pgTable("chat_sessions", {
//   id: serial("id").primaryKey(),
//   userId: integer("user_id").notNull(),
//   botType: text("bot_type").notNull(), // vedic-guru, love-advisor, career-guide, etc.
//   isActive: boolean("is_active").default(true),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// export const chatMessages = pgTable("chat_messages", {
//   id: serial("id").primaryKey(),
//   sessionId: integer("session_id").notNull(),
//   role: text("role").notNull(), // 'user' or 'assistant'
//   content: text("content").notNull(),
//   timestamp: timestamp("timestamp").defaultNow(),
// });

// export const astrologyBots = pgTable("astrology_bots", {
//   id: text("id").primaryKey(), // vedic-guru, love-advisor, etc.
//   name: text("name").notNull(),
//   description: text("description").notNull(),
//   specialization: text("specialization").notNull(),
//   icon: text("icon").notNull(),
//   color: text("color").notNull(),
//   rating: text("rating").notNull(),
//   systemPrompt: text("system_prompt").notNull(),
// });

// // Insert schemas
// export const insertUserSchema = createInsertSchema(users).omit({
//   id: true,
//   createdAt: true,
// });

// export const insertBirthChartSchema = createInsertSchema(birthCharts).omit({
//   id: true,
//   createdAt: true,
// });

// export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
//   id: true,
//   createdAt: true,
//   isActive: true,
// });

// export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
//   id: true,
//   timestamp: true,
// });

// // Types
// export type User = typeof users.$inferSelect;
// export type InsertUser = z.infer<typeof insertUserSchema>;
// export type BirthChart = typeof birthCharts.$inferSelect;
// export type InsertBirthChart = z.infer<typeof insertBirthChartSchema>;
// export type ChatSession = typeof chatSessions.$inferSelect;
// export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
// export type ChatMessage = typeof chatMessages.$inferSelect;
// export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
// export type AstrologyBot = typeof astrologyBots.$inferSelect;



import mongoose from 'mongoose';
import { z } from 'zod';
import crypto from 'crypto';

// Helper function to generate unique user ID with fallbacks
export const generateUniqueUserId = (birthDetails: {
  dateOfBirth: string;
  birthTime?: string;
  birthLocation: string;
}, browserId: string, fallbackData?: {
  userAgent?: string;
  ipAddress?: string;
}): string => {
  const birthString = `${birthDetails.dateOfBirth}-${birthDetails.birthTime || 'unknown'}-${birthDetails.birthLocation}`;
  
  // If browser ID looks like a fingerprint or is very short/generic, add fallback data
  let identifierString = `${birthString}-${browserId}`;
  
  if (browserId.startsWith('fp_') || browserId.length < 8 || fallbackData) {
    // Add additional identifying information for better uniqueness
    const additionalData = [
      fallbackData?.userAgent?.substring(0, 50) || '',
      fallbackData?.ipAddress || '',
    ].join('-');
    
    identifierString = `${birthString}-${browserId}-${additionalData}`;
  }
  
  return crypto.createHash('sha256').update(identifierString).digest('hex').substring(0, 16);
};

// User Schema
const userSchema = new mongoose.Schema({
  _id: {
    type: String, // Custom unique ID based on birth details + browser ID
    required: true,
  },
  browserId: {
    type: String,
    required: true,
  },
  // Birth details (required for first visit)
  name: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
  birthTime: {
    type: String,
    default: null,
  },
  birthLocation: {
    type: String,
    required: true,
  },
  unknownBirthTime: {
    type: Boolean,
    default: false,
  },
  // Contact details (collected later)
  phone: {
    type: String,
    default: null,
    sparse: true, // Allows multiple null values but enforces uniqueness when present
    unique: true,
  },
  email: {
    type: String,
    default: null,
    sparse: true,
    unique: true,
  },
  // Tracking fields
  firstVisit: {
    type: Date,
    default: Date.now,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  visitCount: {
    type: Number,
    default: 1,
  },
  // User status
  isRegistered: {
    type: Boolean,
    default: false, // True when email/phone is provided
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Pre-save middleware to update lastActive and visitCount
userSchema.pre('save', function(next) {
  if (!this.isNew) {
    this.lastActive = new Date();
    if (this.isModified('lastActive')) {
      this.visitCount += 1;
    }
  }
  next();
});

// Birth Chart Schema
const birthChartSchema = new mongoose.Schema({
  userId: {
    type: String, // References the custom user ID
    ref: 'User',
    required: true,
  },
  chartData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  houses: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  planets: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  aspects: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  // Chart metadata
  chartType: {
    type: String,
    enum: ['natal', 'transit', 'composite'],
    default: 'natal',
  },
}, {
  timestamps: true,
});

// Chat Session Schema
const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  botType: {
    type: String,
    required: true,
    enum: ['vedic-guru', 'love-advisor', 'career-guide', 'general-astrology'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sessionTitle: {
    type: String,
    default: 'New Chat',
  },
  // Session metadata
  messageCount: {
    type: Number,
    default: 0,
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Chat Message Schema
const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system'],
  },
  content: {
    type: String,
    required: true,
  },
  // Message metadata
  messageType: {
    type: String,
    enum: ['text', 'birth_details', 'email_collection', 'phone_collection'],
    default: 'text',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null, // Can store additional data like collected email, etc.
  },
}, {
  timestamps: true,
});

// Astrology Bot Schema
const astrologyBotSchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  rating: {
    type: String,
    required: true,
  },
  systemPrompt: {
    type: String,
    required: true,
  },
  // Bot configuration
  requiresRegistration: {
    type: Boolean,
    default: false,
  },
  maxFreeMessages: {
    type: Number,
    default: 10,
  },
});

// User Activity Log Schema (for tracking user interactions)
const userActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    enum: ['visit', 'birth_details_entered', 'chat_started', 'email_provided', 'phone_provided', 'chart_generated'],
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    default: null,
  },
  userAgent: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

// Create Models
export const User = mongoose.model('User', userSchema);
export const BirthChart = mongoose.model('BirthChart', birthChartSchema);
export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export const AstrologyBot = mongoose.model('AstrologyBot', astrologyBotSchema);
export const UserActivity = mongoose.model('UserActivity', userActivitySchema);

// Zod Validation Schemas
export const birthDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  birthTime: z.string().optional(),
  birthLocation: z.string().min(1, 'Birth location is required'),
  unknownBirthTime: z.boolean().optional(),
});

export const createUserSchema = z.object({
  browserId: z.string().min(1, 'Browser ID is required'),
  ...birthDetailsSchema.shape,
});

export const updateUserContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

export const insertBirthChartSchema = z.object({
  userId: z.string(),
  chartData: z.any(),
  houses: z.any(),
  planets: z.any(),
  aspects: z.any().optional(),
  chartType: z.enum(['natal', 'transit', 'composite']).optional(),
});

export const insertChatSessionSchema = z.object({
  userId: z.string(),
  botType: z.string(),
  sessionTitle: z.string().optional(),
});

export const insertChatMessageSchema = z.object({
  sessionId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  messageType: z.enum(['text', 'birth_details', 'email_collection', 'phone_collection']).optional(),
  metadata: z.any().optional(),
});

export const insertUserActivitySchema = z.object({
  userId: z.string(),
  action: z.enum(['visit', 'birth_details_entered', 'chat_started', 'email_provided', 'phone_provided', 'chart_generated']),
  details: z.any().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// TypeScript Types
export type UserDocument = mongoose.Document & {
  _id: string;
  browserId: string;
  name: string;
  dateOfBirth: string;
  birthTime?: string;
  birthLocation: string;
  unknownBirthTime: boolean;
  phone?: string;
  email?: string;
  firstVisit: Date;
  lastActive: Date;
  visitCount: number;
  isRegistered: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BirthChartDocument = mongoose.Document & {
  userId: string;
  chartData: any;
  houses: any;
  planets: any;
  aspects?: any;
  chartType: 'natal' | 'transit' | 'composite';
  createdAt: Date;
  updatedAt: Date;
};

export type ChatSessionDocument = mongoose.Document & {
  userId: string;
  botType: string;
  isActive: boolean;
  sessionTitle: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ChatMessageDocument = mongoose.Document & {
  sessionId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  messageType: 'text' | 'birth_details' | 'email_collection' | 'phone_collection';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
};

export type UserActivityDocument = mongoose.Document & {
  userId: string;
  action: 'visit' | 'birth_details_entered' | 'chat_started' | 'email_provided' | 'phone_provided' | 'chart_generated';
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
};

// Inferred types for inserts
export type CreateUser = z.infer<typeof createUserSchema>;
export type BirthDetails = z.infer<typeof birthDetailsSchema>;
export type UpdateUserContact = z.infer<typeof updateUserContactSchema>;
export type InsertBirthChart = z.infer<typeof insertBirthChartSchema>;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;

// Helper functions for user management
export const createOrUpdateUser = async (
  birthDetails: BirthDetails, 
  browserId: string,
  requestData?: {
    userAgent?: string;
    ipAddress?: string;
  }
) => {
  const uniqueId = generateUniqueUserId(birthDetails, browserId, requestData);
  
  const user = await User.findByIdAndUpdate(
    uniqueId,
    {
      $set: {
        ...birthDetails,
        browserId,
        lastActive: new Date(),
      },
      $inc: { visitCount: 1 },
      $setOnInsert: {
        _id: uniqueId,
        firstVisit: new Date(),
        visitCount: 1,
        isRegistered: false,
        hasCompletedOnboarding: false,
      },
    },
    { upsert: true, new: true }
  );
  
  return user;
};

export const updateUserEmail = async (userId: string, email: string) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        email,
        isRegistered: true,
        lastActive: new Date(),
      },
    },
    { new: true }
  );
};

export const updateUserPhone = async (userId: string, phone: string) => {
  return await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        phone,
        isRegistered: true,
        lastActive: new Date(),
      },
    },
    { new: true }
  );
};