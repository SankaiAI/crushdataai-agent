import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';
import * as sql from 'mssql';

export class MSSQLConnector implements Connector {
    type = 'sqlserver';

    private getConfig(connection: Connection): sql.config {
        return {
            user: connection.user,
            password: connection.password,
            server: connection.host || 'localhost',
            port: connection.port || 1433,
            database: connection.database,
            options: {
                encrypt: true, // Azure usage
                trustServerCertificate: true // Self-signed certs
            }
        };
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[MSSQL] Testing connection for ${connection.name}`);
        if (!connection.host || !connection.user || !connection.database) {
            throw new Error('Host, user, and database are required');
        }

        try {
            const pool = await sql.connect(this.getConfig(connection));
            await pool.request().query('SELECT GETDATE()');
            console.log(`[MSSQL] Connection test successful`);
            await pool.close();
            return true;
        } catch (error: any) {
            console.error(`[MSSQL] Connection test failed:`, error.message);
            throw new Error(`MSSQL connection failed: ${error.message}`);
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[MSSQL] getTables called for ${connection.name}`);
        try {
            const pool = await sql.connect(this.getConfig(connection));
            const result = await pool.request().query(`
                SELECT 
                    TABLE_NAME as name,
                    TABLE_TYPE as type
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
            `);
            await pool.close();

            return result.recordset.map((row: any) => ({
                name: row.name,
                type: 'table',
                rowCount: null // Expensive to count
            }));
        } catch (error: any) {
            throw new Error(`Failed to fetch tables: ${error.message}`);
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[MSSQL] getData called for ${connection.name}`);
        try {
            const pool = await sql.connect(this.getConfig(connection));
            const offset = (page - 1) * limit;

            // MSSQL needs ORDER BY for OFFSET/FETCH
            // We'll trust the table has columns, or default to a dummy sort
            const countResult = await pool.request().query(`SELECT COUNT(*) as total FROM "${tableName}"`); // Quote identifier? MSSQL uses [] or "" if set
            // Let's use clean quoting logic later, minimal for now.
            // Actually MSSQL prefers [tableName]

            const totalRows = countResult.recordset[0].total;

            const dataResult = await pool.request().query(`
                SELECT * FROM "${tableName}"
                ORDER BY (SELECT NULL)
                OFFSET ${offset} ROWS
                FETCH NEXT ${limit} ROWS ONLY
            `);

            await pool.close();

            const rows = dataResult.recordset;
            const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
            const totalPages = Math.ceil(totalRows / limit) || 1;

            return {
                columns,
                rows,
                pagination: {
                    page, limit, totalRows, totalPages,
                    startIdx: offset + 1, endIdx: offset + rows.length
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        try {
            const pool = await sql.connect(this.getConfig(connection));
            const result = await pool.request().query(`
                SELECT COLUMN_NAME as name, DATA_TYPE as type, IS_NULLABLE as nullable
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_NAME = '${tableName}'
            `);
            await pool.close();

            return result.recordset.map((row: any) => ({
                name: row.name,
                type: row.type,
                nullable: row.nullable === 'YES'
            }));
        } catch (error: any) {
            throw new Error(`Failed to fetch schema: ${error.message}`);
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        if (lang === 'python') {
            return `import os
import pyodbc
import pandas as pd

# Connection: ${connection.name}
conn_str = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={os.environ['${prefix}_HOST']},{os.environ.get('${prefix}_PORT', 1433)};"
    f"DATABASE={os.environ['${prefix}_DATABASE']};"
    f"UID={os.environ['${prefix}_USER']};"
    f"PWD={os.environ['${prefix}_PASSWORD']}"
)
conn = pyodbc.connect(conn_str)
query = "SELECT TOP 100 * FROM your_table"
df = pd.read_sql(query, conn)
`;
        }
        return '';
    }

    async executeQuery(connection: Connection, query: string): Promise<any[]> {
        try {
            const pool = await sql.connect(this.getConfig(connection));
            const result = await pool.request().query(query);
            await pool.close();
            return result.recordset;
        } catch (error: any) {
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }
}
