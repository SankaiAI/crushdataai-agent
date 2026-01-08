import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';
import { Connector, Table, TableData } from '../index';
import { Connection } from '../../connections';

export class CSVConnector implements Connector {
    type = 'csv';

    async test(connection: Connection): Promise<boolean> {
        if (!connection.filePath) {
            throw new Error('File path is required');
        }

        // Remove surrounding quotes if present
        let filePath = connection.filePath;
        if (filePath.startsWith('"') && filePath.endsWith('"')) {
            filePath = filePath.slice(1, -1);
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }
        return true;
    }

    async getTables(connection: Connection): Promise<Table[]> {
        if (!connection.filePath) {
            return [];
        }

        let filePath = connection.filePath;
        if (filePath.startsWith('"') && filePath.endsWith('"')) {
            filePath = filePath.slice(1, -1);
        }

        const fileName = path.basename(filePath, '.csv');
        // Basic check if file exists, if not it might have been deleted
        if (fs.existsSync(filePath)) {
            return [{ name: fileName, type: 'csv', rowCount: null }];
        }
        return [];
    }

    async getData(connection: Connection, tableName: string, page: number, limit: number): Promise<TableData> {
        let filePath = connection.filePath;
        if (filePath && filePath.startsWith('"') && filePath.endsWith('"')) {
            filePath = filePath.slice(1, -1);
        }

        if (!filePath || !fs.existsSync(filePath)) {
            throw new Error('CSV file not found');
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const result = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true
        });

        const data = result.data as Record<string, unknown>[];
        const columns = result.meta.fields || [];
        const totalRows = data.length;
        const totalPages = Math.ceil(totalRows / limit);
        const startIdx = (page - 1) * limit;
        const endIdx = Math.min(startIdx + limit, totalRows);
        const rows = data.slice(startIdx, endIdx);

        return {
            columns,
            rows,
            pagination: {
                page,
                limit,
                totalRows,
                totalPages,
                startIdx: startIdx + 1,
                endIdx
            }
        };
    }

    async getSchema(connection: Connection, tableName: string): Promise<import('../index').ColumnInfo[]> {
        let filePath = connection.filePath;
        if (filePath && filePath.startsWith('"') && filePath.endsWith('"')) {
            filePath = filePath.slice(1, -1);
        }

        if (!filePath || !fs.existsSync(filePath)) {
            throw new Error('CSV file not found');
        }

        // Read first row to get headers and infer types from first data row
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const result = Papa.parse(fileContent, {
            header: true,
            skipEmptyLines: true,
            preview: 2 // Only parse header + 1 data row for type inference
        });

        const columns = result.meta.fields || [];
        const firstRow = (result.data as Record<string, unknown>[])[0] || {};

        return columns.map(col => ({
            name: col,
            type: typeof firstRow[col] === 'number' ? 'number' : 'string',
            nullable: true
        }));
    }

    getSnippet(connection: Connection, lang: string): string {
        const prefix = connection.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');

        if (lang === 'python') {
            return `import os
import pandas as pd

# Connection: ${connection.name}
# Type: csv
# File path loaded from environment variable (set in .env file)
file_path = os.environ["${prefix}_FILE_PATH"]

try:
    df = pd.read_csv(file_path)
    print(f"Successfully loaded {len(df)} rows from ${connection.name}")
    print(df.head())
except Exception as e:
    print(f"Error loading CSV: {e}")
`;
        }

        return `# Language ${lang} not supported for CSV connector yet.`;
    }
}

