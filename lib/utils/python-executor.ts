import ivm from 'isolated-vm';
import { logger } from './logger';

export interface PythonExecutionResult {
  success: boolean;
  output?: any;
  error?: string;
  logs?: string[];
}

export class PythonExecutor {
  private isolate: ivm.Isolate;
  private context: ivm.Context;
  private customCode: string;
  private availableLibraries: string[];

  constructor(customCode: string = '', availableLibraries: string[] = []) {
    this.isolate = new ivm.Isolate({ memoryLimit: 128 });
    this.context = this.isolate.createContextSync();
    this.customCode = customCode;
    this.availableLibraries = availableLibraries;
    
    this.setupPythonEnvironment();
  }

  private setupPythonEnvironment(): void {
    // Create a Python-like environment in JavaScript
    const pythonEnv = `
      // Python-like functions implemented in JavaScript
      
      // Pandas-like DataFrame simulation
      class DataFrame {
        constructor(data) {
          this.data = data;
          this.columns = data.length > 0 ? Object.keys(data[0]) : [];
        }
        
        groupby(column) {
          const groups = {};
          this.data.forEach(row => {
            const key = row[column];
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
          });
          return new GroupBy(groups);
        }
        
        head(n = 5) {
          return this.data.slice(0, n);
        }
        
        describe() {
          const stats = {};
          this.columns.forEach(col => {
            const values = this.data.map(row => row[col]).filter(v => typeof v === 'number');
            if (values.length > 0) {
              stats[col] = {
                count: values.length,
                mean: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values)
              };
            }
          });
          return stats;
        }
        
        sort_values(by, ascending = true) {
          const sorted = [...this.data].sort((a, b) => {
            if (ascending) return a[by] - b[by];
            return b[by] - a[by];
          });
          return new DataFrame(sorted);
        }
        
        to_dict() {
          return this.data;
        }
      }
      
      class GroupBy {
        constructor(groups) {
          this.groups = groups;
        }
        
        agg(aggFunc) {
          const result = {};
          Object.keys(this.groups).forEach(key => {
            const group = this.groups[key];
            if (typeof aggFunc === 'string') {
              result[key] = this.applyAggregation(group, aggFunc);
            } else if (typeof aggFunc === 'object') {
              result[key] = {};
              Object.keys(aggFunc).forEach(col => {
                const funcs = Array.isArray(aggFunc[col]) ? aggFunc[col] : [aggFunc[col]];
                result[key][col] = {};
                funcs.forEach(func => {
                  result[key][col][func] = this.applyAggregation(
                    group.map(row => row[col]).filter(v => v !== null && v !== undefined),
                    func
                  );
                });
              });
            }
          });
          return result;
        }
        
        applyAggregation(values, func) {
          if (typeof values[0] === 'object') {
            values = values.map(v => typeof v === 'number' ? v : 0);
          }
          
          switch (func) {
            case 'sum':
              return values.reduce((a, b) => a + b, 0);
            case 'mean':
            case 'avg':
              return values.reduce((a, b) => a + b, 0) / values.length;
            case 'count':
              return values.length;
            case 'min':
              return Math.min(...values);
            case 'max':
              return Math.max(...values);
            default:
              return values;
          }
        }
        
        sum() {
          return this.agg('sum');
        }
        
        mean() {
          return this.agg('mean');
        }
        
        count() {
          return this.agg('count');
        }
      }
      
      // Numpy-like functions
      const np = {
        sum: (arr) => arr.reduce((a, b) => a + b, 0),
        mean: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
        max: (arr) => Math.max(...arr),
        min: (arr) => Math.min(...arr),
        std: (arr) => {
          const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
          const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
          return Math.sqrt(variance);
        }
      };
      
      // Pandas-like functions
      const pd = {
        DataFrame: DataFrame,
        to_datetime: (dates) => dates.map(d => new Date(d))
      };
      
      // Matplotlib-like plotting (returns config for frontend)
      const plt = {
        figure: () => ({ type: 'figure', plots: [] }),
        plot: (x, y, options = {}) => ({ type: 'line', x, y, options }),
        bar: (x, y, options = {}) => ({ type: 'bar', x, y, options }),
        scatter: (x, y, options = {}) => ({ type: 'scatter', x, y, options }),
        hist: (data, options = {}) => ({ type: 'histogram', data, options }),
        show: () => null
      };
      
      // Seaborn-like functions
      const sns = {
        barplot: (x, y, data, options = {}) => ({ type: 'bar', x, y, data, options }),
        lineplot: (x, y, data, options = {}) => ({ type: 'line', x, y, data, options }),
        scatterplot: (x, y, data, options = {}) => ({ type: 'scatter', x, y, data, options })
      };
      
      // Custom code will be injected separately
      
      // Global variables
      let result = null;
      let plots = [];
      let logs = [];
      
      // Console log capture
      const console = {
        log: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push('ERROR: ' + args.join(' ')),
        warn: (...args) => logs.push('WARN: ' + args.join(' '))
      };
    `;

    this.context.evalSync(pythonEnv);
    
    // Inject custom code separately to avoid template literal issues
    if (this.customCode) {
      try {
        // Convert Python-like syntax to JavaScript comments for now
        const jsCustomCode = `
          // Custom functions (converted from Python)
          /* 
          ${this.customCode}
          */
        `;
        this.context.evalSync(jsCustomCode);
      } catch (error) {
        logger.error('Failed to inject custom code', { error, customCode: this.customCode });
      }
    }
  }

  async execute(code: string, data?: any): Promise<PythonExecutionResult> {
    try {
      // Inject data if provided
      if (data) {
        const dataInjection = `
          const df = new pd.DataFrame(${JSON.stringify(data)});
          const data = ${JSON.stringify(data)};
        `;
        this.context.evalSync(dataInjection);
      }

      // Execute the Python-like code
      const executionCode = `
        try {
          ${code}
        } catch (error) {
          logs.push('ERROR: ' + error.message);
          result = { error: error.message };
        }
      `;

      this.context.evalSync(executionCode);

      // Get results
      const result = await this.context.eval('result', { timeout: 30000 });
      const logs = await this.context.eval('logs', { timeout: 5000 });
      const plots = await this.context.eval('plots', { timeout: 5000 });

      logger.info('Python code executed successfully', { 
        codeLength: code.length, 
        hasResult: !!result 
      });

      return {
        success: true,
        output: result,
        logs: logs || [],
      };

    } catch (error) {
      logger.error('Python execution failed', { error, code });
      return {
        success: false,
        error: String(error),
        logs: [],
      };
    }
  }

  async executeAnalysis(analysisType: string, data: any, parameters?: any): Promise<PythonExecutionResult> {
    const analysisCode = this.generateAnalysisCode(analysisType, parameters);
    return this.execute(analysisCode, data);
  }

  private generateAnalysisCode(analysisType: string, parameters?: any): string {
    switch (analysisType) {
      case 'summary_statistics':
        return `
          result = df.describe();
        `;
      
      case 'group_analysis':
        return `
          const groupBy = '${parameters?.groupBy || 'CATEGORY'}';
          const metric = '${parameters?.metric || 'SALES'}';
          result = df.groupby(groupBy).agg({[metric]: ['sum', 'mean', 'count']});
        `;
      
      case 'time_series':
        return `
          const dateCol = '${parameters?.dateColumn || 'ORDER_DATE'}';
          const metric = '${parameters?.metric || 'SALES'}';
          // Convert dates and group by month
          const monthly = {};
          df.data.forEach(row => {
            const date = new Date(row[dateCol]);
            const monthKey = date.getFullYear() + '-' + (date.getMonth() + 1).toString().padStart(2, '0');
            if (!monthly[monthKey]) monthly[monthKey] = [];
            monthly[monthKey].push(row[metric]);
          });
          
          result = Object.keys(monthly).map(month => ({
            month,
            total: monthly[month].reduce((a, b) => a + b, 0),
            count: monthly[month].length,
            average: monthly[month].reduce((a, b) => a + b, 0) / monthly[month].length
          }));
        `;
      
      case 'correlation':
        return `
          const col1 = '${parameters?.column1 || 'SALES'}';
          const col2 = '${parameters?.column2 || 'PROFIT'}';
          const values1 = df.data.map(row => row[col1]).filter(v => typeof v === 'number');
          const values2 = df.data.map(row => row[col2]).filter(v => typeof v === 'number');
          
          const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
          const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
          
          const numerator = values1.reduce((acc, val, i) => acc + (val - mean1) * (values2[i] - mean2), 0);
          const denominator = Math.sqrt(
            values1.reduce((acc, val) => acc + Math.pow(val - mean1, 2), 0) *
            values2.reduce((acc, val) => acc + Math.pow(val - mean2, 2), 0)
          );
          
          result = {
            correlation: numerator / denominator,
            column1: col1,
            column2: col2
          };
        `;
      
      default:
        return `
          result = { error: 'Unknown analysis type: ${analysisType}' };
        `;
    }
  }

  dispose(): void {
    this.isolate.dispose();
  }
}