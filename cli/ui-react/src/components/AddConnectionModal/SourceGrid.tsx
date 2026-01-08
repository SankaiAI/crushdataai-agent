import { ConnectionType } from '../../types';
import { DatabaseIcon, getDatabaseName, databaseTypes } from '../Icons/DatabaseIcons';
import { FaQuestionCircle } from 'react-icons/fa';

interface SourceGridProps {
    selectedType: ConnectionType | null;
    onSelect: (type: ConnectionType) => void;
}

export function SourceGrid({ selectedType, onSelect }: SourceGridProps) {
    return (
        <div className="source-grid">
            {databaseTypes.map((type) => (
                <div key={type} className="source-btn-wrapper">
                    <button
                        className={`source-btn ${selectedType === type ? 'selected' : ''}`}
                        onClick={() => onSelect(type)}
                    >
                        <div className="icon">
                            <DatabaseIcon type={type} size={32} />
                        </div>
                        <div className="name">{getDatabaseName(type)}</div>
                    </button>
                    <button className="help-btn" title={`Help for ${getDatabaseName(type)}`}>
                        <FaQuestionCircle size={12} />
                    </button>
                </div>
            ))}
        </div>
    );
}
