import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';
import { createClient } from '@clickhouse/client';

export class ClickHouseConnector implements Connector {
    type = 'clickhouse';

    private createClient(connection: Connection) {
        let url = connection.host || 'http://localhost:8123';
        if (!url.startsWith('http')) {
            url = `http://${url}`;
        }

        return createClient({
            url,
            username: connection.user || 'default',
            password: connection.password || '',
            database: connection.database || 'default',
            request_timeout: 10000,
        });
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[ClickHouse] Testing connection for ${connection.name}`);
        try {
            const client = this.createClient(connection);
            await client.query({ query: 'SELECT 1' });
            console.log(`[ClickHouse] Connection test successful`);
            await client.close();
            return true;
        } catch (error: any) {
            console.error(`[ClickHouse] Connection test failed:`, error.message);
            throw new Error(`ClickHouse connection failed: ${error.message}`);
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[ClickHouse] getTables called for ${connection.name}`);
        const client = this.createClient(connection);
        try {
            const resultSet = await client.query({
                query: `
                    SELECT name, 'table' as type 
                    FROM system.tables 
                    WHERE database = '${connection.database || 'default'}'
                `,
                format: 'JSONEachRow'
            });
            const rows = await resultSet.json<any>();
            return rows.map((row: any) => ({
                name: row.name,
                type: 'table',
                rowCount: null
            }));
        } catch (error: any) {
            throw new Error(`Failed to fetch tables: ${error.message}`);
        } finally {
            await client.close();
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[ClickHouse] getData called for ${connection.name}`);
        const client = this.createClient(connection);
        try {
            const offset = (page - 1) * limit;

            // Get total count
            const countResult = await client.query({
                query: `SELECT count() as total FROM "${tableName}"`,
                format: 'JSONEachRow'
            });
            const countRows = await countResult.json<any>();
            const totalRows = parseInt(countRows[0]?.total || '0', 10);

            // Get data
            const resultSet = await client.query({
                query: `SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}`,
                format: 'JSONEachRow'
            });
            const rows = await resultSet.json<any>();

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
        } finally {
            await client.close();
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        const client = this.createClient(connection);
        try {
            const resultSet = await client.query({
                query: `DESCRIBE "${tableName}"`,
                format: 'JSONEachRow'
            });
            const rows = await resultSet.json<any>();

            return rows.map((row: any) => ({
                name: row.name,
                type: row.type,
                nullable: false // ClickHouse nullable is explicit type wrapper usually
            }));
        } catch (error: any) {
            throw new Error(`Failed to fetch schema: ${error.message}`);
        } finally {
            await client.close();
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        // ... ClickHouse python snippet ...
        return '';
    }

    async executeQuery(connection: Connection, query: string): Promise<any[]> {
        const client = this.createClient(connection);
        try {
            const resultSet = await client.query({
                query: query,
                format: 'JSONEachRow'
            });
            return await resultSet.json<any>();
        } catch (error: any) {
            throw new Error(`Failed to execute query: ${error.message}`);
        } finally {
            await client.close();
        }
    }
}
