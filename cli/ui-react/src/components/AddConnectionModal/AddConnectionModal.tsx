import { useState } from 'react';
import { Connection, ConnectionType } from '../../types';
import { SourceGrid } from './SourceGrid';
import { ConnectionForm } from './ConnectionForm';
import './AddConnectionModal.css';

interface AddConnectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (connection: Connection) => Promise<boolean>;
    onTest: (connection: Connection) => Promise<{ success: boolean; message: string }>;
}

export function AddConnectionModal({ isOpen, onClose, onAdd, onTest }: AddConnectionModalProps) {
    const [selectedType, setSelectedType] = useState<ConnectionType | null>(null);
    const [formData, setFormData] = useState<Partial<Connection>>({});
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleTypeSelect = (type: ConnectionType) => {
        setSelectedType(type);
        setFormData({ type });
        setTestResult(null);
    };

    const handleFormChange = (data: Partial<Connection>) => {
        setFormData({ ...formData, ...data });
        setTestResult(null);
    };

    const handleTest = async () => {
        if (!selectedType || !formData.name) return;
        setTesting(true);
        const result = await onTest(formData as Connection);
        setTestResult(result);
        setTesting(false);
    };

    const handleSave = async () => {
        if (!selectedType || !formData.name) return;
        setSaving(true);
        const success = await onAdd(formData as Connection);
        setSaving(false);
        if (success) {
            handleClose();
        }
    };

    const handleClose = () => {
        setSelectedType(null);
        setFormData({});
        setTestResult(null);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">New Data Connection</h2>
                    <button className="modal-close" onClick={handleClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="modal-body">
                    <SourceGrid selectedType={selectedType} onSelect={handleTypeSelect} />

                    {selectedType && (
                        <ConnectionForm
                            type={selectedType}
                            data={formData}
                            onChange={handleFormChange}
                            testResult={testResult}
                        />
                    )}
                </div>

                {selectedType && (
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={handleTest}
                            disabled={testing || !formData.name}
                        >
                            {testing ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving || !formData.name}
                        >
                            {saving ? 'Saving...' : 'Save Connection'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
