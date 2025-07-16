import snowflake from 'snowflake-sdk';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface SnowflakeConfig {
  account: string;
  username: string;
  password?: string;
  database: string;
  schema: string;
  warehouse: string;
  role?: string;
  privateKeyPath?: string;
}

export class SnowflakeConnection {
  private connection: snowflake.Connection | null = null;
  private config: SnowflakeConfig;

  constructor(config?: SnowflakeConfig) {
    this.config = config || {
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USER!,
      database: process.env.SNOWFLAKE_DATABASE!,
      schema: process.env.SNOWFLAKE_SCHEMA!,
      warehouse: process.env.SNOWFLAKE_WAREHOUSE!,
      role: process.env.SNOWFLAKE_ROLE || 'SYSADMIN',
      privateKeyPath: path.join(process.cwd(), 'private_key.pem'),
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info('Connecting to Snowflake...', { account: this.config.account });

      // Read the private key for JWT authentication
      const privateKey = process.env.SNOWFLAKE_PRIVATE_KEY || 
        (this.config.privateKeyPath 
          ? fs.readFileSync(this.config.privateKeyPath, 'utf8')
          : undefined);

      const connectionConfig: any = {
        account: this.config.account,
        username: this.config.username,
        database: this.config.database,
        schema: this.config.schema,
        warehouse: this.config.warehouse,
        role: this.config.role,
      };

      // Use RSA key authentication if available, otherwise fallback to password
      if (privateKey) {
        connectionConfig.authenticator = 'SNOWFLAKE_JWT';
        connectionConfig.privateKey = privateKey;
        connectionConfig.privateKeyPassphrase = undefined;
      } else if (this.config.password) {
        connectionConfig.password = this.config.password;
      } else {
        reject(new Error('No authentication method provided (password or private key)'));
        return;
      }

      this.connection = snowflake.createConnection(connectionConfig);

      this.connection.connect((err, conn) => {
        if (err) {
          logger.error('Failed to connect to Snowflake', err);
          reject(err);
        } else {
          logger.info('Successfully connected to Snowflake');
          resolve();
        }
      });
    });
  }

  async execute(query: string, params?: any[]): Promise<any[]> {
    if (!this.connection) {
      await this.connect();
    }

    return new Promise((resolve, reject) => {
      const timer = logger.startTimer();

      logger.logSnowflakeQuery(query, params);

      this.connection!.execute({
        sqlText: query,
        binds: params,
        complete: (err, stmt, rows) => {
          const duration = timer();

          if (err) {
            logger.error('Snowflake query failed', { query, error: err });
            reject(err);
          } else {
            logger.logSnowflakeQuery(query, params, duration);
            resolve(rows || []);
          }
        },
      });
    });
  }

  async getTableSchema(tableName: string): Promise<any[]> {
    const query = `
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${this.config.schema}'
        AND TABLE_NAME = '${tableName}'
      ORDER BY ORDINAL_POSITION;
    `;

    return this.execute(query);
  }

  async getTables(): Promise<string[]> {
    const query = `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = '${this.config.schema}'
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME;
    `;

    const results = await this.execute(query);
    return results.map(row => row.TABLE_NAME);
  }

  async getTableRelationships(): Promise<any[]> {
    const query = `
      SELECT 
        fk.constraint_name,
        fk.table_name,
        fk.column_name,
        pk.table_name as referenced_table,
        pk.column_name as referenced_column
      FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
      JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
        ON tc.constraint_name = rc.constraint_name
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE fk
        ON tc.constraint_name = fk.constraint_name
      JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE pk
        ON rc.unique_constraint_name = pk.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = '${this.config.schema}';
    `;

    return this.execute(query);
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      return new Promise((resolve, reject) => {
        this.connection!.destroy((err) => {
          if (err) {
            logger.error('Error disconnecting from Snowflake', err);
            reject(err);
          } else {
            logger.info('Disconnected from Snowflake');
            this.connection = null;
            resolve();
          }
        });
      });
    }
  }
}

export const snowflakeConnection = new SnowflakeConnection();