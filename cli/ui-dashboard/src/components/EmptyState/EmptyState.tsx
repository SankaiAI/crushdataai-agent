
import { FiBarChart2 } from 'react-icons/fi';
import './EmptyState.css';

export function EmptyState() {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <FiBarChart2 />
            </div>
            <h2 className="empty-state-title">No Dashboards Yet</h2>
            <p className="empty-state-description">
                Run an AI analysis to generate dashboard visualizations.
            </p>
            <div className="empty-state-steps">
                <p>The AI will:</p>
                <ol>
                    <li>Analyze your data</li>
                    <li>Generate charts and insights</li>
                    <li>Save to <code>reports/dashboards/</code></li>
                </ol>
            </div>
            <div className="empty-state-hint">
                <code>npx crushdata dashboard</code> will automatically display them here.
            </div>
        </div>
    );
}
