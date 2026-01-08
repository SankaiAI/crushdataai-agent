import { useState } from 'react';
import { useConnections, useTables, useTableData } from './hooks/useConnections';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ConnectionDetails } from './components/ConnectionDetails/ConnectionDetails';
import { AddConnectionModal } from './components/AddConnectionModal/AddConnectionModal';
import './App.css';

export default function App() {
    const { connections, addConnection, deleteConnection, testConnection } = useConnections();
    const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    const { tables, loading: tablesLoading } = useTables(selectedConnection);
    const { data: tableData, loading: dataLoading } = useTableData(
        selectedConnection,
        selectedTable,
        page,
        limit
    );

    const handleSelectConnection = (name: string) => {
        setSelectedConnection(name);
        setSelectedTable(null);
        setPage(1);
    };

    const handleSelectTable = (tableName: string) => {
        setSelectedTable(tableName);
        setPage(1);
    };

    const handleDeleteConnection = async (name: string) => {
        const success = await deleteConnection(name);
        if (success && selectedConnection === name) {
            setSelectedConnection(null);
            setSelectedTable(null);
        }
    };

    const currentConnection = connections.find((c) => c.name === selectedConnection);

    return (
        <div className="app">
            <Sidebar
                connections={connections}
                selectedConnection={selectedConnection}
                onSelectConnection={handleSelectConnection}
                onAddConnection={() => setIsModalOpen(true)}
                onDeleteConnection={handleDeleteConnection}
            />

            <main className="main">
                {selectedConnection && currentConnection ? (
                    <ConnectionDetails
                        connectionName={selectedConnection}
                        tables={tables}
                        tablesLoading={tablesLoading}
                        selectedTable={selectedTable}
                        onSelectTable={handleSelectTable}
                        tableData={tableData}
                        dataLoading={dataLoading}
                        page={page}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(newLimit) => {
                            setLimit(newLimit);
                            setPage(1);
                        }}
                    />
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                        </div>
                        <h3>Welcome to CrushData AI</h3>
                        <p>Select a connection from the sidebar or add a new one to get started</p>
                        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                            + Add Connection
                        </button>
                    </div>
                )}
            </main>

            <AddConnectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addConnection}
                onTest={testConnection}
            />
        </div>
    );
}
