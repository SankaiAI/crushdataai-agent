
import { getConnection } from '../connections';
import { ChartQuery, ChartData } from '../types/dashboard';
import { PostgreSQLConnector } from '../connectors/postgresql';
import { MySQLConnector } from '../connectors/mysql';
import { BigQueryConnector, SnowflakeConnector } from '../connectors/cloud';
import { RedshiftConnector } from '../connectors/redshift';
import { MSSQLConnector } from '../connectors/mssql';
import { ClickHouseConnector } from '../connectors/clickhouse';
import { DatabricksConnector } from '../connectors/databricks';
import { MongoDBConnector } from '../connectors/mongodb';
import { ShopifyConnector } from '../connectors/shopify';
import { CSVConnector } from '../connectors/csv';

export class QueryExecutor {
    static async execute(query: ChartQuery): Promise<ChartData> {
        if (!query.connection) {
            throw new Error('No connection specified in query');
        }

        const connectionConfig = getConnection(query.connection);
        if (!connectionConfig) {
            throw new Error(`Connection "${query.connection}" not found`);
        }

        let result: any[];

        // Execute query based on connection type
        switch (connectionConfig.type) {
            case 'postgresql': {
                const connector = new PostgreSQLConnector();
                if (!query.sql) throw new Error('SQL query required for Postgres');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'mysql': {
                const connector = new MySQLConnector();
                if (!query.sql) throw new Error('SQL query required for MySQL');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'bigquery': {
                const connector = new BigQueryConnector();
                if (!query.sql) throw new Error('SQL query required for BigQuery');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'snowflake': {
                const connector = new SnowflakeConnector();
                if (!query.sql) throw new Error('SQL query required for Snowflake');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'shopify': {
                const connector = new ShopifyConnector();
                // For Shopify, query.sql is treated as the table name/endpoint
                const tableName = query.sql?.trim() || 'orders';
                // Shopify API max is 250 per request
                const tableData = await connector.getData(connectionConfig, tableName, 1, 250);
                result = tableData.rows;
                break;
            }
            case 'csv': {
                const connector = new CSVConnector();
                // CSV simply reads the file path from connection config
                // fetch 1000 rows max for visualization performance
                const tableData = await connector.getData(connectionConfig, 'csv', 1, 1000);
                result = tableData.rows;
                break;
            }
            case 'redshift': {
                const connector = new RedshiftConnector();
                if (!query.sql) throw new Error('SQL query required for Redshift');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'sqlserver': {
                const connector = new MSSQLConnector();
                if (!query.sql) throw new Error('SQL query required for SQL Server');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'clickhouse': {
                const connector = new ClickHouseConnector();
                if (!query.sql) throw new Error('SQL query required for ClickHouse');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'databricks': {
                const connector = new DatabricksConnector();
                if (!query.sql) throw new Error('SQL query required for Databricks');
                result = await connector.executeQuery(connectionConfig, query.sql);
                break;
            }
            case 'mongodb': {
                const connector = new MongoDBConnector();
                // Treat query.sql as collection name for simple refresh, similar to Shopify
                const collectionName = query.sql?.trim() || 'users';
                const tableData = await connector.getData(connectionConfig, collectionName, 1, 1000);
                result = tableData.rows;
                break;
            }
            default:
                throw new Error(`Unsupported connection type: ${connectionConfig.type}`);
        }

        // Transform result to ChartData format
        return this.transformToChartData(result, query);
    }

    private static transformToChartData(data: any[], query: ChartQuery): ChartData {
        if (!data || data.length === 0) {
            return { labels: [], datasets: [] };
        }

        // Auto-detect labels (first string/date column)
        const keys = Object.keys(data[0]);
        const labelKey = keys.find(k =>
            typeof data[0][k] === 'string' || data[0][k] instanceof Date
        ) || keys[0];

        const labels = data.map(row => String(row[labelKey]));

        // Create datasets for all numeric columns
        const valueKeys = keys.filter(k => k !== labelKey && typeof data[0][k] === 'number');

        const datasets = valueKeys.map((key, i) => ({
            label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
            values: data.map(row => Number(row[key]))
        }));

        return { labels, datasets };
    }
}
