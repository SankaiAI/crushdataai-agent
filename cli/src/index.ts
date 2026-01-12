#!/usr/bin/env node
import { Command } from 'commander';
import { init, update, versions } from './commands';
import { startServer } from './server';
import { startDashboardServer } from './dashboard-server';
import { listConnections, deleteConnection } from './connections';

const program = new Command();

program
    .name('crushdataai')
    .description('CLI to install CrushData AI data analyst skill for AI coding assistants')
    .version('1.2.14');

program
    .command('init')
    .description('Initialize CrushData AI skill in current project')
    .option('--ai <type>', 'AI assistant type (claude, cursor, windsurf, antigravity, copilot, kiro, all)', 'all')
    .option('--force', 'Overwrite existing files', false)
    .action((options) => {
        init(options.ai, options.force);
    });

program
    .command('update')
    .description('Update CrushData AI skill to latest version')
    .action(() => {
        update();
    });

program
    .command('versions')
    .description('Show installed and latest versions')
    .action(() => {
        versions();
    });

program
    .command('connect')
    .description('Open connection manager UI to add/manage data sources')
    .option('-p, --port <port>', 'Server port', '4321')
    .action(async (options) => {
        const port = parseInt(options.port);
        console.log('\n🔌 Starting CrushData AI Connection Manager...\n');

        try {
            await startServer(port);

            // Open browser
            const open = (await import('open')).default;
            await open(`http://localhost:${port}`);
        } catch (error: any) {
            console.error(`❌ Error: ${error.message}`);
            process.exit(1);
        }
    });

program
    .command('connections')
    .description('List saved data source connections')
    .action(() => {
        const connections = listConnections();

        if (connections.length === 0) {
            console.log('\n📁 No saved connections.');
            console.log('   Run `crushdataai connect` to add one.\n');
            return;
        }

        console.log('\n📁 Saved Connections:\n');
        connections.forEach(conn => {
            console.log(`   ${conn.name}`);
            console.log(`   └─ Type: ${conn.type} | Host: ${conn.host || 'local'}`);
            console.log(`   └─ Created: ${conn.createdAt}\n`);
        });
    });

program
    .command('connections:delete <name>')
    .description('Delete a saved connection')
    .action((name) => {
        const deleted = deleteConnection(name);
        if (deleted) {
            console.log(`\n✓ Connection "${name}" deleted.\n`);
        } else {
            console.log(`\n✗ Connection "${name}" not found.\n`);
        }
    });

program
    .command('snippet <name>')
    .description('Get connection code snippet for AI to use')
    .option('-l, --lang <lang>', 'Target language (currently python)', 'python')
    .action(async (name, options) => {
        const { snippet } = await import('./commands/snippet');
        await snippet(name, options.lang);
    });

program
    .command('schema <connection> [table]')
    .description('Show table schema (columns) for a connection')
    .action(async (connection, table) => {
        const { schema } = await import('./commands/schema');
        await schema(connection, table);
    });

program
    .command('dashboard')
    .description('Open the dashboard visualization UI')
    .option('-p, --port <port>', 'Server port', '3002')
    .action(async (options) => {
        const port = parseInt(options.port);
        console.log('\n📊 Starting CrushData AI Dashboard...\n');

        try {
            await startDashboardServer(port);
        } catch (error: any) {
            console.error(`❌ Error: ${error.message}`);
            process.exit(1);
        }
    });

program.parse();
