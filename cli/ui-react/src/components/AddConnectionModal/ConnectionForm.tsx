import { ConnectionType, Connection } from '../../types';

interface ConnectionFormProps {
    type: ConnectionType;
    data: Partial<Connection>;
    onChange: (data: Partial<Connection>) => void;
    testResult: { success: boolean; message: string } | null;
}

export function ConnectionForm({ type, data, onChange, testResult }: ConnectionFormProps) {
    const handleChange = (field: keyof Connection, value: string | number) => {
        onChange({ [field]: value });
    };

    const getDefaultPort = (): number => {
        const ports: Partial<Record<ConnectionType, number>> = {
            mysql: 3306,
            postgresql: 5432,
            sqlserver: 1433,
            redshift: 5439,
            clickhouse: 8123,
            mongodb: 27017,
        };
        return ports[type] || 3306;
    };

    return (
        <form className="connection-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
                <label>Connection Name</label>
                <input
                    type="text"
                    placeholder="e.g. Production DB"
                    value={data.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                />
            </div>

            {/* Database Fields (MySQL, PostgreSQL, SQL Server, Redshift, ClickHouse, MongoDB) */}
            {['mysql', 'postgresql', 'sqlserver', 'redshift', 'clickhouse', 'mongodb'].includes(type) && (
                <>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Host</label>
                            <input
                                type="text"
                                placeholder="localhost"
                                value={data.host || ''}
                                onChange={(e) => handleChange('host', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Port</label>
                            <input
                                type="number"
                                placeholder={String(getDefaultPort())}
                                value={data.port || ''}
                                onChange={(e) => handleChange('port', parseInt(e.target.value) || getDefaultPort())}
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                placeholder="root"
                                value={data.user || ''}
                                onChange={(e) => handleChange('user', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={data.password || ''}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Database</label>
                        <input
                            type="text"
                            placeholder="my_database"
                            value={data.database || ''}
                            onChange={(e) => handleChange('database', e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Shopify Fields */}
            {type === 'shopify' && (
                <>
                    <div className="form-group">
                        <label>Store URL</label>
                        <input
                            type="text"
                            placeholder="my-shop.myshopify.com"
                            value={data.store || ''}
                            onChange={(e) => handleChange('store', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Admin API Access Token</label>
                        <input
                            type="password"
                            placeholder="shpat_..."
                            value={data.apiKey || ''}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>API Secret Key</label>
                        <input
                            type="password"
                            placeholder="shpss_..."
                            value={data.apiSecret || ''}
                            onChange={(e) => handleChange('apiSecret', e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* BigQuery Fields */}
            {type === 'bigquery' && (
                <>
                    <div className="form-group">
                        <label>Project ID</label>
                        <input
                            type="text"
                            placeholder="my-gcp-project"
                            value={data.projectId || ''}
                            onChange={(e) => handleChange('projectId', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Key File Path</label>
                        <input
                            type="text"
                            placeholder="/path/to/service-account.json"
                            value={data.keyFile || ''}
                            onChange={(e) => handleChange('keyFile', e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Snowflake Fields */}
            {type === 'snowflake' && (
                <>
                    <div className="form-group">
                        <label>Account Identifier</label>
                        <input
                            type="text"
                            placeholder="xy12345.us-east-1"
                            value={data.account || ''}
                            onChange={(e) => handleChange('account', e.target.value)}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Username</label>
                            <input
                                type="text"
                                value={data.user || ''}
                                onChange={(e) => handleChange('user', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                value={data.password || ''}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Warehouse</label>
                        <input
                            type="text"
                            placeholder="COMPUTE_WH"
                            value={data.warehouse || ''}
                            onChange={(e) => handleChange('warehouse', e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* Databricks Fields */}
            {type === 'databricks' && (
                <>
                    <div className="form-group">
                        <label>Workspace URL</label>
                        <input
                            type="text"
                            placeholder="adb-xxxxx.azuredatabricks.net"
                            value={data.host || ''}
                            onChange={(e) => handleChange('host', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>HTTP Path</label>
                        <input
                            type="text"
                            placeholder="/sql/1.0/warehouses/xxxxx"
                            value={data.connectionString || ''}
                            onChange={(e) => handleChange('connectionString', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Access Token</label>
                        <input
                            type="password"
                            placeholder="dapi..."
                            value={data.apiKey || ''}
                            onChange={(e) => handleChange('apiKey', e.target.value)}
                        />
                    </div>
                </>
            )}

            {/* CSV Fields */}
            {type === 'csv' && (
                <div className="form-group">
                    <label>File Path</label>
                    <input
                        type="text"
                        placeholder="/path/to/data.csv"
                        value={data.filePath || ''}
                        onChange={(e) => handleChange('filePath', e.target.value)}
                    />
                </div>
            )}

            {/* Custom Connection String */}
            {type === 'custom' && (
                <div className="form-group">
                    <label>Connection String</label>
                    <input
                        type="password"
                        placeholder="dialect://user:password@host:port/database"
                        value={data.connectionString || ''}
                        onChange={(e) => handleChange('connectionString', e.target.value)}
                    />
                    <p className="form-hint">
                        Examples: <code>postgresql://user:pass@host/db</code>, <code>mssql+pyodbc://user:pass@dsn</code>
                    </p>
                </div>
            )}

            {/* Test Result */}
            {testResult && (
                <div className={`message ${testResult.success ? 'success' : 'error'}`}>
                    {testResult.message}
                </div>
            )}
        </form>
    );
}
