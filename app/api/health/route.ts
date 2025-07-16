import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasSnowflakeAccount: !!process.env.SNOWFLAKE_ACCOUNT,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  });
}