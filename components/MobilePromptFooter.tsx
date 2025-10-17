import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent, useRef } from 'react';
import { TalkToAiIcon, EditDrawerIcon, UploadIcon, CloseIcon, SparklesIcon } from './IconComponents.tsx';
import * as geminiService from '../services/geminiService.ts';
import Spinner from './Spinner.tsx';
import { useNotification } from '../src/contexts/NotificationContext.tsx';

type AiModel = 'chat' | 'recreate' | 'viral';

interface MobilePromptFooterProps {
    onToggleControls: () => void;
    contentManager: any; // Simplified
    isLoading: boolean;
}

const MobilePromptFooter: React.FC<MobilePromptFooterProps> = ({ onToggleControls, contentManager, isLoading }) => {
    const { handleGenerateContent, handleRecreateFromImage, handleGenerateViralPostFromTopic } = contentManager;
    const { addNotification } = useNotification();
    
    const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
    const [selectedModel, setSelectedModel] = useState<AiModel>('chat');
    const [prompt, setPrompt] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    
    const [trendingTopics, setTrendingTopics] = useState<string[]>([]);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadViralTopics = useCallback(async () => {
        if (selectedModel !== 'viral') return;
        setIsLoadingTopics(true);
        try {
            const topics = await geminiService.fetchTrendingTopics();
            setTrendingTopics(topics);
        } catch (err: any) {
            addNotification(`Could not fetch topics: ${err.message}`, 'error');
        } finally {
            setIsLoadingTopics(false);
        }
    }, [selectedModel, addNotification]);

    // FIX: Replaced `isOpen` with `isAiPanelOpen` as `isOpen` was used before declaration.
    useEffect(() => {
        if (isAiPanelOpen) {
            loadViralTopics();
        }
    }, [isAiPanelOpen, loadViralTopics]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const resetImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            switch(selectedModel) {
                case 'recreate':
                    if (imageFile) {
                        await handleRecreateFromImage(imageFile, prompt);
                        setIsAiPanelOpen(false);
                    } else {
                        addNotification('Please upload an image to recreate.', 'info');
                    }
                    break;
                case 'chat':
                     if (prompt.trim() || imageFile) {
                        await handleGenerateContent(prompt, imageFile);
                        setIsAiPanelOpen(false);
                    } else {
                        addNotification('Please enter a prompt or upload an image.', 'info');
                    }
                    break;
                default:
                    if (prompt.trim()) {
                        await handleGenerateContent(prompt, null);
                        setIsAiPanelOpen(false);
                    }
            }
        } catch (err: any) {
            addNotification(`Error: ${err.message}`, 'error');
        }
        
        // Reset form
        setPrompt('');
        resetImage();
    };
    
    const handleTopicClick = async (topic: string) => {
        setIsAiPanelOpen(false);
        await handleGenerateViralPostFromTopic(topic);
    };

    return (
        <>
            <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-4 lg:hidden">
                <button 
                    onClick={() => setIsAiPanelOpen(true)}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110"
                >
                    <TalkToAiIcon className="w-9 h-9" />
                </button>
                 <button 
                    onClick={onToggleControls}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg flex items-center justify-center transform transition-transform hover:scale-110"
                >
                    <EditDrawerIcon className="w-8 h-8" />
                </button>
            </div>
            
            {isAiPanelOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex flex-col justify-end lg:hidden" onClick={() => setIsAiPanelOpen(false)}>
                    <div 
                        className="bg-gray-100 dark:bg-gray-900 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh]"
                        onClick={e => e.stopPropagation()}
                        style={{ transform: 'translateY(100%)', animation: 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                    >
                        <div className="p-4 border-b dark:border-gray-700 flex-shrink-0 flex items-center justify-between">
                            <select 
                                value={selectedModel} 
                                onChange={e => setSelectedModel(e.target.value as AiModel)}
                                className="bg-gray-200 dark:bg-gray-800 border-none rounded-md p-2 font-semibold focus:ring-2 focus:ring-primary"
                            >
                                <option value="chat">Chat</option>
                                <option value="recreate">Recreate Post</option>
                                <option value="viral">Viral Post Ideas</option>
                            </select>
                            <button onClick={() => setIsAiPanelOpen(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <CloseIcon />
                            </button>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                             {selectedModel === 'viral' && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Select a trending topic to generate a post:</h3>
                                    {isLoadingTopics ? <div className="flex justify-center p-4"><Spinner /></div> : (
                                        <div className="flex flex-wrap gap-2">
                                            {trendingTopics.map(topic => (
                                                <button key={topic} onClick={() => handleTopicClick(topic)} className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    {topic}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {imagePreview && (
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                                    <img src={imagePreview} alt="upload preview" className="w-full h-full object-cover" />
                                    <button onClick={resetImage} className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full">&times;</button>
                                </div>
                            )}
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                            <div className="flex items-start gap-2">
                                {['chat', 'recreate'].includes(selectedModel) && (
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
                                        <UploadIcon className="w-5 h-5" />
                                    </button>
                                )}
                                <textarea
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    placeholder={
                                        selectedModel === 'recreate' ? "Add optional context for the image..." : 
                                        selectedModel === 'viral' ? "Select a topic above to get started" :
                                        "Ask me anything..."
                                    }
                                    rows={1}
                                    className="w-full p-3 bg-gray-200 dark:bg-gray-700 rounded-full border-transparent focus:ring-2 focus:ring-primary resize-none"
                                    disabled={selectedModel === 'viral'}
                                />
                                <button type="submit" disabled={isLoading || selectedModel === 'viral'} className="p-3 rounded-full bg-primary text-primary-text disabled:opacity-50">
                                    {isLoading ? <Spinner size="sm" /> : <SparklesIcon />}
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>
                        </form>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </>
    );
};

export default MobilePromptFooter;
