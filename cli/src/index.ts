#!/usr/bin/env node
import { Command } from 'commander';
import { init, update, versions } from './commands';

const program = new Command();

program
    .name('crushdataai')
    .description('CLI to install CrushData AI data analyst skill for AI coding assistants')
    .version('1.0.0');

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

program.parse();
