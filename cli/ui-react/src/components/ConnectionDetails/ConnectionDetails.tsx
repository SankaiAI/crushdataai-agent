import { Table, TableData } from '../../types';
import { DataTable } from '../DataTable/DataTable';
import './ConnectionDetails.css';

interface ConnectionDetailsProps {
    connectionName: string;
    tables: Table[];
    tablesLoading: boolean;
    selectedTable: string | null;
    onSelectTable: (tableName: string) => void;
    tableData: TableData | null;
    dataLoading: boolean;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

export function ConnectionDetails({
    connectionName,
    tables,
    tablesLoading,
    selectedTable,
    onSelectTable,
    tableData,
    dataLoading,
    page,
    limit,
    onPageChange,
    onLimitChange,
}: ConnectionDetailsProps) {
    return (
        <div className="connection-details">
            <div className="main-header">
                <h1>{connectionName}</h1>
            </div>

            <div className="panels">
                {/* Tables Panel */}
                <div className="panel tables-panel">
                    <div className="panel-header">
                        <h3>Tables</h3>
                        <span className="count">{tables.length}</span>
                    </div>
                    <div className="panel-body">
                        {tablesLoading ? (
                            <div className="loading">Loading tables...</div>
                        ) : tables.length === 0 ? (
                            <div className="empty">No tables found</div>
                        ) : (
                            <div className="table-list">
                                {tables.map((table) => (
                                    <div
                                        key={table.name}
                                        className={`table-card ${selectedTable === table.name ? 'selected' : ''}`}
                                        onClick={() => onSelectTable(table.name)}
                                    >
                                        <span className="table-name">{table.name}</span>
                                        {table.rowCount !== undefined && (
                                            <span className="row-count">{table.rowCount.toLocaleString()} rows</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Data Panel */}
                <div className="panel data-panel">
                    <div className="panel-header">
                        <h3>{selectedTable || 'Select a table'}</h3>
                    </div>
                    <div className="panel-body">
                        {!selectedTable ? (
                            <div className="empty-state">
                                <div className="empty-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <line x1="3" y1="9" x2="21" y2="9" />
                                        <line x1="9" y1="21" x2="9" y2="9" />
                                    </svg>
                                </div>
                                <h3>No Table Selected</h3>
                                <p>Select a table from the list to view its data</p>
                            </div>
                        ) : dataLoading ? (
                            <div className="loading">Loading data...</div>
                        ) : tableData ? (
                            <DataTable
                                data={tableData}
                                page={page}
                                limit={limit}
                                onPageChange={onPageChange}
                                onLimitChange={onLimitChange}
                            />
                        ) : (
                            <div className="empty">No data available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
