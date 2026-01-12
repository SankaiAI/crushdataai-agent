import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';
import { Client } from 'pg';

export class RedshiftConnector implements Connector {
    type = 'redshift';

    private createClient(connection: Connection): Client {
        return new Client({
            host: connection.host,
            port: connection.port || 5439,
            user: connection.user,
            password: connection.password || '',
            database: connection.database,
            ssl: { rejectUnauthorized: false }, // Redshift typically requires SSL
            connectionTimeoutMillis: 10000
        });
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[Redshift] Testing connection for ${connection.name} (Host: ${connection.host})`);

        if (!connection.host || !connection.user || !connection.database) {
            throw new Error('Host, user, and database are required');
        }

        const client = this.createClient(connection);
        try {
            await client.connect();
            await client.query('SELECT GETDATE()'); // Redshift specific check
            console.log(`[Redshift] Connection test successful for ${connection.name}`);
            return true;
        } catch (error: any) {
            console.error(`[Redshift] Connection test failed:`, error.message);
            throw new Error(`Redshift connection failed: ${error.message}`);
        } finally {
            await client.end();
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[Redshift] getTables called for ${connection.name}`);

        const client = this.createClient(connection);
        try {
            await client.connect();

            const result = await client.query(`
                SELECT 
                    t.table_name as name,
                    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as row_count
                FROM information_schema.tables t
                WHERE t.table_schema = 'public'
                AND t.table_type = 'BASE TABLE'
                ORDER BY t.table_name
            `);

            return result.rows.map(row => ({
                name: row.name,
                type: 'table',
                rowCount: parseInt(row.row_count || '0', 10) // Approx or actual
            }));
        } catch (error: any) {
            console.error(`[Redshift] getTables failed:`, error.message);
            throw new Error(`Failed to fetch tables: ${error.message}`);
        } finally {
            await client.end();
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[Redshift] getData called for ${connection.name}, table: ${tableName}, page: ${page}`);

        const client = this.createClient(connection);
        try {
            await client.connect();

            // Get total row count
            const countResult = await client.query(
                `SELECT COUNT(*) as total FROM "${tableName}"`
            );
            const totalRows = parseInt(countResult.rows[0]?.total || '0', 10);

            // Get paginated data
            const offset = (page - 1) * limit;
            const dataResult = await client.query(
                `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
                [limit, offset]
            );

            const columns = dataResult.fields.map(f => f.name);
            const totalPages = Math.ceil(totalRows / limit) || 1;

            return {
                columns,
                rows: dataResult.rows,
                pagination: {
                    page,
                    limit,
                    totalRows,
                    totalPages,
                    startIdx: offset + 1,
                    endIdx: offset + dataResult.rows.length
                }
            };
        } catch (error: any) {
            console.error(`[Redshift] getData failed:`, error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        } finally {
            await client.end();
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        console.log(`[Redshift] getSchema called for ${connection.name}, table: ${tableName}`);

        const client = this.createClient(connection);
        try {
            await client.connect();

            const result = await client.query(`
                SELECT 
                    column_name as name,
                    data_type as type,
                    is_nullable as nullable
                FROM information_schema.columns 
                WHERE table_schema = 'public' AND table_name = $1
                ORDER BY ordinal_position
            `, [tableName]);

            return result.rows.map(row => ({
                name: row.name,
                type: row.type,
                nullable: row.nullable === 'YES'
            }));
        } catch (error: any) {
            console.error(`[Redshift] getSchema failed:`, error.message);
            throw new Error(`Failed to fetch schema: ${error.message}`);
        } finally {
            await client.end();
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
import psycopg2
import pandas as pd

# Connection: ${connection.name}
# Type: redshift
# Credentials loaded from environment variables (set in .env file)
connection = psycopg2.connect(
    host=os.environ["${prefix}_HOST"],
    port=int(os.environ.get("${prefix}_PORT", "5439")),
    user=os.environ["${prefix}_USER"],
    password=os.environ["${prefix}_PASSWORD"],
    dbname=os.environ["${prefix}_DATABASE"],
    sslmode='require'
)

try:
    # Example: Fetch data from a table
    query = "SELECT * FROM your_table LIMIT 100"
    df = pd.read_sql(query, connection)
    print(f"Successfully loaded {len(df)} rows from ${connection.name}")
    print(df.head())
finally:
    connection.close()
`;
        }

        return `# Language ${lang} not supported for Redshift connector yet.`;
    }

    async executeQuery(connection: Connection, query: string): Promise<any[]> {
        console.log(`[Redshift] executeQuery called for ${connection.name}`);
        const client = this.createClient(connection);
        try {
            await client.connect();
            const result = await client.query(query);
            return result.rows;
        } catch (error: any) {
            console.error(`[Redshift] executeQuery failed:`, error.message);
            throw new Error(`Failed to execute query: ${error.message}`);
        } finally {
            await client.end();
        }
    }
}
