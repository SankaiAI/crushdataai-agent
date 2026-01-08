import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';
import mysql from 'mysql2/promise';

export class MySQLConnector implements Connector {
    type = 'mysql';

    async test(connection: Connection): Promise<boolean> {
        console.log(`[MySQL] Testing connection for ${connection.name} (Host: ${connection.host})`);

        if (!connection.host || !connection.user || !connection.database) {
            throw new Error('Host, user, and database are required');
        }

        let conn: mysql.Connection | null = null;
        try {
            conn = await mysql.createConnection({
                host: connection.host,
                port: connection.port || 3306,
                user: connection.user,
                password: connection.password || '',
                database: connection.database,
                connectTimeout: 10000
            });

            await conn.execute('SELECT 1');
            console.log(`[MySQL] Connection test successful for ${connection.name}`);
            return true;
        } catch (error: any) {
            console.error(`[MySQL] Connection test failed:`, error.message);
            throw new Error(`MySQL connection failed: ${error.message}`);
        } finally {
            if (conn) await conn.end();
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[MySQL] getTables called for ${connection.name}`);

        let conn: mysql.Connection | null = null;
        try {
            conn = await mysql.createConnection({
                host: connection.host,
                port: connection.port || 3306,
                user: connection.user,
                password: connection.password || '',
                database: connection.database
            });

            const [rows] = await conn.execute<mysql.RowDataPacket[]>(`
                SELECT 
                    TABLE_NAME as name,
                    TABLE_ROWS as rowCount
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
                ORDER BY TABLE_NAME
            `, [connection.database]);

            return rows.map(row => ({
                name: row.name,
                type: 'table',
                rowCount: row.rowCount
            }));
        } catch (error: any) {
            console.error(`[MySQL] getTables failed:`, error.message);
            throw new Error(`Failed to fetch tables: ${error.message}`);
        } finally {
            if (conn) await conn.end();
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[MySQL] getData called for ${connection.name}, table: ${tableName}, page: ${page}`);

        let conn: mysql.Connection | null = null;
        try {
            conn = await mysql.createConnection({
                host: connection.host,
                port: connection.port || 3306,
                user: connection.user,
                password: connection.password || '',
                database: connection.database
            });

            // Get total row count
            const [countResult] = await conn.execute<mysql.RowDataPacket[]>(
                `SELECT COUNT(*) as total FROM \`${tableName}\``
            );
            const totalRows = countResult[0]?.total || 0;

            // Get paginated data
            const offset = (page - 1) * limit;
            const [rows] = await conn.execute<mysql.RowDataPacket[]>(
                `SELECT * FROM \`${tableName}\` LIMIT ? OFFSET ?`,
                [limit, offset]
            );

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
            console.error(`[MySQL] getData failed:`, error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        } finally {
            if (conn) await conn.end();
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        console.log(`[MySQL] getSchema called for ${connection.name}, table: ${tableName}`);

        let conn: mysql.Connection | null = null;
        try {
            conn = await mysql.createConnection({
                host: connection.host,
                port: connection.port || 3306,
                user: connection.user,
                password: connection.password || '',
                database: connection.database
            });

            const [rows] = await conn.execute<mysql.RowDataPacket[]>(`
                SELECT 
                    COLUMN_NAME as name,
                    DATA_TYPE as type,
                    IS_NULLABLE as nullable
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `, [connection.database, tableName]);

            return rows.map(row => ({
                name: row.name,
                type: row.type,
                nullable: row.nullable === 'YES'
            }));
        } catch (error: any) {
            console.error(`[MySQL] getSchema failed:`, error.message);
            throw new Error(`Failed to fetch schema: ${error.message}`);
        } finally {
            if (conn) await conn.end();
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        // Generate env var names
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
import pymysql
import pandas as pd

# Connection: ${connection.name}
# Type: mysql
# Credentials loaded from environment variables (set in .env file)
connection = pymysql.connect(
    host=os.environ["${prefix}_HOST"],
    port=int(os.environ.get("${prefix}_PORT", "3306")),
    user=os.environ["${prefix}_USER"],
    password=os.environ["${prefix}_PASSWORD"],
    database=os.environ["${prefix}_DATABASE"]
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

        return `# Language ${lang} not supported for MySQL connector yet.`;
    }
}

