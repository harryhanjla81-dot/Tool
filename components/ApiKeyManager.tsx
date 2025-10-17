import React, { useState } from 'react';
import { useApiKeys } from '../src/contexts/ApiKeysContext.tsx';
import { ApiKey } from '../types.ts';
import { TrashIcon, EyeIcon, EyeSlashIcon, KeyIcon } from './IconComponents.tsx';

const ApiKeyManager: React.FC = () => {
  const { apiKeys, addApiKey, updateApiKey, removeApiKey } = useApiKeys();
  
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [visibleKey, setVisibleKey] = useState<string | null>(null);

  const handleAddKey = () => {
    if (newKeyName.trim() && newKeyValue.trim()) {
      addApiKey({ name: newKeyName, key: newKeyValue, provider: 'gemini' });
      setNewKeyName('');
      setNewKeyValue('');
    }
  };

  const maskKey = (key: string) => {
    if (key.length < 8) return '****';
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };
  
  const geminiKeys = apiKeys.filter(k => k.provider === 'gemini');

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Saved Gemini Keys</h3>
        <div className="space-y-3">
          {geminiKeys.length > 0 ? (
            geminiKeys.map(key => (
              <div key={key.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{key.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono flex items-center gap-2">
                    {visibleKey === key.id ? key.key : maskKey(key.key)}
                    <button onClick={() => setVisibleKey(prev => prev === key.id ? null : key.id)}>
                        {visibleKey === key.id ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                    </button>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor={`active-toggle-${key.id}`} className="text-sm font-medium">Active</label>
                    <div className="relative">
                        <input 
                            type="checkbox" 
                            id={`active-toggle-${key.id}`}
                            checked={key.isActive}
                            onChange={(e) => updateApiKey(key.id, { isActive: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </div>
                  <button onClick={() => removeApiKey(key.id)} className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">No Gemini API keys saved.</p>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Add New Gemini Key</h3>
        <div className="space-y-4">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key Name (e.g., 'My Project Key')"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600"
          />
          <input
            type="password"
            value={newKeyValue}
            onChange={(e) => setNewKeyValue(e.target.value)}
            placeholder="Paste your API Key here"
            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 font-mono"
          />
          <button
            onClick={handleAddKey}
            disabled={!newKeyName.trim() || !newKeyValue.trim()}
            className="w-full px-4 py-2 bg-primary text-primary-text font-semibold rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <KeyIcon className="w-5 h-5" /> Add and Activate Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;