# BeaconAgent - Vercel Deployment Guide

## Quick Deploy to Vercel

1. **Clone and Deploy:**
```bash
git clone https://github.com/grosz99/agent_chat.git
cd agent_chat
vercel --prod
```

2. **Set Environment Variables** in Vercel Dashboard:
   
   **Snowflake Configuration:**
   - `SNOWFLAKE_ACCOUNT` - Your Snowflake account identifier
   - `SNOWFLAKE_USERNAME` - Snowflake username
   - `SNOWFLAKE_DATABASE` - Database name
   - `SNOWFLAKE_WAREHOUSE` - Warehouse name
   - `SNOWFLAKE_SCHEMA` - Schema name
   - `SNOWFLAKE_ROLE` - Role (e.g., SYSADMIN)
   
   **Authentication (choose one):**
   - `SNOWFLAKE_PASSWORD` - For password authentication
   - `SNOWFLAKE_PRIVATE_KEY` - For JWT authentication (recommended)
   
   **Anthropic API:**
   - `ANTHROPIC_API_KEY` - Your Anthropic API key

## Features

- **Multi-Agent Architecture**: 3 specialized data source agents (Financial, Sales Pipeline, HR Analytics)
- **Real-time Data**: Live Snowflake integration (no mock data)
- **AI-Powered**: Claude-based intelligent agent conversations
- **Cross-Source Queries**: Agent collaboration for complex data analysis
- **Modern Stack**: Next.js 15, TypeScript, Tailwind CSS

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Architecture

- **Frontend**: Next.js App Router with React components
- **Backend**: API routes for agent communication and data querying
- **Data Layer**: Snowflake connection with semantic modeling
- **AI Layer**: Anthropic Claude for agent intelligence
- **Orchestration**: Multi-agent collaboration system

## API Endpoints

- `/api/agents/query` - Single agent queries
- `/api/agents/collaborate` - Multi-agent collaboration
- `/api/health` - Health check
- `/api/test-*` - Testing endpoints for development

Built for demo purposes - perfect for showcasing julius.ai-style multi-agent data analysis capabilities.