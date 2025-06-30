# Astrology Chat Application

## Overview

This is a full-stack astrology application that provides personalized birth chart generation and AI-powered astrology consultations. The application combines modern web technologies with traditional Vedic astrology calculations to deliver personalized astrological insights through various specialized AI chatbots.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom cosmic theme
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Development**: Vite for development server and hot reloading
- **Build**: ESBuild for production bundling
- **Storage**: In-memory storage with interface for future database integration

### Astrology Engine
- **Language**: Python
- **Library**: Flatlib for Vedic astrology calculations
- **Geocoding**: Geopy for location coordinate resolution
- **Integration**: Spawned Python processes for chart generation

### AI Integration
- **Provider**: OpenAI GPT-4o for astrological consultations
- **Context**: Personalized responses based on birth chart data
- **Specialization**: Multiple specialized astrology bots

## Key Components

### User Management
- Phone-based registration system
- User profile storage with birth details
- Birth time handling (including unknown time scenarios)

### Birth Chart Generation
- Vedic astrology chart calculations using Flatlib
- House, planet, and aspect calculations
- Geocoding integration for accurate location-based charts
- Visual chart display with traditional Vedic square layout

### Chat System
- Multiple specialized astrology bots (Vedic Guru, Love Advisor, Career Guide, etc.)
- Session-based conversations
- Context-aware AI responses incorporating birth chart data
- Real-time message exchange

### Data Models
- Users with birth information
- Birth charts with calculated astrological data
- Chat sessions and messages
- Astrology bot configurations

## Data Flow

1. **User Registration**: Phone number → User details collection → Birth chart generation
2. **Chart Generation**: Birth data → Python astrology service → Chart calculations → Storage
3. **Chat Interaction**: User message → AI service with chart context → Personalized response
4. **Bot Selection**: Available bots → User choice → Specialized consultation session

## External Dependencies

### Python Libraries
- `flatlib`: Vedic astrology calculations
- `geopy`: Geocoding for location resolution
- `pytz`: Timezone handling

### Node.js Dependencies
- `@neondatabase/serverless`: Database connectivity (future PostgreSQL integration)
- `drizzle-orm`: Type-safe database ORM
- `openai`: AI chat integration
- `express`: Web server framework
- `@tanstack/react-query`: Data fetching and caching
- `@radix-ui/*`: UI component primitives
- `wouter`: Lightweight routing
- `zod`: Schema validation

### Development Tools
- `vite`: Development server and build tool
- `tailwindcss`: Utility-first CSS framework
- `typescript`: Type safety
- `drizzle-kit`: Database migrations

## Deployment Strategy

### Development
- Vite development server with HMR
- In-memory storage for rapid prototyping
- Python service spawning for astrology calculations

### Production
- Static file serving through Express
- ESBuild bundling for optimized JavaScript
- Environment variable configuration for API keys
- Database migration support through Drizzle

### Database Strategy
- Current: In-memory storage implementation
- Future: PostgreSQL with Drizzle ORM
- Schema defined with proper relationships
- Migration system ready for deployment

## Changelog
- June 30, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.