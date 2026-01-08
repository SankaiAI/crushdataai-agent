import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

// Connection types supported
export type ConnectionType = 'mysql' | 'postgresql' | 'bigquery' | 'snowflake' | 'shopify' | 'csv' | 'custom' | 'sqlserver' | 'redshift' | 'databricks' | 'clickhouse' | 'mongodb';

export interface Connection {
    name: string;
    type: ConnectionType;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;  // Encrypted
    projectId?: string; // BigQuery
    keyFile?: string;   // BigQuery service account
    account?: string;   // Snowflake
    warehouse?: string; // Snowflake
    store?: string;     // Shopify
    apiKey?: string;    // Shopify - Encrypted
    apiSecret?: string; // Shopify - Encrypted
    filePath?: string;  // CSV
    connectionString?: string; // Custom - Encrypted
    createdAt: string;
    updatedAt: string;
}

export interface ConnectionsConfig {
    version: string;
    connections: Connection[];
}

// Get config directory
function getConfigDir(): string {
    return path.join(os.homedir(), '.crushdataai');
}

function getConfigPath(): string {
    return path.join(getConfigDir(), 'connections.json');
}

// Get machine-specific encryption key
function getEncryptionKey(): Buffer {
    const machineId = os.hostname() + os.userInfo().username;
    return crypto.scryptSync(machineId, 'crushdataai-salt', 32);
}

// Encrypt sensitive data
export function encrypt(text: string): string {
    if (!text) return '';
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

// Decrypt sensitive data
export function decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    try {
        const key = getEncryptionKey();
        const [ivHex, encrypted] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch {
        return '';
    }
}

// Load connections from config file
export function loadConnections(): ConnectionsConfig {
    const configPath = getConfigPath();

    if (!fs.existsSync(configPath)) {
        return { version: '2.0.0', connections: [] };
    }

    try {
        const data = fs.readJsonSync(configPath);
        return data as ConnectionsConfig;
    } catch {
        return { version: '2.0.0', connections: [] };
    }
}

// Save connections to config file
export function saveConnections(config: ConnectionsConfig): void {
    const configDir = getConfigDir();
    const configPath = getConfigPath();

    fs.ensureDirSync(configDir);
    fs.writeJsonSync(configPath, config, { spaces: 2 });

    // Set file permissions (user-only on Unix)
    if (process.platform !== 'win32') {
        fs.chmodSync(configPath, 0o600);
    }
}

// Get the current working directory (project root)
function getProjectDir(): string {
    return process.cwd();
}

// Create environment variable name from connection name
function toEnvVarName(connectionName: string, field: string): string {
    const sanitized = connectionName.toUpperCase().replace(/[^A-Z0-9]/g, '_');
    return `${sanitized}_${field.toUpperCase()}`;
}

// Write credentials to .env file in project directory
export function writeToEnvFile(connection: Connection): void {
    const projectDir = getProjectDir();
    const envPath = path.join(projectDir, '.env');
    const gitignorePath = path.join(projectDir, '.gitignore');

    // Read existing .env or create empty
    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Build env vars based on connection type
    const envVars: Record<string, string> = {};
    const prefix = connection.name;

    switch (connection.type) {
        case 'mysql':
        case 'postgresql':
        case 'sqlserver':
        case 'redshift':
        case 'clickhouse':
            if (connection.host) envVars[toEnvVarName(prefix, 'HOST')] = connection.host;
            if (connection.port) envVars[toEnvVarName(prefix, 'PORT')] = String(connection.port);
            if (connection.user) envVars[toEnvVarName(prefix, 'USER')] = connection.user;
            if (connection.password) envVars[toEnvVarName(prefix, 'PASSWORD')] = connection.password;
            if (connection.database) envVars[toEnvVarName(prefix, 'DATABASE')] = connection.database;
            break;
        case 'bigquery':
            if (connection.projectId) envVars[toEnvVarName(prefix, 'PROJECT_ID')] = connection.projectId;
            if (connection.keyFile) envVars[toEnvVarName(prefix, 'KEY_FILE')] = connection.keyFile;
            break;
        case 'snowflake':
            if (connection.account) envVars[toEnvVarName(prefix, 'ACCOUNT')] = connection.account;
            if (connection.user) envVars[toEnvVarName(prefix, 'USER')] = connection.user;
            if (connection.password) envVars[toEnvVarName(prefix, 'PASSWORD')] = connection.password;
            if (connection.warehouse) envVars[toEnvVarName(prefix, 'WAREHOUSE')] = connection.warehouse;
            if (connection.database) envVars[toEnvVarName(prefix, 'DATABASE')] = connection.database;
            break;
        case 'databricks':
            if (connection.host) envVars[toEnvVarName(prefix, 'HOST')] = connection.host;
            if (connection.connectionString) envVars[toEnvVarName(prefix, 'HTTP_PATH')] = connection.connectionString;
            if (connection.apiKey) envVars[toEnvVarName(prefix, 'TOKEN')] = connection.apiKey;
            break;
        case 'mongodb':
            if (connection.host) envVars[toEnvVarName(prefix, 'HOST')] = connection.host;
            if (connection.user) envVars[toEnvVarName(prefix, 'USER')] = connection.user;
            if (connection.password) envVars[toEnvVarName(prefix, 'PASSWORD')] = connection.password;
            if (connection.database) envVars[toEnvVarName(prefix, 'DATABASE')] = connection.database;
            if (connection.connectionString) envVars[toEnvVarName(prefix, 'CONNECTION_STRING')] = connection.connectionString;
            break;
        case 'shopify':
            if (connection.store) envVars[toEnvVarName(prefix, 'STORE')] = connection.store;
            if (connection.apiKey) envVars[toEnvVarName(prefix, 'API_KEY')] = connection.apiKey;
            if (connection.apiSecret) envVars[toEnvVarName(prefix, 'API_SECRET')] = connection.apiSecret;
            break;
        case 'csv':
            if (connection.filePath) envVars[toEnvVarName(prefix, 'FILE_PATH')] = connection.filePath;
            break;
        case 'custom':
            if (connection.connectionString) envVars[toEnvVarName(prefix, 'CONNECTION_STRING')] = connection.connectionString;
            break;
    }

    // Update or append each env var
    for (const [key, value] of Object.entries(envVars)) {
        const regex = new RegExp(`^${key}=.*$`, 'm');
        const newLine = `${key}="${value}"`;

        if (regex.test(envContent)) {
            envContent = envContent.replace(regex, newLine);
        } else {
            envContent = envContent.trimEnd() + (envContent ? '\n' : '') + newLine + '\n';
        }
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`✅ Credentials saved to .env file`);

    // Update .gitignore if needed
    let gitignoreContent = '';
    if (fs.existsSync(gitignorePath)) {
        gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    }

    if (!gitignoreContent.includes('.env')) {
        gitignoreContent = gitignoreContent.trimEnd() + (gitignoreContent ? '\n' : '') + '\n# Environment variables\n.env\n';
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf8');
        console.log(`✅ Added .env to .gitignore`);
    }
}

// Add or update a connection
export function saveConnection(connection: Connection): void {
    const config = loadConnections();

    // Encrypt sensitive fields
    const secureConnection = { ...connection };
    if (secureConnection.password) {
        secureConnection.password = encrypt(secureConnection.password);
    }
    if (secureConnection.apiKey) {
        secureConnection.apiKey = encrypt(secureConnection.apiKey);
    }
    if (secureConnection.apiSecret) {
        secureConnection.apiSecret = encrypt(secureConnection.apiSecret);
    }
    if (secureConnection.connectionString) {
        secureConnection.connectionString = encrypt(secureConnection.connectionString);
    }

    // Update or add
    const existingIndex = config.connections.findIndex(c => c.name === connection.name);
    if (existingIndex >= 0) {
        config.connections[existingIndex] = secureConnection;
    } else {
        config.connections.push(secureConnection);
    }

    saveConnections(config);
}

// Get a connection (with decrypted credentials)
export function getConnection(name: string): Connection | null {
    const config = loadConnections();
    const connection = config.connections.find(c => c.name === name);

    if (!connection) return null;

    // Decrypt sensitive fields
    const decrypted = { ...connection };
    if (decrypted.password) {
        decrypted.password = decrypt(decrypted.password);
    }
    if (decrypted.apiKey) {
        decrypted.apiKey = decrypt(decrypted.apiKey);
    }
    if (decrypted.apiSecret) {
        decrypted.apiSecret = decrypt(decrypted.apiSecret);
    }
    if (decrypted.connectionString) {
        decrypted.connectionString = decrypt(decrypted.connectionString);
    }

    return decrypted;
}

// Delete a connection
export function deleteConnection(name: string): boolean {
    const config = loadConnections();
    const initialLength = config.connections.length;
    config.connections = config.connections.filter(c => c.name !== name);

    if (config.connections.length < initialLength) {
        saveConnections(config);
        return true;
    }
    return false;
}

// List all connections (without sensitive data)
export function listConnections(): Array<{ name: string; type: ConnectionType; host?: string; createdAt: string }> {
    const config = loadConnections();
    return config.connections.map(c => ({
        name: c.name,
        type: c.type,
        host: c.host || c.store || c.account || c.filePath,
        createdAt: c.createdAt
    }));
}
