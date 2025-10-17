import React, { useState, FormEvent, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext.tsx';
import * as geminiService from '../../../services/geminiService.ts';
import { useNotification } from '../../contexts/NotificationContext.tsx';
import { useSettings } from '../../contexts/SettingsContext.tsx';
import { useConfirmation } from '../../contexts/ConfirmationContext.tsx';
import {
    GenerateIcon, DownloadAllIcon, TrashIcon, EditIcon, CollageIcon, FrameIcon, SparklesIcon
} from '../../../components/IconComponents.tsx';
import Spinner from '../../../components/Spinner.tsx';


interface ActionToolbarProps {
    contentManager: any; // Simplified type for the contentManager hook return value
    cardCount: number;
    isEditingAll: boolean;
    onToggleEditAll: () => void;
    onOpenViralPostModal: () => void;
    onOpenRecreateModal: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
    contentManager,
    cardCount,
    isEditingAll,
    onToggleEditAll,
    onOpenViralPostModal,
    onOpenRecreateModal
}) => {
    const { handleGenerateContent, handleDownloadAll, handleClearAllContent, isLoading, isDownloadingAll } = contentManager;
    const { addNotification } = useNotification();
    const { confirmAction } = useConfirmation();
    const { settings, updateSetting } = useSettings();

    const [userPrompt, setUserPrompt] = useState<string>('');
    const [isProcessingPrompt, setIsProcessingPrompt] = useState<boolean>(false);

    const handlePromptSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!userPrompt.trim() || isProcessingPrompt) return;

        setIsProcessingPrompt(true);

        const settingsOptions = { /* Schema for AI */ };
        try {
            const result = await geminiService.processUserPrompt(userPrompt, settingsOptions);
            
            if (result.action === 'generate_content' && result.content_prompt) {
                await handleGenerateContent(result.content_prompt);
            } else if (result.action === 'update_settings' && result.settings) {
                Object.entries(result.settings).forEach(([key, value]) => {
                    updateSetting(key as any, value as any);
                });
                addNotification(`${Object.keys(result.settings).length} setting(s) updated.`, 'success');
            } else if (result.action === 'answer_question' && result.answer) {
                addNotification(result.answer, 'info');
            }
            setUserPrompt('');
        } catch (err: any) {
            addNotification(err.message || 'Failed to process prompt.', 'error');
        } finally {
            setIsProcessingPrompt(false);
        }
    }, [userPrompt, isProcessingPrompt, handleGenerateContent, updateSetting, addNotification]);

    const confirmAndClearAll = () => {
        confirmAction({
            title: 'Clear All Cards?',
            message: 'Are you sure you want to clear all generated cards from the screen? This action cannot be undone.',
            confirmText: 'Clear All',
            icon: <TrashIcon className="w-6 h-6 text-red-500" />,
            onConfirm: handleClearAllContent,
        });
    };

    return (
        <>
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl p-4 mb-6 sticky top-2 z-20 border dark:border-gray-700/50">
                <form onSubmit={handlePromptSubmit} className="prompt-bar-wrapper flex items-center gap-2 p-1.5 rounded-full mb-4 bg-white dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700">
                     <input
                        type="text"
                        value={userPrompt}
                        onChange={(e) => setUserPrompt(e.target.value)}
                        placeholder="Tell me what to do... (e.g., 'Make the headlines bigger' or 'Generate 5 posts about cats')"
                        className="w-full flex-grow p-2.5 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
                        disabled={isProcessingPrompt || isLoading}
                    />
                    <button type="submit" disabled={isProcessingPrompt || isLoading || !userPrompt.trim()} className="toolbar-btn flex-shrink-0 w-10 h-10 bg-primary text-primary-text font-bold rounded-full disabled:opacity-50 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        {isProcessingPrompt ? <Spinner size="sm" /> : <SparklesIcon className="w-5 h-5" />}
                    </button>
                </form>
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow text-center sm:text-left">Use the prompt bar or buttons below for control.</p>
                    <div className="flex-shrink-0 flex flex-wrap items-center justify-center gap-3">
                        
                        {cardCount > 0 && (
                            <>
                                <button onClick={onToggleEditAll} className={`toolbar-btn px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-semibold ${isEditingAll ? 'bg-primary text-primary-text' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}><EditIcon /><span>{isEditingAll ? 'Finish Editing' : 'Edit All'}</span></button>
                                <button onClick={handleDownloadAll} disabled={isDownloadingAll} className="toolbar-btn px-4 py-2 rounded-lg flex items-center gap-2 font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">{isDownloadingAll ? <Spinner size="sm" /> : <DownloadAllIcon />}<span>{isDownloadingAll ? 'Zipping...' : 'Download All'}</span></button>
                                <button onClick={confirmAndClearAll} className="toolbar-btn px-4 py-2 rounded-lg flex items-center gap-2 font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"><TrashIcon /><span>Clear All</span></button>
                            </>
                        )}
                        <Link to="/collage-maker" className="toolbar-btn px-4 py-2 bg-cyan-600 text-white font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-cyan-700"><CollageIcon /><span>Collage</span></Link>
                        <Link to="/frame-maker" className="toolbar-btn px-4 py-2 bg-teal-600 text-white font-semibold rounded-full flex items-center justify-center gap-2 shadow-lg hover:bg-teal-700"><FrameIcon /><span>Frames</span></Link>
                        <button onClick={onOpenRecreateModal} disabled={isLoading || isProcessingPrompt} className="toolbar-btn px-4 py-2 bg-indigo-600 text-white font-semibold rounded-full disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700"><GenerateIcon /><span>Recreate</span></button>
                        <button onClick={onOpenViralPostModal} disabled={isLoading || isProcessingPrompt} className="toolbar-btn px-4 py-2 bg-purple-600 text-white font-semibold rounded-full disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:bg-purple-700"><GenerateIcon /><span>Viral Post</span></button>
                        
                        <div className="hidden md:flex">
                            <button onClick={() => handleGenerateContent()} disabled={isLoading || isProcessingPrompt} className="toolbar-btn px-6 py-2.5 bg-primary text-primary-text font-bold rounded-full disabled:opacity-50 items-center justify-center gap-2 shadow-lg flex">
                                {isLoading ? <Spinner size="sm" /> : <GenerateIcon />}<span>{isLoading ? 'Generating...' : (cardCount > 0 ? 'Generate More' : 'Generate')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActionToolbar;