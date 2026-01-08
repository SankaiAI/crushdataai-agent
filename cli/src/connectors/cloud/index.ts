import { Connector, Table, TableData, ColumnInfo } from '../index';
import { Connection } from '../../connections';
import { BigQuery } from '@google-cloud/bigquery';
import * as snowflake from 'snowflake-sdk';

export class BigQueryConnector implements Connector {
    type = 'bigquery';

    private createClient(connection: Connection): BigQuery {
        return new BigQuery({
            projectId: connection.projectId,
            keyFilename: connection.keyFile
        });
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[BigQuery] Testing connection for ${connection.name} (Project: ${connection.projectId})`);

        if (!connection.projectId || !connection.keyFile) {
            throw new Error('Project ID and Key File path are required');
        }

        // Check if key file exists
        const fs = await import('fs');
        if (!fs.existsSync(connection.keyFile)) {
            throw new Error(`Key file not found: ${connection.keyFile}`);
        }

        try {
            const bigquery = this.createClient(connection);
            await bigquery.getDatasets({ maxResults: 1 });
            console.log(`[BigQuery] Connection test successful for ${connection.name}`);
            return true;
        } catch (error: any) {
            console.error(`[BigQuery] Connection test failed:`, error.message);
            throw new Error(`BigQuery connection failed: ${error.message}`);
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[BigQuery] getTables called for ${connection.name}`);

        try {
            const bigquery = this.createClient(connection);
            const [datasets] = await bigquery.getDatasets();

            const tables: Table[] = [];
            for (const dataset of datasets) {
                const [datasetTables] = await dataset.getTables();
                for (const table of datasetTables) {
                    const [metadata] = await table.getMetadata();
                    tables.push({
                        name: `${dataset.id}.${table.id}`,
                        type: metadata.type || 'TABLE',
                        rowCount: parseInt(metadata.numRows || '0', 10)
                    });
                }
            }

            return tables;
        } catch (error: any) {
            console.error(`[BigQuery] getTables failed:`, error.message);
            throw new Error(`Failed to fetch tables: ${error.message}`);
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[BigQuery] getData called for ${connection.name}, table: ${tableName}, page: ${page}`);

        try {
            const bigquery = this.createClient(connection);
            const offset = (page - 1) * limit;

            const countQuery = `SELECT COUNT(*) as total FROM \`${tableName}\``;
            const [countJob] = await bigquery.createQueryJob({ query: countQuery });
            const [countRows] = await countJob.getQueryResults();
            const totalRows = parseInt(countRows[0]?.total || '0', 10);

            const dataQuery = `SELECT * FROM \`${tableName}\` LIMIT ${limit} OFFSET ${offset}`;
            const [dataJob] = await bigquery.createQueryJob({ query: dataQuery });
            const [rows] = await dataJob.getQueryResults();

            const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
            const totalPages = Math.ceil(totalRows / limit) || 1;

            return {
                columns,
                rows: rows as any[],
                pagination: {
                    page,
                    limit,
                    totalRows,
                    totalPages,
                    startIdx: offset + 1,
                    endIdx: offset + rows.length
                }
            };
        } catch (error: any) {
            console.error(`[BigQuery] getData failed:`, error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<ColumnInfo[]> {
        console.log(`[BigQuery] getSchema called for ${connection.name}, table: ${tableName}`);

        try {
            const bigquery = this.createClient(connection);
            const [dataset, table] = tableName.split('.');

            const tableRef = bigquery.dataset(dataset).table(table);
            const [metadata] = await tableRef.getMetadata();

            return (metadata.schema?.fields || []).map((field: any) => ({
                name: field.name,
                type: field.type,
                nullable: field.mode !== 'REQUIRED'
            }));
        } catch (error: any) {
            console.error(`[BigQuery] getSchema failed:`, error.message);
            throw new Error(`Failed to fetch schema: ${error.message}`);
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
from google.cloud import bigquery
import pandas as pd

# Connection: ${connection.name}
# Type: bigquery
# Credentials loaded from environment variables (set in .env file)
client = bigquery.Client.from_service_account_json(os.environ["${prefix}_KEY_FILE"])

# Example: Query a table
project_id = os.environ["${prefix}_PROJECT_ID"]
query = f"""
    SELECT * 
    FROM \`{project_id}.your_dataset.your_table\`
    LIMIT 100
"""

df = client.query(query).to_dataframe()
print(f"Successfully loaded {len(df)} rows from ${connection.name}")
print(df.head())
`;
        }

        return `# Language ${lang} not supported for BigQuery connector yet.`;
    }
}

export class SnowflakeConnector implements Connector {
    type = 'snowflake';

    private async createConnection(connection: Connection): Promise<snowflake.Connection> {
        return new Promise((resolve, reject) => {
            const conn = snowflake.createConnection({
                account: connection.account || '',
                username: connection.user || '',
                password: connection.password || '',
                warehouse: connection.warehouse,
                database: connection.database
            });

            conn.connect((err, conn) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(conn);
                }
            });
        });
    }

    private executeQuery(conn: snowflake.Connection, query: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            conn.execute({
                sqlText: query,
                complete: (err, stmt, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows || []);
                    }
                }
            });
        });
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[Snowflake] Testing connection for ${connection.name} (Account: ${connection.account})`);

        // Validate required fields
        const account = connection.account?.trim();
        const user = connection.user?.trim();
        const password = connection.password?.trim();

        if (!account) {
            throw new Error('Snowflake account is required');
        }
        if (!user) {
            throw new Error('Snowflake username is required');
        }
        if (!password) {
            throw new Error('Snowflake password is required');
        }

        let conn: snowflake.Connection | null = null;
        try {
            conn = await this.createConnection(connection);
            await this.executeQuery(conn, 'SELECT CURRENT_VERSION()');
            console.log(`[Snowflake] Connection test successful for ${connection.name}`);
            return true;
        } catch (error: any) {
            console.error(`[Snowflake] Connection test failed:`, error.message);
            throw new Error(`Snowflake connection failed: ${error.message}`);
        } finally {
            if (conn) conn.destroy(() => { });
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[Snowflake] getTables called for ${connection.name}`);

        let conn: snowflake.Connection | null = null;
        try {
            conn = await this.createConnection(connection);
            const rows = await this.executeQuery(conn, 'SHOW TABLES');

            return rows.map((row: any) => ({
                name: row.name || row.TABLE_NAME,
                type: 'table',
                rowCount: row.rows || null
            }));
        } catch (error: any) {
            console.error(`[Snowflake] getTables failed:`, error.message);
            throw new Error(`Failed to fetch tables: ${error.message}`);
        } finally {
            if (conn) conn.destroy(() => { });
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[Snowflake] getData called for ${connection.name}, table: ${tableName}, page: ${page}`);

        let conn: snowflake.Connection | null = null;
        try {
            conn = await this.createConnection(connection);
            const offset = (page - 1) * limit;

            const countRows = await this.executeQuery(conn, `SELECT COUNT(*) as TOTAL FROM "${tableName}"`);
            const totalRows = countRows[0]?.TOTAL || 0;

            const rows = await this.executeQuery(conn, `SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`);

            const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
            const totalPages = Math.ceil(totalRows / limit) || 1;

            return {
                columns,
                rows,
                pagination: {
                    page,
                    limit,
                    totalRows,
                    totalPages,
                    startIdx: offset + 1,
                    endIdx: offset + rows.length
                }
            };
        } catch (error: any) {
            console.error(`[Snowflake] getData failed:`, error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        } finally {
            if (conn) conn.destroy(() => { });
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<ColumnInfo[]> {
        console.log(`[Snowflake] getSchema called for ${connection.name}, table: ${tableName}`);

        let conn: snowflake.Connection | null = null;
        try {
            conn = await this.createConnection(connection);
            const rows = await this.executeQuery(conn, `DESCRIBE TABLE "${tableName}"`);

            return rows.map((row: any) => ({
                name: row.name || row.COLUMN_NAME,
                type: row.type || row.DATA_TYPE,
                nullable: (row.null || row.IS_NULLABLE) === 'Y'
            }));
        } catch (error: any) {
            console.error(`[Snowflake] getSchema failed:`, error.message);
            throw new Error(`Failed to fetch schema: ${error.message}`);
        } finally {
            if (conn) conn.destroy(() => { });
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
import snowflake.connector
import pandas as pd

# Connection: ${connection.name}
# Type: snowflake
# Credentials loaded from environment variables (set in .env file)
conn = snowflake.connector.connect(
    account=os.environ["${prefix}_ACCOUNT"],
    user=os.environ["${prefix}_USER"],
    password=os.environ["${prefix}_PASSWORD"],
    warehouse=os.environ.get("${prefix}_WAREHOUSE", "COMPUTE_WH"),
    database=os.environ.get("${prefix}_DATABASE", "")
)

try:
    # Example: Query a table
    query = "SELECT * FROM your_table LIMIT 100"
    cursor = conn.cursor()
    cursor.execute(query)
    df = cursor.fetch_pandas_all()
    print(f"Successfully loaded {len(df)} rows from ${connection.name}")
    print(df.head())
finally:
    conn.close()
`;
        }

        return `# Language ${lang} not supported for Snowflake connector yet.`;
    }
}
