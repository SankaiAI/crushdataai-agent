import { Router, Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { Dashboard, DashboardListItem, Chart } from '../types/dashboard';
import { QueryExecutor } from '../services/query-executor';

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
        res.json({ id, ...content });
    } catch (error) {
        console.error('Error reading dashboard:', error);
        res.status(500).json({ error: 'Failed to read dashboard' });
    }
});

// Refresh entire dashboard (runs script if one is found)
router.post('/dashboards/:id/refresh', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const dashboardsDir = getDashboardsDir();
        const filePath = path.join(dashboardsDir, `${id}.json`);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Dashboard not found' });
        }

        const dashboard = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Dashboard;

        // Find the first script in any chart
        const scriptChart = dashboard.charts.find(c => c.query?.script);

        if (scriptChart?.query?.script) {
            console.log(`Refreshing dashboard ${id} by running script ${scriptChart.query.script}...`);

            const { exec } = await import('child_process');
            const scriptPath = path.resolve(process.cwd(), scriptChart.query.script);
            const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

            return new Promise<void>((resolve) => {
                exec(`${pythonCmd} "${scriptPath}"`, {
                    cwd: process.cwd(),
                    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
                }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Script execution failed:', stderr);
                        res.status(500).json({ error: `Script failed: ${stderr || error.message}` });
                        return resolve();
                    }

                    console.log('Script output:', stdout);

                    // Re-read the updated dashboard
                    const updatedDashboard = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                    res.json({ id, ...updatedDashboard, lastRefreshed: new Date().toISOString() });
                    resolve();
                });
            });
        } else {
            // No script found, just return current data
            res.json({ id, ...dashboard, message: 'No refresh script configured' });
        }
    } catch (error) {
        console.error('Error refreshing dashboard:', error);
        res.status(500).json({ error: 'Failed to refresh dashboard' });
    }
});

// Refresh a chart's data (placeholder for now - would re-run query)
router.post('/charts/:id/refresh', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const dashboardsDir = getDashboardsDir();

        // 1. Find the chart in any dashboard
        // We have to search all dashboards because we don't know which one calls it
        // In a real DB we'd have a chart table, but here we scan JSONs
        const files = fs.readdirSync(dashboardsDir).filter(file => file.endsWith('.json'));

        let targetDashboard: Dashboard | null = null;
        let targetDashboardFile: string = '';
        let targetChart: Chart | null = null;

        for (const file of files) {
            const filePath = path.join(dashboardsDir, file);
            const dashboard = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Dashboard;
            const chart = dashboard.charts.find(c => c.id === id);

            if (chart) {
                targetDashboard = dashboard;
                targetDashboardFile = filePath;
                targetChart = chart;
                break;
            }
        }

        if (!targetDashboard || !targetChart || !targetDashboardFile) {
            return res.status(404).json({ error: 'Chart not found' });
        }

        // 2. Execute Query or Script
        if (!targetChart.query) {
            return res.status(400).json({ error: 'Chart has no query configuration' });
        }

        // Check if this is a script-based refresh
        if (targetChart.query.script) {
            console.log(`Refreshing chart ${id} by running script ${targetChart.query.script}...`);

            const { exec } = await import('child_process');
            const scriptPath = path.resolve(process.cwd(), targetChart.query.script);

            // Determine python command (try python3 first, fallback to python)
            const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

            return new Promise<void>((resolve) => {
                exec(`${pythonCmd} "${scriptPath}"`, {
                    cwd: process.cwd(),
                    env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
                }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Script execution failed:', stderr);
                        res.status(500).json({ error: `Script failed: ${stderr || error.message}` });
                        return resolve();
                    }

                    console.log('Script output:', stdout);

                    // Re-read the updated dashboard file (script should have updated it)
                    const updatedDashboard = JSON.parse(fs.readFileSync(targetDashboardFile, 'utf-8')) as Dashboard;
                    const updatedChart = updatedDashboard.charts.find(c => c.id === id);

                    if (updatedChart) {
                        updatedChart.lastRefreshed = new Date().toISOString();
                        fs.writeFileSync(targetDashboardFile, JSON.stringify(updatedDashboard, null, 2));
                        res.json(updatedChart);
                    } else {
                        res.status(404).json({ error: 'Chart not found after script execution' });
                    }
                    resolve();
                });
            });
        }

        // Standard database query refresh
        if (!targetChart.query.connection) {
            return res.status(400).json({ error: 'Chart has no connection configuration' });
        }

        console.log(`Refreshing chart ${id} using connection ${targetChart.query.connection}...`);
        const newData = await QueryExecutor.execute(targetChart.query);

        // 3. Update Dashboard
        targetChart.data = newData;
        targetChart.lastRefreshed = new Date().toISOString();

        // Save back to disk
        fs.writeFileSync(targetDashboardFile, JSON.stringify(targetDashboard, null, 2));

        // 4. Return new data
        res.json(targetChart);

    } catch (error) {
        console.error('Error refreshing chart:', error);
        res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to refresh chart' });
    }
});

// SSE Endpoint for file watching
router.get('/events', (req: Request, res: Response) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const dashboardsDir = getDashboardsDir();
    if (!fs.existsSync(dashboardsDir)) {
        return res.end();
    }

    console.log('Client connected to SSE stream');

    // Watch for file changes
    const watcher = fs.watch(dashboardsDir, (eventType, filename) => {
        if (filename && filename.endsWith('.json')) {
            console.log(`File changed: ${filename} (${eventType})`);
            const dashboardId = path.basename(filename, '.json');

            // Send event
            res.write(`data: ${JSON.stringify({ type: 'dashboard-update', id: dashboardId })}\n\n`);
        }
    });

    // Cleanup on close
    req.on('close', () => {
        watcher.close();
        console.log('Client disconnected from SSE stream');
        res.end();
    });
});

export default router;
