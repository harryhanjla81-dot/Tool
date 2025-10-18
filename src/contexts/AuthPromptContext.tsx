import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import LoginPromptModal from '../../components/LoginPromptModal.tsx';

interface AuthPromptContextType {
    isAuthPromptOpen: boolean;
    openAuthPrompt: () => void;
    closeAuthPrompt: () => void;
}

const AuthPromptContext = createContext<AuthPromptContextType | undefined>(undefined);

export const useAuthPrompt = (): AuthPromptContextType => {
    const context = useContext(AuthPromptContext);
    if (!context) {
        throw new Error('useAuthPrompt must be used within an AuthPromptProvider');
    }
    return context;
};

export const AuthPromptProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);

    const openAuthPrompt = useCallback(() => {
        setIsAuthPromptOpen(true);
    }, []);
    
    const closeAuthPrompt = useCallback(() => {
        setIsAuthPromptOpen(false);
    }, []);

    const value = {
        isAuthPromptOpen,
        openAuthPrompt,
        closeAuthPrompt,
    };

    return (
        <AuthPromptContext.Provider value={value}>
            {children}
            <LoginPromptModal isOpen={isAuthPromptOpen} onClose={closeAuthPrompt} />
        </AuthPromptContext.Provider>
    );
};
