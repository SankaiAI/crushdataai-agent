import { useState, useEffect, useCallback } from 'react';
import { Connection, Table, TableData } from '../types';

const API_BASE = '/api';

export function useConnections() {
    const [connections, setConnections] = useState<Connection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConnections = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/connections`);
            if (!res.ok) throw new Error('Failed to fetch connections');
            const data = await res.json();
            // API returns { connections: [...] }
            setConnections(data.connections || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setConnections([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const addConnection = async (connection: Connection): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/connections`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(connection),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to add connection');
            await fetchConnections();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    };

    const deleteConnection = async (name: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_BASE}/connections/${encodeURIComponent(name)}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete connection');
            await fetchConnections();
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            return false;
        }
    };

    const testConnection = async (connection: Connection): Promise<{ success: boolean; message: string }> => {
        try {
            const res = await fetch(`${API_BASE}/connections/test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(connection),
            });
            const data = await res.json();
            return { success: data.success, message: data.message || (data.success ? 'Connection valid' : data.error || 'Connection failed') };
        } catch (err) {
            return { success: false, message: err instanceof Error ? err.message : 'Unknown error' };
        }
    };

    return {
        connections,
        loading,
        error,
        addConnection,
        deleteConnection,
        testConnection,
        refresh: fetchConnections,
    };
}

export function useTables(connectionName: string | null) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!connectionName) {
            setTables([]);
            return;
        }

        const fetchTables = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE}/connections/${encodeURIComponent(connectionName)}/tables`);
                if (!res.ok) throw new Error('Failed to fetch tables');
                const data = await res.json();
                // API returns { success: true, tables: [...] }
                setTables(data.tables || []);
            } catch {
                setTables([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
    }, [connectionName]);

    return { tables, loading };
}

export function useTableData(connectionName: string | null, tableName: string | null, page: number, limit: number) {
    const [data, setData] = useState<TableData | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!connectionName || !tableName) {
            setData(null);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${API_BASE}/connections/${encodeURIComponent(connectionName)}/tables/${encodeURIComponent(tableName)}/data?page=${page}&limit=${limit}`
                );
                if (!res.ok) throw new Error('Failed to fetch data');
                const result = await res.json();

                // Map API response to TableData interface
                if (result.success) {
                    setData({
                        columns: result.columns || [],
                        rows: result.rows || [],
                        total: result.pagination?.totalRows || 0,
                        page: page,
                        limit: limit
                    });
                } else {
                    setData(null);
                }
            } catch {
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [connectionName, tableName, page, limit]);

    return { data, loading };
}
