import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';
import { MongoClient } from 'mongodb';

export class MongoDBConnector implements Connector {
    type = 'mongodb';

    private getUrl(connection: Connection): string {
        if (connection.connectionString) return connection.connectionString;

        const host = connection.host || 'localhost';
        const port = connection.port || 27017;
        const auth = connection.user && connection.password
            ? `${encodeURIComponent(connection.user)}:${encodeURIComponent(connection.password)}@`
            : '';

        return `mongodb://${auth}${host}:${port}`;
    }

    async test(connection: Connection): Promise<boolean> {
        console.log(`[MongoDB] Testing connection for ${connection.name}`);
        const client = new MongoClient(this.getUrl(connection));
        try {
            await client.connect();
            await client.db(connection.database).command({ ping: 1 });
            console.log(`[MongoDB] Connection test successful`);
            return true;
        } catch (error: any) {
            throw new Error(`MongoDB connection failed: ${error.message}`);
        } finally {
            await client.close();
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[MongoDB] getTables called for ${connection.name}`);
        const client = new MongoClient(this.getUrl(connection));
        try {
            await client.connect();
            const collections = await client.db(connection.database).listCollections().toArray();
            return collections.map(col => ({
                name: col.name,
                type: 'collection',
                rowCount: null
            }));
        } catch (error: any) {
            throw new Error(`Failed to fetch collections: ${error.message}`);
        } finally {
            await client.close();
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        console.log(`[MongoDB] getData called for ${connection.name}`);
        const client = new MongoClient(this.getUrl(connection));
        try {
            await client.connect();
            const db = client.db(connection.database);
            const collection = db.collection(tableName);

            const offset = (page - 1) * limit;
            const totalRows = await collection.countDocuments();

            // Fetch raw documents
            const docs = await collection.find({})
                .skip(offset)
                .limit(limit)
                .toArray();

            // Flatten logic? Or just send raw objects?
            // Dashboard UI expects primitive values usually. 
            // We'll flatten top-level fields for simplicity.
            const rows = docs.map((doc: any) => {
                const flat: any = {};
                for (const [key, val] of Object.entries(doc)) {
                    if (typeof val === 'object' && val !== null && !(val instanceof Date) && key !== '_id') {
                        flat[key] = JSON.stringify(val);
                    } else {
                        flat[key] = val;
                    }
                    if (key === '_id') flat[key] = String(val); // ObjectId to string
                }
                return flat;
            });

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
        // MongoDB is schemaless. We inspect first doc.
        const client = new MongoClient(this.getUrl(connection));
        try {
            await client.connect();
            const doc = await client.db(connection.database).collection(tableName).findOne();
            if (!doc) return [];

            return Object.keys(doc).map(key => ({
                name: key,
                type: typeof doc[key],
                nullable: true
            }));
        } catch (error: any) {
            return [];
        } finally {
            await client.close();
        }
    }

    getSnippet(connection: Connection, lang: string): string {
        return '';
    }

    async executeQuery(connection: Connection, query: string): Promise<any[]> {
        // Attempt to interpret 'query' as a JSON find filter
        // If string is empty, find({})
        const client = new MongoClient(this.getUrl(connection));
        try {
            let filter = {};
            try {
                if (query.trim()) filter = JSON.parse(query);
            } catch {
                console.warn("[MongoDB] Query is not valid JSON, using empty filter");
            }

            // We need to know WHICH collection to query. 
            // The `executeQuery` signature strictly takes `query: string`. 
            // It loses context of "tableName" (unlike getData).
            // This is a flaw in the Connector interface for NoSQL if we treat it as SQL.
            // WORKAROUND: For now, we return empty or throw, or rely on getData only.
            // The Refresh logic calls `executeQuery` for SQL types, and `getData` for Shopify.
            // For MongoDB, we should treat it like Shopify (API/NoSQL)!

            // So in QueryExecutor, we will user `getData` logic for MongoDB, NOT `executeQuery`.
            // So this method implementation implies we expect SQL. 
            throw new Error("Direct query execution not fully supported for MongoDB yet. Use standard view.");
        } finally {
            await client.close();
        }
    }
}
