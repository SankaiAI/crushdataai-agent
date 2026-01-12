
import { DashboardListItem } from '../../types/chart';
import { FiGrid, FiBarChart2 } from 'react-icons/fi';
import './Sidebar.css';

interface SidebarProps {
    dashboards: DashboardListItem[];
    currentId?: string;
    onSelect: (id: string) => void;
}

export function Sidebar({ dashboards, currentId, onSelect }: SidebarProps) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <FiGrid className="sidebar-icon" />
                <h2>Dashboards</h2>
            </div>
            <nav className="sidebar-nav">
                {dashboards.length === 0 ? (
                    <div className="sidebar-empty">No dashboards</div>
                ) : (
                    dashboards.map(dashboard => (
                        <button
                            key={dashboard.id}
                            className={`sidebar-item ${currentId === dashboard.id ? 'active' : ''}`}
                            onClick={() => onSelect(dashboard.id)}
                        >
                            <FiBarChart2 className="item-icon" />
                            <div className="item-content">
                                <span className="item-title">{dashboard.title}</span>
                                <span className="item-meta">
                                    {dashboard.chartCount} charts · {dashboard.kpiCount} KPIs
                                </span>
                            </div>
                        </button>
                    ))
                )}
            </nav>
        </aside>
    );
}
