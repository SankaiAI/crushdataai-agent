import { useState } from 'react';
import { Connection } from '../../types';
import { DatabaseIcon } from '../Icons/DatabaseIcons';
import { DeleteConnectionModal } from '../DeleteConnectionModal/DeleteConnectionModal';
import './Sidebar.css';

interface SidebarProps {
    connections: Connection[];
    selectedConnection: string | null;
    onSelectConnection: (name: string) => void;
    onAddConnection: () => void;
    onDeleteConnection: (name: string) => void;
}

export function Sidebar({
    connections,
    selectedConnection,
    onSelectConnection,
    onAddConnection,
    onDeleteConnection,
}: SidebarProps) {
    const [connectionToDelete, setConnectionToDelete] = useState<string | null>(null);

    const handleDeleteClick = (e: React.MouseEvent, name: string) => {
        e.stopPropagation();
        setConnectionToDelete(name);
    };

    const confirmDelete = () => {
        if (connectionToDelete) {
            onDeleteConnection(connectionToDelete);
            setConnectionToDelete(null);
        }
    };

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div className="logo">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                <line x1="12" y1="22.08" x2="12" y2="12" />
                            </svg>
                        </div>
                        <div className="logo-text">
                            <span className="logo-title">CrushData</span>
                            <span className="logo-badge">AI</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="section-header">
                        <h3>Connections</h3>
                        <span className="count">{connections.length}</span>
                    </div>

                    <div className="connections-list">
                        {connections.map((conn) => (
                            <div
                                key={conn.name}
                                className={`connection-item ${selectedConnection === conn.name ? 'active' : ''}`}
                                onClick={() => onSelectConnection(conn.name)}
                            >
                                <div className="icon">
                                    <DatabaseIcon type={conn.type} size={20} />
                                </div>
                                <span className="name">{conn.name}</span>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => handleDeleteClick(e, conn.name)}
                                    title="Delete connection"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="add-btn" onClick={onAddConnection}>
                        <span>+</span> Add Connection
                    </button>
                </div>
            </aside>

            <DeleteConnectionModal
                isOpen={!!connectionToDelete}
                connectionName={connectionToDelete}
                onClose={() => setConnectionToDelete(null)}
                onConfirm={confirmDelete}
            />
        </>
    );
}
