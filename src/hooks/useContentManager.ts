import { useState, useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext.tsx';
import { useNotification } from '../contexts/NotificationContext.tsx';
// import { useApiKeys } from '../contexts/ApiKeysContext.tsx'; // No longer needed
import * as geminiService from '../../services/geminiService.ts';
import { CardData, NewsArticle, NewsArticleCore, CardDisplayState, getCountryName, SelectedLanguageCode, HeaderType, ViralPost, getContrastingTextColor, hexToRgba } from '../../types.ts';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useFacebookPage } from '../contexts/FacebookPageContext.tsx';

const API_VERSION = 'v19.0';

export const useContentManager = (
    setCropRequest: (request: { file: File; articleId: string } | null) => void
) => {
    const { settings } = useSettings();
    const { addNotification } = useNotification();
    const { activePage } = useFacebookPage();

    const [cards, setCards] = useState<CardData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPreparingArticles, setIsPreparingArticles] = useState<boolean>(false);
    const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);
    const [uploadingCardId, setUploadingCardId] = useState<string | null>(null);


    const updateCardState = useCallback((id: string, updates: Partial<CardData>) => {
        setCards(prevCards =>
            prevCards.map(card => card.id === id ? { ...card, ...updates } as CardData : card)
        );
    }, []);

    const addCard = useCallback((card: CardData) => {
        setCards(prev => [...prev, card]);
    }, []);

    const handleGenerateContent = useCallback(async (customPrompt?: string) => {
        setIsLoading(true);
        setCards([]); // Clear existing cards when generating new content
        setIsPreparingArticles(true);

        try {
            const { postCount, selectedLanguage, selectedCountryCode, selectedEmotion, selectedContentType, selectedContentCategory, ...defaultStyles } = settings;
            const countryName = getCountryName(selectedCountryCode);
            
            const fetchedData = customPrompt
                ? await geminiService.fetchContentFromPrompt(customPrompt, postCount, selectedLanguage, selectedCountryCode, countryName, selectedEmotion)
                : await geminiService.fetchContent(postCount, selectedContentType, selectedContentCategory, selectedLanguage, selectedCountryCode, countryName, selectedEmotion);
            
            const { articles: fetchedArticlesCore, sourcesByHeadline } = fetchedData;

            if (!fetchedArticlesCore || fetchedArticlesCore.length === 0) {
                addNotification(customPrompt ? "I couldn't generate content for that prompt." : "AI returned no content.", "info");
                setIsLoading(false);
                setIsPreparingArticles(false);
                return;
            }

            setIsLoading(false); // Stop main loader, individual processing will show progress

            for (const [index, core] of fetchedArticlesCore.entries()) {
                addNotification(`Processing card ${index + 1} of ${fetchedArticlesCore.length}: Generating image...`, 'info', 10000);
                
                let imageUrl: string | null = null;
                let imageError: string | null = null;

                // Step 1: Generate the AI image first.
                try {
                    imageUrl = await geminiService.generateAiArticleImage(core.long_headline, settings.selectedLanguage);
                } catch (e: any) {
                    const errorMessage = e.message || "Unknown error generating image.";
                    if (errorMessage.toLowerCase().includes("rate limit exceeded")) {
                        addNotification("API rate limit hit. Pausing for 60s before retrying...", "info", 60000);
                        await new Promise(resolve => setTimeout(resolve, 60000));
                        try {
                            imageUrl = await geminiService.generateAiArticleImage(core.long_headline, settings.selectedLanguage);
                        } catch (retryError: any) {
                            imageError = retryError.message || "Unknown error on retry.";
                        }
                    } else {
                        imageError = errorMessage;
                    }
                }

                if (imageError) {
                    addNotification(`Image for "${core.long_headline.substring(0, 20)}..." failed: ${imageError}`, "error");
                }
                
                // Step 2: Create the card object with the generated image (or error state).
                const newArticle: (NewsArticle & { type: 'news' }) = {
                    ...core,
                    type: 'news',
                    id: `${Date.now()}-${index}`,
                    sources: sourcesByHeadline[core.long_headline] || [],
                    isHighlighting: true, // Will be highlighted next
                    style: { ...defaultStyles },
                    localImageUrl: null,
                    aiImageUrl: imageUrl,
                    isAiImageLoading: false, // Image is already processed
                    aiImageError: imageError,
                    displayState: imageUrl ? CardDisplayState.AI_IMAGE_LOADED : CardDisplayState.AI_IMAGE_FAILED,
                    objectAiImageQuery: null,
                    isObjectAiImageQueryReady: false,
                    objectAiImageUrl: null,
                    isObjectAiImageLoading: false,
                    objectAiImageError: null,
                };
                
                // Step 3: Add the card to the UI. It will appear with the image.
                addCard(newArticle);

                // Step 4: Generate the highlighted headline and update the card in place.
                try {
                    const html = await geminiService.getHighlightedHeadlineHtml(newArticle.long_headline, selectedLanguage, newArticle.style.headlineHighlightColors);
                    updateCardState(newArticle.id, { highlighted_headline_html: html, isHighlighting: false });
                } catch (e) {
                    console.warn(`Highlighting failed for "${newArticle.long_headline}"`, e);
                    updateCardState(newArticle.id, { isHighlighting: false });
                }
                
                // Optional: delay between cards to avoid hitting API limits too fast if many are requested.
                if (fetchedArticlesCore.length > 1 && index < fetchedArticlesCore.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            setIsPreparingArticles(false);
        } catch (error: any) {
            console.error("Error generating content:", error);
            addNotification(`Content generation failed: ${error.message}`, "error");
            setIsLoading(false);
            setIsPreparingArticles(false);
        }
    }, [settings, addNotification, updateCardState, addCard]);

    const handleGenerateViralPost = useCallback(async (topic: string) => {
        const tempId = `viral-${Date.now()}`;
        const newPost: (ViralPost & { type: 'viral' }) = {
            id: tempId,
            type: 'viral',
            topic,
            headline: 'Generating...',
            summary: 'Please wait while the AI crafts the content.',
            imageUrl: null,
            isLoading: true,
            error: null,
        };
        addCard(newPost);
    
        try {
            const content = await geminiService.generateViralPostContent(topic);
            updateCardState(tempId, { headline: content.headline, summary: content.summary });
            
            const imageUrl = await geminiService.generateViralImage(content.image_prompt);
            updateCardState(tempId, { imageUrl: imageUrl, isLoading: false });
            addNotification(`Viral post for "${topic}" generated!`, 'success');
        } catch (error: any) {
            updateCardState(tempId, { error: error.message, isLoading: false });
            addNotification(`Failed to generate viral post: ${error.message}`, 'error');
        }
    }, [addCard, addNotification, updateCardState]);

    const handleRecreateFromImage = useCallback(async (file: File, customCaption?: string) => {
        const tempId = `viral-recreate-${Date.now()}`;
        const newPost: (ViralPost & { type: 'viral' }) = {
            id: tempId,
            type: 'viral',
            topic: file.name,
            headline: 'Analyzing image...',
            summary: 'Extracting content and generating new image...',
            imageUrl: null,
            isLoading: true,
            error: null,
        };
        addCard(newPost);
    
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                const imageData = { mimeType: file.type, data: base64data };
                
                const content = await geminiService.analyzeAndGenerateViralContent(imageData, customCaption);
                updateCardState(tempId, { headline: content.headline, summary: content.summary });
                
                const imageUrl = await geminiService.generateViralImage(content.image_prompt);
                updateCardState(tempId, { imageUrl, isLoading: false });
                addNotification(`Viral post recreated from image!`, 'success');
            };
        } catch (error: any) {
            updateCardState(tempId, { error: error.message, isLoading: false });
            addNotification(`Failed to recreate from image: ${error.message}`, 'error');
        }
    }, [addCard, addNotification, updateCardState]);
    

    const handleGenerateAiImageForCard = useCallback(async (articleId: string) => {
        const card = cards.find(c => c.id === articleId && c.type === 'news') as (NewsArticle & { type: 'news' }) | undefined;
        if (!card) return;

        updateCardState(articleId, {
            isAiImageLoading: true,
            aiImageError: null,
            displayState: CardDisplayState.AI_IMAGE_LOADING
        });

        try {
            const imageUrl = await geminiService.generateAiArticleImage(card.long_headline, settings.selectedLanguage);
            updateCardState(articleId, {
                aiImageUrl: imageUrl,
                localImageUrl: null, // AI image overrides local one
                isAiImageLoading: false,
                displayState: CardDisplayState.AI_IMAGE_LOADED
            });
            addNotification('New AI background generated!', 'success');
        } catch (error: any) {
            console.error("Error generating AI image for card:", error);
            updateCardState(articleId, {
                isAiImageLoading: false,
                aiImageError: error.message,
                displayState: CardDisplayState.AI_IMAGE_FAILED,
            });
            addNotification(`Image generation failed: ${error.message}`, 'error');
        }
    }, [cards, settings.selectedLanguage, updateCardState, addNotification]);

    const handleLocalImageUpload = useCallback((articleId: string, file: File) => {
        setCropRequest({ file, articleId });
    }, [setCropRequest]);

    const handleCropConfirm = useCallback((articleId: string, croppedDataUrl: string) => {
         updateCardState(articleId, {
            localImageUrl: croppedDataUrl,
            aiImageUrl: null, // Local image overrides AI one
            displayState: CardDisplayState.AI_IMAGE_LOADED
        });
        addNotification('Local image applied as background.', 'success');
    }, [updateCardState, addNotification]);

    const handleUpdateTextAndRegenerate = useCallback(async (articleId: string, updates: { headline: string; summary: string; wordCount?: number }) => {
        const card = cards.find(c => c.id === articleId && c.type === 'news') as NewsArticle | undefined;
        if (!card) return;

        updateCardState(articleId, { isHighlighting: true, long_headline: updates.headline, summary: updates.summary });

        let newHeadline = updates.headline;
        if (updates.wordCount && updates.wordCount > 0) {
            try {
                newHeadline = await geminiService.regenerateHeadlineByWordCount(updates.headline, updates.wordCount, settings.selectedLanguage);
            } catch (error: any) {
                addNotification(`Headline regeneration failed: ${error.message}`, 'error');
            }
        }
        
        try {
            const html = await geminiService.getHighlightedHeadlineHtml(newHeadline, settings.selectedLanguage, card.style.headlineHighlightColors);
            updateCardState(articleId, {
                long_headline: newHeadline,
                highlighted_headline_html: html,
                isHighlighting: false
            });
        } catch (e) {
            console.warn(`Highlighting failed for "${newHeadline}"`, e);
            updateCardState(articleId, {
                long_headline: newHeadline,
                highlighted_headline_html: newHeadline, // Fallback
                isHighlighting: false
            });
        }
    }, [cards, settings.selectedLanguage, updateCardState, addNotification]);

    const handleRegenerateAllHeadlines = useCallback(async (wordCount: number) => {
        addNotification(`Regenerating all headlines to ${wordCount} words...`, 'info');
        const newsCards = cards.filter(c => c.type === 'news') as NewsArticle[];
        for (const card of newsCards) {
            await handleUpdateTextAndRegenerate(card.id, { headline: card.long_headline, summary: card.summary, wordCount });
            await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
        }
        addNotification('All headlines have been regenerated.', 'success');
    }, [cards, handleUpdateTextAndRegenerate, addNotification]);
    
    // --- POSTING & DOWNLOADING ---

    const getElementToRender = async (cardId: string): Promise<HTMLElement> => {
        // Wait for the next tick to ensure DOM is updated
        await new Promise(resolve => setTimeout(resolve, 0));
        
        const cardElement = document.querySelector(`[data-card-id="${cardId}"] .news-card-wrapper, [data-card-id="${cardId}"] .viral-post-card-container`) as HTMLElement;
        if (!cardElement) throw new Error('Card element not found in DOM.');
        
        // Temporarily remove "no-screenshot" elements before rendering
        const elementsToHide = cardElement.querySelectorAll('.no-screenshot');
        elementsToHide.forEach(el => (el as HTMLElement).style.display = 'none');
        
        return cardElement;
    };
    
    const restoreHiddenElements = (cardElement: HTMLElement) => {
        const elementsToShow = cardElement.querySelectorAll('.no-screenshot');
        elementsToShow.forEach(el => (el as HTMLElement).style.display = '');
    };
    
    const renderCardToCanvas = async (cardId: string): Promise<HTMLCanvasElement> => {
        const element = await getElementToRender(cardId);
        try {
            return await html2canvas(element, {
                allowTaint: true,
                useCORS: true,
                scale: 3 // Higher scale for better quality
            });
        } finally {
            restoreHiddenElements(element);
        }
    };

    const handlePostCardToFacebook = useCallback(async (cardId: string) => {
        if (!activePage) {
            addNotification('Please connect to a Facebook page first.', 'error');
            return;
        }
        setUploadingCardId(cardId);
        try {
            const canvas = await renderCardToCanvas(cardId);
            const card = cards.find(c => c.id === cardId);
            if (!card) throw new Error('Card data not found');

            const caption = card.type === 'news' ? card.summary : `${card.headline}\n\n${card.summary}`;
            
            canvas.toBlob(async (blob) => {
                if (!blob) {
                    addNotification('Failed to create image blob.', 'error');
                    setUploadingCardId(null);
                    return;
                }
                const formData = new FormData();
                formData.append('access_token', activePage.access_token);
                formData.append('caption', caption);
                formData.append('source', blob, 'post.jpg');

                const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${activePage.id}/photos`, {
                    method: 'POST',
                    body: formData,
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error.message);

                addNotification('Post successfully uploaded to Facebook!', 'success');
            }, 'image/jpeg', 0.95);
        } catch (e: any) {
             addNotification(`Failed to post to Facebook: ${e.message}`, 'error');
        } finally {
            // A short delay to allow the blob creation and fetch to start
            setTimeout(() => setUploadingCardId(null), 2000);
        }
    }, [activePage, addNotification, cards]);
    
    const handleDownloadCard = async (article: NewsArticle) => {
        try {
            const canvas = await renderCardToCanvas(article.id);
            const image = canvas.toDataURL('image/jpeg', 1.0);
            const link = document.createElement('a');
            link.href = image;
            const filename = (article.long_headline || 'untitled').substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${filename}.jpg`;
            link.click();
        } catch (e: any) {
            addNotification(`Download failed: ${e.message}`, 'error');
        }
    };
    
    const handleDownloadViralPost = async (post: ViralPost) => {
         try {
            const canvas = await renderCardToCanvas(post.id);
            const image = canvas.toDataURL('image/jpeg', 1.0);
            const link = document.createElement('a');
            link.href = image;
            const filename = (post.headline || 'untitled_viral').substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `${filename}.jpg`;
            link.click();
        } catch (e: any) {
            addNotification(`Download failed: ${e.message}`, 'error');
        }
    };

    const handleDownloadAll = async () => {
        if (cards.length === 0) return;
        setIsDownloadingAll(true);
        addNotification('Preparing ZIP file for all cards...', 'info');
        const zip = new JSZip();
        try {
            for (const card of cards) {
                const canvas = await renderCardToCanvas(card.id);
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 1.0));
                if (blob) {
                    const headline = card.type === 'news' ? card.long_headline : card.headline;
                    const filename = (headline || 'untitled').substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    zip.file(`${filename}.jpg`, blob);
                }
            }
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'all_cards.zip';
            link.click();
            URL.revokeObjectURL(link.href);
            addNotification('ZIP file download initiated!', 'success');
        } catch (e: any) {
            addNotification(`Failed to create ZIP: ${e.message}`, 'error');
        } finally {
            setIsDownloadingAll(false);
        }
    };

    const handleClearAllContent = () => {
        if (window.confirm('Are you sure you want to clear all generated cards?')) {
            setCards([]);
            addNotification('All cards cleared.', 'info');
        }
    };

    // FIX: Add return statement to export all necessary state and functions.
    return {
        cards,
        setCards,
        isLoading,
        isPreparingArticles,
        isDownloadingAll,
        uploadingCardId,
        handleGenerateContent,
        handleGenerateViralPost,
        handleRecreateFromImage,
        handleGenerateAiImageForCard,
        handleLocalImageUpload,
        handleCropConfirm,
        handleUpdateTextAndRegenerate,
        handleRegenerateAllHeadlines,
        handlePostCardToFacebook,
        handleDownloadCard,
        handleDownloadViralPost,
        handleDownloadAll,
        handleClearAllContent,
    };
};
