import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Dashboard, DashboardListItem } from '../types/dashboard';

const router = Router();

// Get reports/dashboards directory path relative to current working directory
function getDashboardsDir(): string {
    return path.join(process.cwd(), 'reports', 'dashboards');
}

// List all available dashboards
router.get('/dashboards', (_req: Request, res: Response) => {
    try {
        const dashboardsDir = getDashboardsDir();

        // Check if directory exists
        if (!fs.existsSync(dashboardsDir)) {
            return res.json([]);
        }

        // Read all JSON files in the directory
        const files = fs.readdirSync(dashboardsDir)
            .filter(file => file.endsWith('.json'));

        const dashboards: DashboardListItem[] = files.map(file => {
            const filePath = path.join(dashboardsDir, file);
            const content = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Dashboard;

            // Use filename without extension as ID
            const id = path.basename(file, '.json');

            return {
                id,
                title: content.metadata?.title || id,
                generatedAt: content.metadata?.generatedAt || '',
                chartCount: content.charts?.length || 0,
                kpiCount: content.kpis?.length || 0
            };
        });

        res.json(dashboards);
    } catch (error) {
        console.error('Error listing dashboards:', error);
        res.status(500).json({ error: 'Failed to list dashboards' });
    }
});

// Get a specific dashboard by ID
router.get('/dashboards/:id', (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const dashboardsDir = getDashboardsDir();
        const filePath = path.join(dashboardsDir, `${id}.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Dashboard not found' });
        }

        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(content);
    } catch (error) {
        console.error('Error reading dashboard:', error);
        res.status(500).json({ error: 'Failed to read dashboard' });
    }
});

// Refresh a chart's data (placeholder for now - would re-run query)
router.post('/charts/:id/refresh', (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // For now, just return a success message
        // In the future, this would:
        // 1. Find the chart in a dashboard
        // 2. Re-run its query against the data source
        // 3. Update the chart data
        // 4. Save the updated dashboard

        res.json({
            message: 'Refresh not yet implemented',
            chartId: id,
            lastRefreshed: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error refreshing chart:', error);
        res.status(500).json({ error: 'Failed to refresh chart' });
    }
});

export default router;
