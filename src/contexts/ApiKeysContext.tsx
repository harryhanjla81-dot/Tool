import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { ApiKey } from '../../types.ts';
import { useNotification } from './NotificationContext.tsx';

const API_KEYS_STORAGE_KEY = 'hanjlaHarryApiKeys_v2';

interface ApiKeysContextType {
  apiKeys: ApiKey[];
  isModalOpen: boolean;
  addApiKey: (key: Omit<ApiKey, 'id' | 'isActive'>) => void;
  updateApiKey: (id: string, updates: Partial<ApiKey>) => void;
  removeApiKey: (id: string) => void;
  getActiveKeys: (provider?: 'gemini' | 'chatgpt') => ApiKey[];
  toggleModal: () => void;
}

const ApiKeysContext = createContext<ApiKeysContextType | undefined>(undefined);

export const useApiKeys = (): ApiKeysContextType => {
  const context = useContext(ApiKeysContext);
  if (!context) {
    throw new Error('useApiKeys must be used within an ApiKeysProvider');
  }
  return context;
};

export const ApiKeysProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { addNotification } = useNotification();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys));
      } else {
        setIsModalOpen(true); // Open modal on first load if no keys are found
      }
    } catch (error) {
      console.error('Failed to load API keys from storage', error);
      setApiKeys([]);
    }
  }, []);

  const saveKeysToStorage = (keys: ApiKey[]) => {
    try {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch (error) {
      console.error('Failed to save API keys to storage', error);
    }
  };

  const addApiKey = (key: Omit<ApiKey, 'id' | 'isActive'>) => {
    setApiKeys(prev => {
      // Deactivate other gemini keys if adding a new active one
      let newKeys = [...prev];
      if (key.provider === 'gemini') {
        newKeys = newKeys.map(k => k.provider === 'gemini' ? { ...k, isActive: false } : k);
      }
      const newKey = { ...key, id: `${Date.now()}`, isActive: true };
      newKeys.push(newKey);
      saveKeysToStorage(newKeys);
      addNotification(`Added new ${key.provider} key: ${key.name}`, 'success');
      return newKeys;
    });
  };

  const updateApiKey = (id: string, updates: Partial<ApiKey>) => {
    setApiKeys(prev => {
      let newKeys = prev.map(k => k.id === id ? { ...k, ...updates } : k);
      // If we are activating a gemini key, deactivate all others
      const updatedKey = newKeys.find(k => k.id === id);
      if (updatedKey && updatedKey.provider === 'gemini' && updates.isActive) {
        newKeys = newKeys.map(k => (k.id !== id && k.provider === 'gemini') ? { ...k, isActive: false } : k);
      }
      saveKeysToStorage(newKeys);
      return newKeys;
    });
  };

  const removeApiKey = (id: string) => {
    setApiKeys(prev => {
      const keyToRemove = prev.find(k => k.id === id);
      const newKeys = prev.filter(k => k.id !== id);
      saveKeysToStorage(newKeys);
      if (keyToRemove) {
        addNotification(`Removed key: ${keyToRemove.name}`, 'info');
      }
      return newKeys;
    });
  };

  const getActiveKeys = useCallback((provider?: 'gemini' | 'chatgpt') => {
    return apiKeys.filter(k => k.isActive && (!provider || k.provider === provider));
  }, [apiKeys]);

  const toggleModal = () => setIsModalOpen(prev => !prev);

  const value = { apiKeys, isModalOpen, addApiKey, updateApiKey, removeApiKey, getActiveKeys, toggleModal };

  return (
    <ApiKeysContext.Provider value={value}>
      {children}
    </ApiKeysContext.Provider>
  );
};
