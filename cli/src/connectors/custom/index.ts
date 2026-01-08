import { Connector, Table, TableData, ColumnInfo } from '../index';
import { Connection } from '../../connections';

export class CustomConnector implements Connector {
    type = 'custom';

    async test(connection: Connection): Promise<boolean> {
        console.log(`[Custom] Testing connection for ${connection.name}`);

        if (!connection.connectionString?.trim()) {
            throw new Error('Connection string is required');
        }

        // For custom connections, we just validate the string exists
        // We cannot actually test without knowing the database type
        console.log(`[Custom] Connection string provided (${connection.connectionString.length} chars)`);
        console.log(`[Custom] Note: Custom connections cannot be fully tested - only validating string is present`);

        return true;
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[Custom] getTables called for ${connection.name}`);
        // Custom connections don't support table listing through our UI
        // Return empty - user will use their own queries
        return [];
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[Custom] getData called for ${connection.name}`);
        // Custom connections don't support data fetching through our UI
        throw new Error('Custom connections do not support data preview. Use the snippet to query directly.');
    }

    async getSchema(connection: Connection, tableName: string): Promise<ColumnInfo[]> {
        console.log(`[Custom] getSchema called for ${connection.name}`);
        // Custom connections don't support schema discovery
        return [];
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
from sqlalchemy import create_engine
import pandas as pd

# Connection: ${connection.name}
# Type: custom
# Connection string loaded from environment variable (set in .env file)
connection_string = os.environ["${prefix}_CONNECTION_STRING"]
engine = create_engine(connection_string)

try:
    # Example: Query a table
    query = "SELECT * FROM your_table LIMIT 100"
    df = pd.read_sql(query, engine)
    print(f"Successfully loaded {len(df)} rows from ${connection.name}")
    print(df.head())
finally:
    engine.dispose()
`;
        }

        return `# Language ${lang} not supported for Custom connector yet.`;
    }
}
