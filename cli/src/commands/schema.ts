import { getConnection } from '../connections';
import { ConnectorRegistry } from '../connectors';

export async function schema(connectionName: string, tableName?: string): Promise<void> {
    const connection = getConnection(connectionName);

    if (!connection) {
        console.error(`❌ Connection '${connectionName}' not found.`);
        console.error(`   Run 'crushdataai connections' to see available connections.`);
        process.exit(1);
    }

    try {
        const connector = ConnectorRegistry.get(connection.type);
        if (!connector) {
            console.error(`❌ No connector found for type: ${connection.type}`);
            process.exit(1);
        }

        // If no table specified, list all tables
        if (!tableName) {
            console.log(`\n📊 Tables in '${connectionName}':\n`);
            const tables = await connector.getTables(connection);

            if (tables.length === 0) {
                console.log('   No tables found.');
            } else {
                tables.forEach(table => {
                    const rowInfo = table.rowCount != null ? ` (~${table.rowCount.toLocaleString()} rows)` : '';
                    console.log(`   └─ ${table.name}${rowInfo}`);
                });
            }
            console.log(`\n   Run 'crushdataai schema ${connectionName} <table>' for column details.\n`);
            return;
        }

        // Get schema for specific table
        console.log(`\n📊 Schema for '${tableName}' in '${connectionName}':\n`);
        const columns = await connector.getSchema(connection, tableName);

        if (columns.length === 0) {
            console.log('   No columns found.');
        } else {
            columns.forEach((col, idx) => {
                const prefix = idx === columns.length - 1 ? '└─' : '├─';
                const nullInfo = col.nullable ? 'NULL' : 'NOT NULL';
                console.log(`   ${prefix} ${col.name} (${col.type}, ${nullInfo})`);
            });
        }
        console.log('');

    } catch (error: any) {
        console.error(`❌ Error fetching schema: ${error.message}`);
        process.exit(1);
    }
}
