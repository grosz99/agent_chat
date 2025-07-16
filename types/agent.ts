export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface AgentContext {
  conversationId: string;
  userId?: string;
  dataSourceId: string;
  semanticModel: SemanticModel;
  history: AgentMessage[];
  metadata?: Record<string, any>;
}

export interface SemanticModel {
  id: string;
  name: string;
  description: string;
  tables: TableSchema[];
  relationships: Relationship[];
  metrics: Metric[];
  dimensions: Dimension[];
}

export interface TableSchema {
  name: string;
  schema: string;
  columns: Column[];
  description?: string;
}

export interface Column {
  name: string;
  dataType: string;
  description?: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  nullable?: boolean;
}

export interface Relationship {
  fromTable: string;
  fromColumn: string;
  toTable: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface Metric {
  id: string;
  name: string;
  description: string;
  formula: string;
  dataType: 'number' | 'currency' | 'percentage';
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  table: string;
  column: string;
  dataType: string;
  hierarchies?: string[];
}

export interface AgentCapability {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'data-source' | 'orchestrator' | 'analyzer';
  capabilities: AgentCapability[];
  dataSourceId?: string;
  semanticModel?: SemanticModel;
  status: 'active' | 'idle' | 'error';
  lastActive?: Date;
}

export interface AgentResponse {
  agentId: string;
  content: string;
  data?: any;
  sql?: string;
  visualization?: VisualizationConfig;
  suggestions?: string[];
  confidence: number;
  reasoning?: string;
  metadata?: Record<string, any>;
}

export interface VisualizationConfig {
  type: 'table' | 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  data: any[];
  config: Record<string, any>;
}