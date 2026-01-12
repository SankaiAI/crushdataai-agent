import express from 'express';
import * as path from 'path';
import open from 'open';
import dashboardRoutes from './routes/dashboard';

export async function startDashboardServer(port: number): Promise<void> {
    const app = express();

    // Serve static files from the built dashboard UI
    const uiPath = path.join(__dirname, '..', 'ui-dashboard-dist');
    app.use(express.static(uiPath));

    // API routes
    app.use('/api', dashboardRoutes);

    // SPA fallback - serve index.html for client-side routing
    app.get('*', (_req, res) => {
        res.sendFile(path.join(uiPath, 'index.html'));
    });

    return new Promise((resolve, reject) => {
        const server = app.listen(port, async () => {
            console.log(`\n📊 Dashboard UI running at http://localhost:${port}\n`);
            console.log('   Looking for dashboards in: reports/dashboards/');
            console.log('   Press Ctrl+C to stop\n');

            // Open browser
            try {
                await open(`http://localhost:${port}`);
            } catch (err) {
                // Ignore open errors
            }

            resolve();
        });

        server.on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
                reject(new Error(`Port ${port} is already in use. Try a different port with --port`));
            } else {
                reject(err);
            }
        });
    });
}
