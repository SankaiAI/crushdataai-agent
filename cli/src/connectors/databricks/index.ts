import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';
import { DBSQLClient } from '@databricks/sql';
import type IDBSQLSession from '@databricks/sql/dist/contracts/IDBSQLSession';

export class DatabricksConnector implements Connector {
    type = 'databricks';

    private async createSession(connection: Connection): Promise<{ client: DBSQLClient; session: IDBSQLSession }> {
        const client = new DBSQLClient();

        const token = connection.apiKey || connection.password;
        const host = connection.host;
        const path = connection.connectionString; // mapped from HTTP Path

        if (!token || !host || !path) {
            throw new Error('Host, Token (API Key), and HTTP Path (Connection String) are required for Databricks');
        }

        await client.connect({ token, host, path });
        const session = await client.openSession();
        return { client, session };
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[Databricks] Testing connection for ${connection.name}`);
        try {
            const { client, session } = await this.createSession(connection);
            const op = await session.executeStatement('SELECT 1');
            await op.close();
            await session.close();
            await client.close();
            return true;
        } catch (error: any) {
            throw new Error(`Databricks connection failed: ${error.message}`);
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[Databricks] getTables called for ${connection.name}`);
        try {
            const { client, session } = await this.createSession(connection);
            const op = await session.executeStatement('SHOW TABLES');
            const rows = await op.fetchAll();
            await op.close();
            await session.close();
            await client.close();

            return rows.map((row: any) => ({
                name: row.tableName || row.name,
                type: 'table',
                rowCount: null
            }));
        } catch (error: any) {
            throw new Error(`Failed to fetch tables: ${error.message}`);
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[Databricks] getData called for ${connection.name}`);
        try {
            const { client, session } = await this.createSession(connection);

            // Count
            const countOp = await session.executeStatement(`SELECT COUNT(*) as total FROM ${tableName}`);
            const countRows = await countOp.fetchAll();
            await countOp.close();
            const totalRows = parseInt((countRows[0] as any)?.total || '0', 10);

            // Data
            const dataOp = await session.executeStatement(`SELECT * FROM ${tableName} LIMIT ${limit}`);
            const rows = await dataOp.fetchAll();
            await dataOp.close();
            await session.close();
            await client.close();

            const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
            const totalPages = Math.ceil(totalRows / limit) || 1;

            return {
                columns,
                rows,
                pagination: {
                    page, limit, totalRows, totalPages,
                    startIdx: 1, endIdx: rows.length
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        return [];
    }

    getSnippet(connection: Connection, lang: string): string {
        return '';
    }

    async executeQuery(connection: Connection, query: string): Promise<any[]> {
        try {
            const { client, session } = await this.createSession(connection);
            const op = await session.executeStatement(query);
            const rows = await op.fetchAll();
            await op.close();
            await session.close();
            await client.close();
            return rows;
        } catch (error: any) {
            throw new Error(`Failed to execute query: ${error.message}`);
        }
    }
}
