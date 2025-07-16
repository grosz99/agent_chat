import { BaseAgent } from './base-agent';
import { SnowflakeConnection } from '../snowflake/connection';
import { PythonExecutor } from '../utils/python-executor';
import { DataSourceConfig } from './data-source-config';
import { logger } from '../utils/logger';
import {
  AgentContext,
  AgentResponse,
  SemanticModel,
} from '@/types/agent';

export class FlexibleDataSourceAgent extends BaseAgent {
  private snowflake: SnowflakeConnection;
  private pythonExecutor: PythonExecutor;
  private config: DataSourceConfig;
  dataSourceId: string;
  semanticModel: SemanticModel;

  constructor(config: DataSourceConfig) {
    super({
      name: config.name,
      description: config.description,
      type: 'data-source',
      capabilities: [
        {
          name: 'query_data',
          description: 'Execute SQL queries against the data source',
        },
        {
          name: 'python_analysis',
          description: 'Perform Python-based data analysis and manipulation',
        },
        {
          name: 'generate_insights',
          description: 'Generate business insights from data',
        },
        {
          name: 'create_visualizations',
          description: 'Create data visualizations',
        },
        {
          name: 'custom_functions',
          description: 'Execute custom analysis functions',
        },
      ],
    });

    this.config = config;
    this.dataSourceId = config.id;
    this.semanticModel = config.semanticModel;
    this.snowflake = new SnowflakeConnection(config.connectionConfig);
    this.pythonExecutor = new PythonExecutor(
      config.customCode || '',
      config.pythonLibraries || []
    );

    logger.info(`FlexibleDataSourceAgent initialized: ${this.name}`, {
      dataSourceId: this.dataSourceId,
      pythonLibraries: config.pythonLibraries?.length || 0,
      customCodeLength: config.customCode?.length || 0,
    });
  }

  async processQuery(query: string, context: AgentContext): Promise<AgentResponse> {
    this.updateStatus('active');
    
    try {
      await this.logActivity('processing_query', { query, dataSourceId: this.dataSourceId });

      const analysisResult = await this.analyzeQuery(query, context);
      
      if (analysisResult.needsData) {
        const data = await this.fetchData(analysisResult.sql);
        analysisResult.data = data;
        
        if (analysisResult.pythonCode) {
          const pythonResult = await this.executePythonAnalysis(analysisResult.pythonCode, data);
          if (pythonResult.success) {
            analysisResult.analysisResult = pythonResult.output;
            analysisResult.logs = pythonResult.logs;
          }
        }
      }

      const response = this.createResponse(analysisResult.explanation, {
        sql: analysisResult.sql,
        data: analysisResult.data,
        confidence: analysisResult.confidence,
        suggestions: analysisResult.suggestions,
        visualization: analysisResult.visualization,
        reasoning: analysisResult.reasoning,
        metadata: {
          dataSourceId: this.dataSourceId,
          analysisType: analysisResult.analysisType,
          pythonLogs: analysisResult.logs,
        },
      });

      this.updateStatus('idle');
      return response;

    } catch (error) {
      this.updateStatus('error');
      logger.error(`Error in FlexibleDataSourceAgent ${this.name}`, error);
      
      return this.createResponse(
        'I encountered an error while processing your query. Please try again.',
        { confidence: 0, metadata: { error: String(error) } }
      );
    }
  }

  private async analyzeQuery(query: string, context: AgentContext): Promise<any> {
    const systemPrompt = this.buildSystemPrompt();
    const analysisPrompt = this.buildAnalysisPrompt(query, context);

    const messages = [
      ...context.history,
      {
        id: '',
        role: 'user' as const,
        content: analysisPrompt,
        timestamp: new Date(),
      },
    ];

    const llmResponse = await this.callAnthropic(messages, systemPrompt);
    return this.parseAnalysisResponse(llmResponse);
  }

  private buildSystemPrompt(): string {
    let prompt = this.createSystemPrompt(this.semanticModel);
    
    prompt += `\n\nYou are specifically designed to work with the "${this.config.name}" data source.`;
    
    if (this.config.pythonLibraries && this.config.pythonLibraries.length > 0) {
      prompt += `\n\nAvailable Python libraries: ${this.config.pythonLibraries.join(', ')}`;
    }

    if (this.config.customCode) {
      prompt += `\n\nCustom functions available:\n${this.config.customCode}`;
    }

    prompt += `\n\nWhen responding, you can:
1. Generate SQL queries to fetch data
2. Write Python code for data analysis and manipulation
3. Create visualizations
4. Use custom functions if available
5. Provide business insights and recommendations

Always structure your response as JSON with the following format:
{
  "needsData": true/false,
  "sql": "SELECT statement if needed",
  "pythonCode": "Python code for analysis if needed",
  "analysisType": "summary|group_analysis|time_series|correlation|custom",
  "explanation": "Human-readable explanation",
  "reasoning": "Your reasoning process",
  "confidence": 0.0-1.0,
  "suggestions": ["follow-up suggestions"],
  "visualization": {
    "type": "bar|line|pie|table|scatter",
    "config": {...}
  }
}`;

    return prompt;
  }

  private buildAnalysisPrompt(query: string, context: AgentContext): string {
    let prompt = `User Query: "${query}"\n\n`;
    
    if (context.metadata?.filters) {
      prompt += 'Applied Filters:\n';
      Object.entries(context.metadata.filters).forEach(([key, value]) => {
        prompt += `- ${key}: ${JSON.stringify(value)}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please analyze this query and determine:
1. What data is needed from the database
2. What analysis should be performed
3. What Python code might be helpful
4. What insights can be provided
5. What visualizations would be useful

Focus on the specific capabilities of the "${this.config.name}" data source.`;

    return prompt;
  }

  private parseAnalysisResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      logger.warn('Failed to parse structured analysis response', { error });
    }

    return {
      needsData: false,
      explanation: response,
      reasoning: 'Could not parse structured response',
      confidence: 0.5,
      suggestions: [],
    };
  }

  private async fetchData(sql: string): Promise<any[]> {
    if (!sql) return [];

    try {
      await this.snowflake.connect();
      const results = await this.snowflake.execute(sql);
      
      await this.logActivity('data_fetched', {
        sql,
        rowCount: results.length,
        dataSourceId: this.dataSourceId,
      });

      return results;
    } catch (error) {
      logger.error('Failed to fetch data', { sql, error });
      throw error;
    }
  }

  private async executePythonAnalysis(code: string, data: any[]): Promise<any> {
    try {
      const result = await this.pythonExecutor.execute(code, data);
      
      await this.logActivity('python_analysis_executed', {
        codeLength: code.length,
        success: result.success,
        dataSourceId: this.dataSourceId,
      });

      return result;
    } catch (error) {
      logger.error('Python analysis failed', { error, code });
      return {
        success: false,
        error: String(error),
        logs: [],
      };
    }
  }

  async executeCustomFunction(functionName: string, data: any[], parameters?: any): Promise<any> {
    const code = `
      result = ${functionName}(df${parameters ? ', ' + JSON.stringify(parameters) : ''});
    `;

    return this.executePythonAnalysis(code, data);
  }

  async performAnalysis(analysisType: string, data: any[], parameters?: any): Promise<any> {
    return this.pythonExecutor.executeAnalysis(analysisType, data, parameters);
  }

  getDataSourceInfo(): DataSourceConfig {
    return this.config;
  }

  dispose(): void {
    this.pythonExecutor.dispose();
  }
}