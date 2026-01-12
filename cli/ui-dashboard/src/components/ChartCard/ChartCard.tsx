
import { Chart } from '../../types/chart';
import { ChartRenderer } from '../ChartRenderer/ChartRenderer';
import { FiRefreshCw } from 'react-icons/fi';
import './ChartCard.css';

interface ChartCardProps {
    chart: Chart;
    onRefresh?: (chartId: string) => void;
}

export function ChartCard({ chart, onRefresh }: ChartCardProps) {
    const handleRefresh = () => {
        if (onRefresh) {
            onRefresh(chart.id);
        }
    };

    return (
        <div className="chart-card">
            <div className="chart-card-header">
                <div className="chart-card-title-group">
                    <h3 className="chart-card-title">{chart.title}</h3>
                    {chart.description && (
                        <p className="chart-card-description">{chart.description}</p>
                    )}
                </div>
                {onRefresh && chart.query && (
                    <button
                        className="chart-refresh-btn"
                        onClick={handleRefresh}
                        title="Refresh data"
                    >
                        <FiRefreshCw />
                    </button>
                )}
            </div>
            <div className="chart-card-body">
                <ChartRenderer chart={chart} />
            </div>
            {chart.lastRefreshed && (
                <div className="chart-card-footer">
                    <span className="last-refreshed">
                        Last updated: {new Date(chart.lastRefreshed).toLocaleString()}
                    </span>
                </div>
            )}
        </div>
    );
}
