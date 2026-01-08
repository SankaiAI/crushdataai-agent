import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';

export class ShopifyConnector implements Connector {
    type = 'shopify';

    async test(connection: Connection): Promise<boolean> {
        console.log(`[Shopify] Testing connection for ${connection.name} (Store: ${connection.store})`);
        if (!connection.store || !connection.apiKey) {
            throw new Error('Store URL and Admin API Access Token are required');
        }

        // Basic validation for Store URL
        if (connection.store.includes('_') && !connection.store.includes('.')) {
            throw new Error(`Invalid Store URL: "${connection.store}". It looks like you might have pasted an API key/secret here. The Store URL should be something like "your-shop.myshopify.com".`);
        }

        const storeUrl = connection.store.replace(/\/$/, '');
        const url = `${storeUrl.startsWith('http') ? '' : 'https://'}${storeUrl}/admin/api/2024-04/shop.json`;

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Shopify-Access-Token': connection.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData: any = await response.json();
                console.error(`[Shopify] Test failed:`, errorData);
                throw new Error(errorData.errors || `Shopify API error: ${response.statusText}`);
            }

            console.log(`[Shopify] Connection test successful for ${connection.name}`);
            return true;
        } catch (error: any) {
            console.error(`[Shopify] Connection test error:`, error.message);
            throw new Error(`Connection failed: ${error.message}`);
        }
    }

    async getTables(connection: Connection): Promise<Table[]> {
        console.log(`[Shopify] getTables called for ${connection.name}`);
        const tables = ['orders', 'products', 'customers'];
        const result: Table[] = [];

        for (const table of tables) {
            try {
                const count = await this.fetchTotalCount(connection, table);
                result.push({ name: table, type: 'shopify', rowCount: count });
            } catch (e) {
                console.warn(`[Shopify] Could not fetch count for ${table}:`, e);
                result.push({ name: table, type: 'shopify' });
            }
        }
        return result;
    }

    private async fetchTotalCount(connection: Connection, tableName: string): Promise<number | null> {
        if (!connection.store || !connection.apiKey) return null;
        const storeUrl = connection.store.replace(/\/$/, '');
        const url = `${storeUrl.startsWith('http') ? '' : 'https://'}${storeUrl}/admin/api/2024-04/${tableName}/count.json`;

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Shopify-Access-Token': connection.apiKey,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) return null;
            const data: any = await response.json();
            return data.count;
        } catch {
            return null;
        }
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        if (!connection.store || !connection.apiKey) {
            throw new Error('Store URL and Admin API Access Token are required');
        }

        const storeUrl = connection.store.replace(/\/$/, '');
        let url = `${storeUrl.startsWith('http') ? '' : 'https://'}${storeUrl}/admin/api/2024-04/${tableName}.json?limit=${limit}`;

        // Add status=any for orders to fetch more than just 'open' orders
        if (tableName === 'orders') {
            url += '&status=any';
        }

        console.log(`[Shopify] Fetching ${tableName} from: ${url}`);

        try {
            const response = await fetch(url, {
                headers: {
                    'X-Shopify-Access-Token': connection.apiKey,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData: any = await response.json();
                console.error(`[Shopify] Error response:`, errorData);
                throw new Error(errorData.errors || `Shopify API error: ${response.statusText}`);
            }

            const data: any = await response.json();
            const rawRows = data[tableName] || [];
            console.log(`[Shopify] Successfully fetched ${rawRows.length} rows for ${tableName}`);

            // Transform Shopify nested JSON into flat rows for the UI
            const rows = rawRows.map((item: any) => {
                const flat: any = {};
                for (const key in item) {
                    if (typeof item[key] === 'object' && item[key] !== null) {
                        flat[key] = JSON.stringify(item[key]);
                    } else {
                        flat[key] = item[key];
                    }
                }
                return flat;
            });

            const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
            const totalRows = (await this.fetchTotalCount(connection, tableName)) || rows.length;
            const totalPages = Math.ceil(totalRows / limit) || 1;

            return {
                columns,
                rows,
                pagination: {
                    page,
                    limit,
                    totalRows,
                    totalPages,
                    startIdx: (page - 1) * limit + 1,
                    endIdx: (page - 1) * limit + rows.length
                }
            };
        } catch (error: any) {
            console.error(`[Shopify] Fetch error:`, error.message);
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        // Shopify schemas are predefined - return common fields for each table type
        const schemas: Record<string, import('../index').ColumnInfo[]> = {
            orders: [
                { name: 'id', type: 'integer', nullable: false },
                { name: 'email', type: 'string', nullable: true },
                { name: 'created_at', type: 'datetime', nullable: false },
                { name: 'total_price', type: 'decimal', nullable: false },
                { name: 'currency', type: 'string', nullable: false },
                { name: 'financial_status', type: 'string', nullable: true },
                { name: 'fulfillment_status', type: 'string', nullable: true },
                { name: 'customer', type: 'json', nullable: true },
                { name: 'line_items', type: 'json', nullable: false }
            ],
            products: [
                { name: 'id', type: 'integer', nullable: false },
                { name: 'title', type: 'string', nullable: false },
                { name: 'body_html', type: 'string', nullable: true },
                { name: 'vendor', type: 'string', nullable: true },
                { name: 'product_type', type: 'string', nullable: true },
                { name: 'created_at', type: 'datetime', nullable: false },
                { name: 'handle', type: 'string', nullable: false },
                { name: 'status', type: 'string', nullable: false },
                { name: 'variants', type: 'json', nullable: false }
            ],
            customers: [
                { name: 'id', type: 'integer', nullable: false },
                { name: 'email', type: 'string', nullable: true },
                { name: 'first_name', type: 'string', nullable: true },
                { name: 'last_name', type: 'string', nullable: true },
                { name: 'created_at', type: 'datetime', nullable: false },
                { name: 'orders_count', type: 'integer', nullable: false },
                { name: 'total_spent', type: 'decimal', nullable: false },
                { name: 'addresses', type: 'json', nullable: true }
            ]
        };

        return schemas[tableName] || [];
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
import requests
import pandas as pd

# Connection: ${connection.name}
# Type: shopify
# Credentials loaded from environment variables (set in .env file)
shop_url = os.environ["${prefix}_STORE"]
access_token = os.environ["${prefix}_API_KEY"]
api_version = "2024-04"

def fetch_shopify_data(endpoint):
    url = f"{'https://' if not shop_url.startswith('http') else ''}{shop_url}/admin/api/{api_version}/{endpoint}.json"
    headers = {
        "X-Shopify-Access-Token": access_token,
        "Content-Type": "application/json"
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    return response.json()

try:
    # Example: Fetching orders
    data = fetch_shopify_data("orders")
    df = pd.DataFrame(data["orders"])
    print(f"Successfully loaded {len(df)} orders from ${connection.name}")
    print(df.head())
except Exception as e:
    print(f"Error loading Shopify data: {e}")
`;
        }

        return `# Language ${lang} not supported for Shopify connector yet.`;
    }
}

