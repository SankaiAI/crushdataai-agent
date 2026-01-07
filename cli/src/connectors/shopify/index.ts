import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';

export class ShopifyConnector implements Connector {
    type = 'shopify';

    async test(connection: Connection): Promise<boolean> {
        if (!connection.store || !connection.apiKey) {
            throw new Error('Store URL and API Key are required');
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
        return `# Shopify snippet generation not implemented yet`;
    }
}
