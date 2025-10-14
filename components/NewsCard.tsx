import React, { useRef, CSSProperties, ChangeEvent, useState, useCallback } from 'react';
import { 
    NewsArticle, CardDisplayState,
    hexToRgba,
    FontSizeOptions,
    getContrastingTextColor,
    CardStyleSettings
} from '../types.ts'; 
import Spinner from './Spinner.tsx';
import { GenerateIcon, DownloadIcon, EditIcon, UploadIcon, SparklesIcon } from './IconComponents.tsx';

interface NewsCardProps {
  article: NewsArticle;
  onDownload: (article: NewsArticle) => void;
  onGenerateAiImage: (articleId: string) => void;
  onUploadImage: (articleId: string, file: File) => void;
  onEdit: (articleId: string) => void;
  editingCardId: string | null; // To know if this card is being edited
  isEditingAll?: boolean; // To know if all cards are being edited
  onUploadPost: (articleId: string) => void;
  isUploading: boolean;
  onUpdateText: (articleId: string, updates: { headline: string; summary: string; wordCount?: number }) => void;
  onStyleChange: (articleId: string, newStyles: Partial<CardStyleSettings>) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({
  article,
  onDownload,
  onGenerateAiImage,
  onUploadImage,
  onEdit,
  editingCardId,
  isEditingAll = false,
  onUploadPost,
  isUploading,
  onUpdateText,
  onStyleChange,
}) => {
  const { style } = article;
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [isHeadlineEditing, setIsHeadlineEditing] = useState(false);
  const [editedHeadline, setEditedHeadline] = useState(article.long_headline);
  const [showRegenInput, setShowRegenInput] = useState(false);
  const [regenWordCount, setRegenWordCount] = useState('');

  const dragState = useRef<{ type: 'line-height' | 'font-size', startY: number, startX: number, initialValue: number } | null>(null);

  const isEditing = article.id === editingCardId;

  const displayImageUrl = article.localImageUrl || article.aiImageUrl || null;

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onUploadImage(article.id, event.target.files[0]);
    }
  };

  const handleDoubleClick = () => {
    setEditedHeadline(article.long_headline);
    setIsHeadlineEditing(true);
  };

  const handleSaveHeadline = () => {
    setIsHeadlineEditing(false);
    if (editedHeadline !== article.long_headline) {
      onUpdateText(article.id, { headline: editedHeadline, summary: article.summary });
    }
  };

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveHeadline();
    }
    if (e.key === 'Escape') {
      setIsHeadlineEditing(false);
    }
  };

  const handleRegenerate = () => {
    const count = parseInt(regenWordCount, 10);
    if (!isNaN(count) && count > 0) {
      onUpdateText(article.id, {
        headline: article.long_headline,
        summary: article.summary,
        wordCount: count
      });
      setShowRegenInput(false);
      setRegenWordCount('');
    }
  };

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!dragState.current) return;
    const { type, startY, startX, initialValue } = dragState.current;

    if (type === 'line-height') {
      const deltaY = clientY - startY;
      const newHeight = initialValue + (deltaY / 100);
      const clampedHeight = Math.max(0.8, Math.min(2.5, newHeight));
      onStyleChange(article.id, { headlineLineHeight: clampedHeight });
    } else if (type === 'font-size') {
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      const delta = deltaX + deltaY;
      const newSize = initialValue + (delta / 2);
      const clampedSize = Math.max(16, Math.min(80, Math.round(newSize)));
      onStyleChange(article.id, { headlineTextSize: clampedSize });
    }
  }, [article.id, onStyleChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  }, [handleDragMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches[0]) {
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleDragMove]);

  const handleDragEnd = useCallback(() => {
    dragState.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleDragEnd);
  }, [handleMouseMove, handleTouchMove]);

  const handleLineHeightMouseDown = (e: React.MouseEvent) => {
    if (isHeadlineEditing || (e.target as HTMLElement).closest('button, input, textarea, a, svg, path')) return;
    e.preventDefault();
    dragState.current = { type: 'line-height', startY: e.clientY, startX: e.clientX, initialValue: article.style.headlineLineHeight };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
  };

  const handleLineHeightTouchStart = (e: React.TouchEvent) => {
    if (isHeadlineEditing || (e.target as HTMLElement).closest('button, input, textarea, a, svg, path')) return;
    const touch = e.touches[0];
    dragState.current = { type: 'line-height', startY: touch.clientY, startX: touch.clientX, initialValue: article.style.headlineLineHeight };
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);
  };

  const handleFontSizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { type: 'font-size', startY: e.clientY, startX: e.clientX, initialValue: article.style.headlineTextSize };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
  };
  
  const handleFontSizeTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    dragState.current = { type: 'font-size', startY: touch.clientY, startX: touch.clientX, initialValue: article.style.headlineTextSize };
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleDragEnd);
  };


  const outlineWrapperStyle: CSSProperties = {
    borderRadius: `${style.outlineRoundedCorners}px`,
  };

  if (style.outlineEnabled) {
    outlineWrapperStyle.outlineStyle = style.outlineType;
    outlineWrapperStyle.outlineColor = style.outlineColor;
    outlineWrapperStyle.outlineWidth = `${style.outlineWidth}px`;
    outlineWrapperStyle.outlineOffset = `${style.outlineOffset}px`;
  }
  
  const cardContainerStyle: CSSProperties = {
    borderRadius: `${style.outlineRoundedCorners}px`,
    aspectRatio: '1 / 1',
    display: 'grid',
    gridTemplateRows: style.showSummary ? 'auto 1fr auto' : 'auto 1fr',
  };

  const headerOuterStyle: CSSProperties = {
    minHeight: '80px', 
    padding: '1rem 0.75rem', 
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative', // For controls
  };

  if (style.headerType === 'solid') {
    headerOuterStyle.backgroundColor = style.selectedHeaderColor;
  } else if (style.headerType === 'gradient') {
    headerOuterStyle.background = `linear-gradient(${style.headerGradientDirection}, ${style.headerGradientColor1}, ${style.headerGradientColor2})`;
  }

  const headlineStyle: CSSProperties = {
    fontFamily: style.headlineFontFamily,
    fontWeight: style.headlineFontWeight,
    fontSize: `${style.headlineTextSize}px`,
    textAlign: style.headlineTextAlign,
    maxWidth: `${style.headlineTextWidth}%`,
    letterSpacing: `${style.headlineLetterSpacing}px`,
    lineHeight: style.headlineLineHeight,
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    margin: style.headlineTextAlign === 'center' ? '0 auto' : '0',
    color: style.headerType === 'solid' ? getContrastingTextColor(style.selectedHeaderColor) : '#FFFFFF',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
    whiteSpace: 'pre-wrap', // Allows \n to create line breaks
  };

  const textTransformClass = style.textCase === 'uppercase' ? 'uppercase' : '';

  const imageOverlayStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 5,
    pointerEvents: 'none',
  };

  const transparentOverlayBg = hexToRgba(style.overlayBackgroundColor, 0);
  const solidOverlayBg = hexToRgba(style.overlayBackgroundColor, 0.7);

  if (style.overlayVisible) {
    switch (style.overlayPosition) {
      case 'top':
        imageOverlayStyle.top = 0; imageOverlayStyle.left = 0; imageOverlayStyle.right = 0;
        imageOverlayStyle.height = `${style.overlayHeight}%`;
        imageOverlayStyle.background = style.overlayIsSolid ? solidOverlayBg : `linear-gradient(to bottom, ${solidOverlayBg} 0%, ${transparentOverlayBg} 100%)`;
        break;
      case 'bottom':
        imageOverlayStyle.bottom = 0; imageOverlayStyle.left = 0; imageOverlayStyle.right = 0;
        imageOverlayStyle.height = `${style.overlayHeight}%`;
        imageOverlayStyle.background = style.overlayIsSolid ? solidOverlayBg : `linear-gradient(to top, ${solidOverlayBg} 0%, ${transparentOverlayBg} 100%)`;
        break;
      case 'left':
        imageOverlayStyle.top = 0; imageOverlayStyle.left = 0; imageOverlayStyle.bottom = 0;
        imageOverlayStyle.width = `${style.overlayHeight}%`;
        imageOverlayStyle.background = style.overlayIsSolid ? solidOverlayBg : `linear-gradient(to right, ${solidOverlayBg} 0%, ${transparentOverlayBg} 100%)`;
        break;
      case 'right':
        imageOverlayStyle.top = 0; imageOverlayStyle.right = 0; imageOverlayStyle.bottom = 0;
        imageOverlayStyle.width = `${style.overlayHeight}%`;
        imageOverlayStyle.background = style.overlayIsSolid ? solidOverlayBg : `linear-gradient(to left, ${solidOverlayBg} 0%, ${transparentOverlayBg} 100%)`;
        break;
    }
    if (style.overlayOneSideBorderEnabled) {
      const borderStyle = `${style.overlayBorderWidth}px solid ${style.overlayBorderColor}`;
      if (style.overlayBorderPosition === 'top') imageOverlayStyle.borderTop = borderStyle;
      if (style.overlayBorderPosition === 'bottom') imageOverlayStyle.borderBottom = borderStyle;
      if (style.overlayBorderPosition === 'left') imageOverlayStyle.borderLeft = borderStyle;
      if (style.overlayBorderPosition === 'right') imageOverlayStyle.borderRight = borderStyle;
    }
  }

  const summaryContainerStyle: CSSProperties = {};
  if (style.summaryType === 'solid') {
    summaryContainerStyle.backgroundColor = style.summarySolidColor;
  } else if (style.summaryType === 'gradient') {
    summaryContainerStyle.background = `linear-gradient(${style.summaryGradientDirection}, ${style.summaryGradientColor1}, ${style.summaryGradientColor2})`;
  }

  const isImageLoading = article.isAiImageLoading;
  const downloadButtonDisabled = isImageLoading || 
                                 !displayImageUrl ||
                                 article.displayState === CardDisplayState.AI_IMAGE_FAILED;
  const postButtonDisabled = isUploading || downloadButtonDisabled;


  return (
    <div className={`flex flex-col rounded-2xl transition-all duration-300 ${isEditing ? 'ring-4 ring-offset-2 ring-blue-500 dark:ring-blue-400 dark:ring-offset-gray-900' : isEditingAll ? 'ring-2 ring-yellow-500 dark:ring-yellow-400' : ''}`}>
      <div
        style={outlineWrapperStyle}
        className={`news-card-wrapper flex flex-col transition-all duration-300 ease-in-out ${isEditing || isEditingAll ? 'transform scale-[1.005] shadow-2xl' : 'shadow-lg transform hover:scale-[1.03] hover:shadow-2xl'}`}
      >
        <div 
          className="card-container overflow-hidden dark:border dark:border-gray-700 bg-white dark:bg-gray-800"
          style={cardContainerStyle}
        >
          <div 
              className="card-header-outer group"
              style={headerOuterStyle}
              onMouseDown={handleLineHeightMouseDown}
              onTouchStart={handleLineHeightTouchStart}
            >
              <div className="w-full h-full flex items-center justify-center relative">
                {article.isHighlighting ? (
                  <div className="flex items-center justify-center h-full">
                    <Spinner size="sm" color="text-white" />
                    <p className="ml-2 text-white text-sm">Styling headline...</p>
                  </div>
                ) : isHeadlineEditing ? (
                  <textarea
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      onBlur={handleSaveHeadline}
                      onKeyDown={handleTextareaKeyDown}
                      className="bg-transparent border border-dashed rounded-md border-white/50 p-1 resize-none focus:ring-1 focus:ring-white/50 w-full"
                      style={headlineStyle}
                      autoFocus
                  />
                ) : (
                  <h2 
                    className={`card-header-text ${textTransformClass} cursor-grab`} 
                    style={headlineStyle}
                    onDoubleClick={handleDoubleClick}
                    dangerouslySetInnerHTML={article.highlighted_headline_html ? { __html: article.highlighted_headline_html } : undefined}
                  >
                    {!article.highlighted_headline_html ? article.long_headline : null}
                  </h2>
                )}

                {!isHeadlineEditing && (
                  <>
                    <div className="absolute top-0 right-0 bottom-0 left-0 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                       <div 
                         className="absolute bottom-1 right-1 w-7 h-7 p-1.5 cursor-se-resize z-10 pointer-events-auto bg-black/30 rounded-full hover:bg-black/60" 
                         onMouseDown={handleFontSizeMouseDown} 
                         onTouchStart={handleFontSizeTouchStart} 
                         title="Drag to resize font"
                       >
                           <svg width="100%" height="100%" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M11 5L5 11" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round"/>
                               <path d="M11 8.5L8.5 11" stroke="white" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round"/>
                           </svg>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); setShowRegenInput(s => !s); }} className="absolute top-1 right-1 p-1.5 bg-black/30 rounded-full text-white hover:bg-black/60 z-10 pointer-events-auto" title="Regenerate headline with AI">
                          <SparklesIcon className="w-5 h-5" />
                       </button>
                    </div>
                    {showRegenInput && (
                      <div className="absolute top-10 right-1 p-2 bg-white dark:bg-gray-800 rounded shadow-lg flex items-center gap-1 z-20" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
                        <input type="number" value={regenWordCount} onChange={e => setRegenWordCount(e.target.value)} placeholder="Words" className="w-16 p-1 text-sm border rounded text-black bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600"/>
                        <button onClick={handleRegenerate} className="px-2 py-1 text-xs bg-primary text-primary-text rounded">Go</button>
                      </div>
                    )}
                  </>
                )}

              </div>
          </div>

          <div className="relative bg-gray-200 dark:bg-gray-750" style={{ minHeight: 0 }}>
              <div className="image-wrapper absolute inset-0 bg-gray-200 dark:bg-gray-750" style={{ overflow: 'hidden' }}>
                  { article.displayState === CardDisplayState.AI_IMAGE_LOADING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Spinner />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Generating AI image...</p>
                    </div>
                  )}
                  
                  { (article.displayState === CardDisplayState.AI_IMAGE_FAILED && !displayImageUrl) &&
                  <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900 p-2 text-center">
                      <p className="text-red-700 dark:text-red-300 text-xs">
                        {article.aiImageError || "AI image generation failed."}
                      </p>
                  </div>
                  }
                  
                  {displayImageUrl && (
                    <div 
                        aria-label={article.long_headline}
                        className="card-image absolute inset-0 w-full h-full" 
                        style={{
                            backgroundImage: `url("${displayImageUrl}")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                  )}

                  {(!displayImageUrl && ![CardDisplayState.AI_IMAGE_LOADING, CardDisplayState.AI_IMAGE_FAILED].includes(article.displayState)) &&
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400 p-2 text-center">Preparing image...</div>
                  }

                  {style.overlayVisible && <div style={imageOverlayStyle}></div>}

                  {/* Sources Overlay */}
                  {style.showSources && article.sources && article.sources.length > 0 && (
                    <div className="absolute bottom-2 left-2 z-10 p-2 max-w-[70%] bg-black/40 rounded-md text-white">
                        <p className="font-semibold text-[10px] leading-tight mb-1 opacity-90 tracking-wider">SOURCES</p>
                        <ul className="list-none pl-0 space-y-0.5">
                        {article.sources.slice(0, 2).map((source, idx) => source.web && (
                            <li key={idx} className="truncate">
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="hover:underline text-[9px] leading-tight opacity-80 hover:opacity-100" 
                                    title={source.web.title}
                                >
                                    {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                        </ul>
                    </div>
                  )}
                  
                  {article.isObjectAiImageQueryReady && article.objectAiImageQuery && (
                  <div className="no-screenshot absolute bottom-2 right-2 h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden border-2 border-white dark:border-gray-300 shadow-lg z-10 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      {article.isObjectAiImageLoading && <Spinner size="sm" />}
                      {!article.isObjectAiImageLoading && article.objectAiImageUrl && (
                      <img 
                          src={article.objectAiImageUrl} 
                          alt={article.objectAiImageQuery} 
                          className="w-full h-full object-cover" 
                          crossOrigin={article.objectAiImageUrl.startsWith('data:') ? undefined : "anonymous"}
                      />
                      )}
                      {!article.isObjectAiImageLoading && !article.objectAiImageUrl && (
                      <p className="text-xs text-center text-gray-700 dark:text-gray-200 p-1">
                          {article.objectAiImageError ? 'Error' : 'N/A'}
                      </p>
                      )}
                  </div>
                  )}
              </div>
          </div>
            
          {style.showSummary && (
              <div
                className="summary-text-area p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-center"
                style={summaryContainerStyle}
              >
                  <p
                    className={`m-0 ${textTransformClass} ${FontSizeOptions[style.summaryFontSizeKey].summary}`}
                    style={{ 
                      color: style.summaryTextColor,
                      textAlign: 'center'
                    }}
                    dangerouslySetInnerHTML={{ __html: article.summary }}
                  ></p>
              </div>
          )}
        </div>
      </div>
      
      <div className="no-screenshot p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <input type="file" ref={uploadInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
        <div className="grid grid-cols-3 gap-2 text-xs">
            <button onClick={() => onGenerateAiImage(article.id)} disabled={article.isAiImageLoading || isUploading} className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-colors">
                {article.isAiImageLoading ? <Spinner size="sm" color="text-white"/> : <GenerateIcon className="w-4 h-4" />} BG
            </button>
            <button onClick={handleUploadClick} disabled={isUploading} className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 transition-colors">
                <UploadIcon className="w-4 h-4" /> BG
            </button>
            <button 
              onClick={() => onEdit(article.id)} 
              disabled={isUploading}
              className={`flex items-center justify-center gap-1 p-1.5 rounded-lg text-white transition-colors disabled:opacity-50 ${isEditing ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-600 hover:bg-gray-700'}`}
            >
                <EditIcon className="w-4 h-4" /> {isEditing ? 'Editing' : 'Edit'}
            </button>
            <button 
                onClick={() => onDownload(article)}
                disabled={downloadButtonDisabled || isUploading} 
                className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors">
                <DownloadIcon className="w-4 h-4" /> Download
            </button>
            <button 
                onClick={() => onUploadPost(article.id)}
                disabled={postButtonDisabled}
                className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 transition-colors col-span-2"
            >
                {isUploading ? <Spinner size="sm" color="text-white"/> : <UploadIcon className="w-4 h-4" />} {isUploading ? 'Posting...' : 'Post to FB'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
