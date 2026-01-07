import * as crypto from 'crypto';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

// Connection types supported
export type ConnectionType = 'mysql' | 'postgresql' | 'bigquery' | 'snowflake' | 'shopify' | 'csv';

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
