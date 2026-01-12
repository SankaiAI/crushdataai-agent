
import { KPI } from '../../types/chart';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import './KPICard.css';

interface KPICardProps {
    kpi: KPI;
}

export function KPICard({ kpi }: KPICardProps) {
    const getTrendIcon = () => {
        switch (kpi.trendDirection) {
            case 'up':
                return <FiTrendingUp className="trend-icon up" />;
            case 'down':
                return <FiTrendingDown className="trend-icon down" />;
            default:
                return <FiMinus className="trend-icon neutral" />;
        }
    };

    const getTrendClass = () => {
        if (kpi.trend?.startsWith('+')) return 'positive';
        if (kpi.trend?.startsWith('-')) return 'negative';
        return 'neutral';
    };

    return (
        <div className="kpi-card">
            <div className="kpi-label">{kpi.label}</div>
            <div className="kpi-value">{kpi.value}</div>
            {kpi.trend && (
                <div className={`kpi-trend ${getTrendClass()}`}>
                    {getTrendIcon()}
                    <span>{kpi.trend}</span>
                </div>
            )}
        </div>
    );
}
