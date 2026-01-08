// Connection types supported
export type ConnectionType =
    | 'mysql'
    | 'postgresql'
    | 'bigquery'
    | 'snowflake'
    | 'shopify'
    | 'csv'
    | 'custom'
    | 'sqlserver'
    | 'redshift'
    | 'databricks'
    | 'clickhouse'
    | 'mongodb';

export interface Connection {
    name: string;
    type: ConnectionType;
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    store?: string;
    apiKey?: string;
    apiSecret?: string;
    projectId?: string;
    keyFile?: string;
    account?: string;
    warehouse?: string;
    filePath?: string;
    connectionString?: string;
}

export interface Table {
    name: string;
    rowCount?: number;
}

export interface TableData {
    columns: string[];
    rows: Record<string, unknown>[];
    total: number;
    page: number;
    limit: number;
}

export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
}
