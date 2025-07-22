import { NextRequest, NextResponse } from 'next/server';
import { NCCDatabase } from '@/lib/ncc-agent/ncc-database';
import { KnowledgeBase } from '@/lib/ncc-agent/knowledge-base';

// Initialize services on demand to ensure env vars are loaded
let nccDatabase: NCCDatabase | null = null;
let knowledgeBase: KnowledgeBase | null = null;

function getNCCDatabase() {
  if (!nccDatabase) {
    console.log('Initializing NCC Database...');
    nccDatabase = new NCCDatabase();
  }
  return nccDatabase;
}

function getKnowledgeBase() {
  if (!knowledgeBase) {
    knowledgeBase = new KnowledgeBase();
  }
  return knowledgeBase;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, action = 'chat' } = body;

    if (action === 'chat') {
      console.log('NCC Agent chat request:', message);
      
      // Get data from NCC database
      const dbResult = await getNCCDatabase().queryData(message);
      console.log('Database result:', dbResult);
      
      // Get context from knowledge base
      const kbContext = getKnowledgeBase().getContextForQuery(message);
      console.log('Knowledge base context length:', kbContext.length);
      
      // Prepare context for OpenAI
      const context = dbResult.error 
        ? `Database query failed: ${dbResult.error}`
        : `Database query results: ${JSON.stringify(dbResult.data, null, 2)}`;
      
      const fullContext = `Database context: ${context}\n\nKnowledge Base Context: ${kbContext}`;
      console.log('Full context length:', fullContext.length);

      // Call OpenAI API
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a specialized business intelligence assistant for analyzing consulting firm financial data. You have access to the NCC (Net Cash Contribution) database and uploaded knowledge base files.

BUSINESS CONTEXT:
- NCC = Net Cash Contribution (key performance metric for consulting projects)
- Data includes: Client projects, Regional offices, Business sectors, Timesheet charges, Adjustments
- Regions: Asia Pacific, EMESA, North America
- Offices: Singapore, Sydney, Munich, London, etc.
- Sectors: Industrial Goods, Consumer, TMT (Technology, Media, Telecom), Financial Institutions

KNOWLEDGE BASE:
- You have access to uploaded documents that provide additional business context
- Use both database data AND knowledge base documents to provide comprehensive answers
- Reference specific documents when relevant

RESPONSE STYLE:
- Always provide business insights, not just raw data
- Calculate percentages, trends, and comparisons when relevant
- Explain what the numbers mean for business performance
- Suggest actionable insights when possible
- Format responses in a professional, executive summary style
- Reference uploaded documents when they contain relevant information
- When analyzing data, explain what's shown in the accompanying data table
- Highlight key data points that executives should focus on in the table`
            },
            {
              role: 'user',
              content: `User question: ${message}\n\n${fullContext}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      if (!openaiResponse.ok) {
        console.error('OpenAI API error:', openaiResponse.status, await openaiResponse.text());
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      console.log('OpenAI response:', openaiData);

      // Extract data for table generation
      const tableData = dbResult.error ? [] : dbResult.data;
      const hasData = tableData && tableData.length > 0;
      
      return NextResponse.json({
        response: openaiData.choices?.[0]?.message?.content || 'No response generated',
        database_queried: true,
        database_status: dbResult.error ? 'error' : 'success',
        status: 'success',
        table_data: hasData ? {
          headers: hasData ? Object.keys(tableData[0]) : [],
          rows: tableData,
          total_rows: tableData.length,
          downloadable: true
        } : null,
        debug: {
          db_result: dbResult.error ? 'error' : 'success',
          kb_docs: getKnowledgeBase().getAllDocuments().length,
          openai_used: !!openaiData.choices?.[0]?.message?.content,
          table_rows: hasData ? tableData.length : 0
        }
      });
    }

    if (action === 'upload') {
      // Upload file to knowledge base
      const { filename, content, type } = body;
      
      const result = getKnowledgeBase().addDocument(filename, content, type);
      return NextResponse.json({
        status: result.status,
        message: result.status === 'success' ? `File ${filename} added to knowledge base` : 'Upload failed'
      });
    }

    if (action === 'list-files') {
      // List knowledge base files
      const documents = getKnowledgeBase().getAllDocuments();
      return NextResponse.json({
        files: documents.map(doc => ({
          filename: doc.filename,
          type: doc.type,
          created_at: doc.created_at
        })),
        count: documents.length
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('NCC Agent API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Health check for NCC agent
    const dbHealth = await getNCCDatabase().testConnection();
    
    return NextResponse.json({
      status: 'healthy',
      ncc_agent: 'available',
      database: dbHealth.status,
      knowledge_base: 'available',
      documents_count: getKnowledgeBase().getAllDocuments().length
    });

  } catch (error) {
    console.error('NCC Agent health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        ncc_agent: 'unavailable',
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}