import express, { Request, Response } from 'express';
import * as path from 'path';
import {
    Connection,
    saveConnection,
    deleteConnection,
    listConnections,
    getConnection
} from '../connections';
import { ConnectorRegistry } from '../connectors';

const router = express.Router();

// List connections
router.get('/', (_req: Request, res: Response) => {
    try {
        const connections = listConnections();
        res.json({ success: true, connections });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to load connections' });
    }
});

// Get connection details
router.get('/:name', (req: Request, res: Response) => {
    try {
        const connection = getConnection(req.params.name);
        if (!connection) {
            res.status(404).json({ success: false, error: 'Connection not found' });
            return;
        }
        // Remove sensitive fields
        const safe = { ...connection, password: undefined, apiKey: undefined, apiSecret: undefined };
        res.json({ success: true, connection: safe });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to get connection' });
    }
});

// Save connection
router.post('/', (req: Request, res: Response) => {
    try {
        const connection: Connection = {
            ...req.body,
            createdAt: req.body.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!connection.name || !connection.type) {
            res.status(400).json({ success: false, error: 'Name and type are required' });
            return;
        }

        saveConnection(connection);
        res.json({ success: true, message: 'Connection saved' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to save connection' });
    }
});

// Delete connection
router.delete('/:name', (req: Request, res: Response) => {
    try {
        const deleted = deleteConnection(req.params.name);
        if (deleted) {
            res.json({ success: true, message: 'Connection deleted' });
        } else {
            res.status(404).json({ success: false, error: 'Connection not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete connection' });
    }
});

// Test connection
router.post('/test', async (req: Request, res: Response) => {
    try {
        const connection = req.body as Connection;
        // Use registry to test
        try {
            const connector = ConnectorRegistry.get(connection.type);
            await connector.test(connection);
            res.json({ success: true, message: 'Connection valid' });
        } catch (err: any) {
            res.json({ success: false, error: err.message || 'Unknown connector type' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Connection test failed: ' + error.message });
    }
});

// Get tables
router.get('/:name/tables', async (req: Request, res: Response) => {
    try {
        const connection = getConnection(req.params.name);
        if (!connection) {
            res.status(404).json({ success: false, error: 'Connection not found' });
            return;
        }

        const connector = ConnectorRegistry.get(connection.type);
        const tables = await connector.getTables(connection);

        res.json({ success: true, tables });

    } catch (error: any) {
        res.status(500).json({ success: false, error: 'Failed to get tables: ' + error.message });
    }
});

// Get table data
router.get('/:name/tables/:table/data', async (req: Request, res: Response) => {
    try {
        const connection = getConnection(req.params.name);
        if (!connection) {
            res.status(404).json({ success: false, error: 'Connection not found' });
            return;
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 25;
        const tableName = req.params.table;

        const connector = ConnectorRegistry.get(connection.type);
        const result = await connector.getData(connection, tableName, page, limit);

        res.json({ success: true, ...result });

    } catch (error: any) {
        console.error('Error in getData:', error);
        res.status(500).json({ success: false, error: 'Failed to get table data: ' + error.message });
    }
});

export default router;
