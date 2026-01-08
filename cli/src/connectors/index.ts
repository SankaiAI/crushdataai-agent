import { Connection } from '../connections';

export interface Table {
    name: string;
    type?: string;
    rowCount?: number | null;
}

export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
}

export interface TableData {
    columns: string[];
    rows: any[];
    pagination: {
        page: number;
        limit: number;
        totalRows: number;
        totalPages: number;
        startIdx: number;
        endIdx: number;
    };
}

export interface Connector {
    type: string;
    test(connection: Connection): Promise<boolean>;
    getTables(connection: Connection): Promise<Table[]>;
    getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData>;
    getSchema(connection: Connection, tableName: string): Promise<ColumnInfo[]>;
    getSnippet(connection: Connection, lang: string): string;
}

export class ConnectorRegistry {
    private static connectors: Map<string, Connector> = new Map();

    static register(connector: Connector) {
        this.connectors.set(connector.type, connector);
    }

    static get(type: string): Connector {
        const connector = this.connectors.get(type);
        if (!connector) {
            throw new Error(`No connector found for type: ${type}`);
        }
        return connector;
    }
}
