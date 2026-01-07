import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';

export class BigQueryConnector implements Connector {
    type = 'bigquery';

    async test(connection: Connection): Promise<boolean> {
        return true;
    }

    async getTables(connection: Connection): Promise<Table[]> {
        return [];
    }

    async getData(connection: Connection, table: string, page: number, limit: number): Promise<TableData> {
        return { columns: [], rows: [], pagination: { page, limit, totalRows: 0, totalPages: 0, startIdx: 0, endIdx: 0 } };
    }

    getSnippet(connection: Connection, lang: string): string {
        return `# BigQuery snippet generation not implemented yet`;
    }
}

export class SnowflakeConnector implements Connector {
    type = 'snowflake';

    async test(connection: Connection): Promise<boolean> {
        return true;
    }

    async getTables(connection: Connection): Promise<Table[]> {
        return [];
    }

    async getData(connection: Connection, table: string, page: number, limit: number): Promise<TableData> {
        return { columns: [], rows: [], pagination: { page, limit, totalRows: 0, totalPages: 0, startIdx: 0, endIdx: 0 } };
    }

    getSnippet(connection: Connection, lang: string): string {
        return `# Snowflake snippet generation not implemented yet`;
    }
}
