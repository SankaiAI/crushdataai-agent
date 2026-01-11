import * as fs from 'fs-extra';
import * as path from 'path';

const AI_TYPES = ['claude', 'cursor', 'windsurf', 'antigravity', 'copilot', 'kiro'] as const;
type AIType = typeof AI_TYPES[number];

const AI_PATHS: Record<AIType, { dir: string; sourceDir: string; files: string[] }> = {
    claude: {
        dir: '.claude/skills/data-analyst',
        sourceDir: '.claude/skills/data-analyst',
        files: ['SKILL.md']
    },
    cursor: {
        dir: '.cursor/commands',
        sourceDir: '.cursor/commands',
        files: ['data-analyst.md']
    },
    windsurf: {
        dir: '.windsurf/workflows',
        sourceDir: '.windsurf/workflows',
        files: ['data-analyst.md']
    },
    antigravity: {
        dir: '.agent/workflows',
        sourceDir: '.agent/workflows',
        files: ['data-analyst.md']
    },
    copilot: {
        dir: '.github/prompts',
        sourceDir: '.github/prompts',
        files: ['data-analyst.prompt.md']
    },
    kiro: {
        dir: '.kiro/steering',
        sourceDir: '.kiro/steering',
        files: ['data-analyst.md']
    }
};

const SHARED_DIR = '.shared/data-analyst';

function getAssetsDir(): string {
    // In npm package, assets are in the package directory
    return path.join(__dirname, '..', 'assets');
}

function copySharedFiles(targetDir: string, force: boolean): void {
    const sharedSource = path.join(getAssetsDir(), '.shared', 'data-analyst');
    const sharedTarget = path.join(targetDir, SHARED_DIR);

    if (fs.existsSync(sharedTarget)) {
        if (!force) {
            console.log(`  ⏭️  ${SHARED_DIR} already exists (use --force to overwrite)`);
            return;
        }
        // Clean reinstall: remove existing folder first
        fs.removeSync(sharedTarget);
    }

    fs.copySync(sharedSource, sharedTarget);
    console.log(`  ✅ Created ${SHARED_DIR}/`);
}

function copyAIFiles(aiType: AIType, targetDir: string, force: boolean): void {
    const config = AI_PATHS[aiType];
    const sourceDir = path.join(getAssetsDir(), config.sourceDir);
    const targetPath = path.join(targetDir, config.dir);

    // Clean reinstall: remove entire folder first when force=true
    if (fs.existsSync(targetPath) && force) {
        fs.removeSync(targetPath);
    }

    // Ensure directory exists
    fs.ensureDirSync(targetPath);

    for (const file of config.files) {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(targetPath, file);

        if (fs.existsSync(destPath) && !force) {
            console.log(`  ⏭️  ${config.dir}/${file} already exists`);
            continue;
        }

        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, destPath);
            console.log(`  ✅ Created ${config.dir}/${file}`);
        }
    }

    // For Claude, also copy shared scripts and data
    if (aiType === 'claude') {
        const scriptsLink = path.join(targetPath, 'scripts');
        const dataLink = path.join(targetPath, 'data');

        try {
            // Clean reinstall: remove existing folders first when force=true
            if (force) {
                if (fs.existsSync(scriptsLink)) fs.removeSync(scriptsLink);
                if (fs.existsSync(dataLink)) fs.removeSync(dataLink);
            }

            if (!fs.existsSync(scriptsLink)) {
                fs.copySync(path.join(targetDir, SHARED_DIR, 'scripts'), scriptsLink);
                console.log(`  ✅ Copied scripts to ${config.dir}/scripts/`);
            }
            if (!fs.existsSync(dataLink)) {
                fs.copySync(path.join(targetDir, SHARED_DIR, 'data'), dataLink);
                console.log(`  ✅ Copied data to ${config.dir}/data/`);
            }
        } catch (err) {
            console.log(`  ⚠️  Could not copy scripts/data. Use shared directory directly.`);
        }
    }
}

export function init(aiType: string, force: boolean): void {
    const targetDir = process.cwd();
    console.log(`\n🚀 Initializing CrushData AI in ${targetDir}\n`);

    // Copy shared files first
    copySharedFiles(targetDir, force);

    // Handle 'all' or specific AI type
    if (aiType === 'all') {
        for (const ai of AI_TYPES) {
            console.log(`\n📦 Setting up ${ai}...`);
            copyAIFiles(ai, targetDir, force);
        }
    } else if (AI_TYPES.includes(aiType as AIType)) {
        console.log(`\n📦 Setting up ${aiType}...`);
        copyAIFiles(aiType as AIType, targetDir, force);
    } else {
        console.error(`❌ Unknown AI type: ${aiType}`);
        console.error(`   Available: ${AI_TYPES.join(', ')}, all`);
        process.exit(1);
    }

    console.log(`\n✨ CrushData AI installed successfully!`);
    console.log(`\n📖 Usage:`);
    console.log(`   - Claude Code: Uses skill automatically for data analysis requests`);
    console.log(`   - Cursor/Windsurf/Antigravity: Use /data-analyst command`);
    console.log(`   - Search: python3 .shared/data-analyst/scripts/search.py "<query>" --domain <domain>\n`);
}

export function update(): void {
    console.log('\n🔄 To update CrushData AI:');
    console.log('   1. Run: npm install -g crushdataai@latest');
    console.log('   2. Run: crushdataai init --force (to update project files)\n');
}

export function versions(): void {
    console.log('\n📦 CrushData AI Versions');
    console.log('   Installed: 1.2.1');
    console.log('   Latest:    Check npm: npm show crushdataai version\n');
}
