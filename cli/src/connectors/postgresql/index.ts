import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';

export class PostgreSQLConnector implements Connector {
    type = 'postgresql';

    async test(connection: Connection): Promise<boolean> {
        if (!connection.host || !connection.user || !connection.database) {
            throw new Error('Host, user, and database are required');
        }
        return true;
    }

    async getTables(connection: Connection): Promise<Table[]> {
        return [];
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        return {
            columns: [],
            rows: [],
            pagination: { page, limit, totalRows: 0, totalPages: 0, startIdx: 0, endIdx: 0 }
        };
    }

    getSnippet(connection: Connection, lang: string): string {
        return `# PostgreSQL snippet generation not implemented yet`;
    }
}
