import express, { Request, Response } from 'express';
import * as path from 'path';
import { ConnectorRegistry } from './connectors';
import { CSVConnector } from './connectors/csv';
import { MySQLConnector } from './connectors/mysql';
import { PostgreSQLConnector } from './connectors/postgresql';
import { ShopifyConnector } from './connectors/shopify';
import { BigQueryConnector, SnowflakeConnector } from './connectors/cloud';
import { CustomConnector } from './connectors/custom';
import { SQLServerConnector, RedshiftConnector, DatabricksConnector, ClickHouseConnector, MongoDBConnector } from './connectors/additional';
import ConnectionsRouter from './routes/connections';

const app = express();
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Initialize Connectors
ConnectorRegistry.register(new CSVConnector());
ConnectorRegistry.register(new MySQLConnector());
ConnectorRegistry.register(new PostgreSQLConnector());
ConnectorRegistry.register(new ShopifyConnector());
ConnectorRegistry.register(new BigQueryConnector());
ConnectorRegistry.register(new SnowflakeConnector());
ConnectorRegistry.register(new CustomConnector());
ConnectorRegistry.register(new SQLServerConnector());
ConnectorRegistry.register(new RedshiftConnector());
ConnectorRegistry.register(new DatabricksConnector());
ConnectorRegistry.register(new ClickHouseConnector());
ConnectorRegistry.register(new MongoDBConnector());

// Serve static files from ui directory
const uiPath = path.join(__dirname, '..', 'ui');
app.use(express.static(uiPath));

// API Routes
app.use('/api/connections', ConnectionsRouter);

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', version: '1.2.6' });
});

// Serve index.html for root
app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(uiPath, 'index.html'));
});

export function startServer(port: number = 4321): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const server = app.listen(port, () => {
                console.log(`\n🚀 CrushData AI Connection Manager`);
                console.log(`   Server running at: http://localhost:${port}`);
                console.log(`   Press Ctrl+C to stop\n`);
                resolve();
            });

            server.on('error', (err: NodeJS.ErrnoException) => {
                if (err.code === 'EADDRINUSE') {
                    reject(new Error(`Port ${port} is already in use`));
                } else {
                    reject(err);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}
