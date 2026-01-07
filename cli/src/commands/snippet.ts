import { getConnection } from '../connections';
import { ConnectorRegistry } from '../connectors';

export async function snippet(connectionName: string, lang: string = 'python'): Promise<void> {
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

        const code = connector.getSnippet(connection, lang);
        console.log(code);

    } catch (error: any) {
        console.error(`❌ Error generating snippet: ${error.message}`);
        process.exit(1);
    }
}
