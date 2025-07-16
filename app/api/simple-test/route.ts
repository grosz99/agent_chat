import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasSnowflakeAccount: !!process.env.SNOWFLAKE_ACCOUNT,
      nodeEnv: process.env.NODE_ENV
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Simple test response - agent collaboration temporarily disabled due to production issues',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'JSON parse error', details: String(error) },
      { status: 400 }
    );
  }
}