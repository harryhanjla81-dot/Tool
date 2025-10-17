import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import ConfirmationModal from '../../components/ConfirmationModal.tsx';

interface ConfirmOptions {
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    confirmButtonClass?: string;
    icon?: React.ReactNode;
    onConfirm: () => void;
}

interface ConfirmationContextType {
    confirmAction: (options: ConfirmOptions) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export const useConfirmation = (): ConfirmationContextType => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error('useConfirmation must be used within a ConfirmationProvider');
    }
    return context;
};

export const ConfirmationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<ConfirmOptions | null>(null);

    const confirmAction = useCallback((options: ConfirmOptions) => {
        setOptions(options);
    }, []);

    const handleClose = () => {
        setOptions(null);
    };

    const handleConfirm = () => {
        if (options) {
            options.onConfirm();
            setOptions(null);
        }
    };

    return (
        <ConfirmationContext.Provider value={{ confirmAction }}>
            {children}
            {options && (
                <ConfirmationModal
                    isOpen={!!options}
                    onClose={handleClose}
                    onConfirm={handleConfirm}
                    title={options.title}
                    message={options.message}
                    confirmText={options.confirmText}
                    confirmButtonClass={options.confirmButtonClass}
                    icon={options.icon}
                />
            )}
        </ConfirmationContext.Provider>
    );
};
