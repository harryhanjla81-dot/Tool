import React, { useEffect, useState, useCallback, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuth } from './src/contexts/AuthContext.tsx';
import { FeedPost } from './types.ts';
import Spinner from './components/Spinner.tsx';
import UserAvatar from './components/UserAvatar.tsx';
import { ThumbsUpIcon, ChatBubbleIcon, ShareIcon, AddImageIcon, CloseIcon, TrashIcon } from './components/IconComponents.tsx';
import { useNotification } from './src/contexts/NotificationContext.tsx';
import { useAuthPrompt } from './src/contexts/AuthPromptContext.tsx';
import { supabase } from './src/supabaseClient.ts';
import { useLocation } from 'react-router-dom';
import { useConfirmation } from './src/contexts/ConfirmationContext.tsx';

// Local, self-contained Firebase type declaration to ensure stability.
declare namespace firebase {
    // User & Auth
    interface User {
        uid: string;
        displayName: string | null;
        email: string | null;
        phoneNumber: string | null;
        photoURL: string | null;
        updateProfile(profile: { displayName?: string | null; photoURL?: string | null; }): Promise<void>;
    }
    interface UserCredential {
        user: User;
        additionalUserInfo?: { isNewUser: boolean; };
    }
    interface Auth {
        onAuthStateChanged(callback: (user: User | null) => void): () => void;
        signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
        createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
        signOut(): Promise<void>;
        currentUser: User | null;
        signInWithPopup(provider: any): Promise<UserCredential>;
    }
    
    // Storage
    interface UploadTaskSnapshot { ref: StorageReference; }
    interface StorageReference {
        child(path: string): StorageReference;
        put(data: Blob | Uint8Array | ArrayBuffer | File, metadata?: object): Promise<UploadTaskSnapshot>;
        getDownloadURL(): Promise<string>;
    }
    interface Storage { ref(path?: string): StorageReference; }

    // Database
    interface DatabaseReference {
        remove(): Promise<void>;
        set(value: any): Promise<void>;
        push(value: any): Promise<DatabaseReference>;
        on(eventType: string, callback: (snapshot: any) => any, cancelCallback?: (error: Error) => any, context?: object | null): (snapshot: any) => any;
        off(eventType: string, callback?: (snapshot: any) => any): void;
        once(eventType: string): Promise<any>;
        orderByChild(path: string): DatabaseReference;
        limitToLast(limit: number): DatabaseReference;
        onDisconnect(): { 
            remove(): Promise<void>; 
            set(value: any): Promise<void>; 
        };
        numChildren(): number;
    }
    interface Database { ref(path: string): DatabaseReference; }
    
    // Top Level
    interface App {}
    const apps: App[];
    function initializeApp(config: object): App;
    function auth(): Auth;
    function database(): Database;
    function storage(): Storage;
    namespace database {
        const ServerValue: { TIMESTAMP: object; };
    }
}

const timeAgo = (timestamp: number) => {
  const now = Date.now();
  const seconds = Math.floor((now - timestamp) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) {
    const years = Math.floor(interval);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    const months = Math.floor(interval);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    const days = Math.floor(interval);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    const hours = Math.floor(interval);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    const minutes = Math.floor(interval);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return Math.floor(seconds) + " seconds ago";
};

const CommentInput: React.FC<{ postId: string; onComment: (postId: string, text: string) => void; currentUser: firebase.User | null }> = ({ postId, onComment, currentUser }) => {
    const [text, setText] = useState('');
    const { openAuthPrompt } = useAuthPrompt();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const handleCommentSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        if (!currentUser) {
            openAuthPrompt();
            return;
        }
        onComment(postId, text);
        setText('');
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [text]);

    return (
        <form onSubmit={handleCommentSubmit} className="flex items-start gap-3 mt-4">
            <UserAvatar name={currentUser?.displayName} photoURL={currentUser?.photoURL} className="w-8 h-8" />
            <div className="flex-grow flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2 transition-all focus-within:ring-2 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 focus-within:ring-primary">
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onFocus={() => { if (!currentUser) openAuthPrompt(); }}
                    placeholder="Write a comment..."
                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none overflow-y-hidden p-0 leading-tight"
                    style={{ outline: 'none', boxShadow: 'none' }}
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCommentSubmit(e);
                        }
                    }}
                />
                <button 
                    type="submit" 
                    disabled={!text.trim()} 
                    className={`flex-shrink-0 px-4 py-1.5 text-sm rounded-full font-semibold transition-colors ${!text.trim() ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' : 'bg-primary text-primary-text'}`}
                >
                    Post
                </button>
            </div>
        </form>
    );
};

const CommentItem: React.FC<{ comment: any; commentId: string; postId: string; postAuthorId: string; onDeleteComment: (postId: string, commentId: string) => void; currentUser: firebase.User | null; }> = ({ comment, commentId, postId, postAuthorId, onDeleteComment, currentUser }) => {
    const isCommentOwner = currentUser && currentUser.uid === comment.uid;
    const isPostOwner = currentUser && currentUser.uid === postAuthorId;
    const canDelete = isCommentOwner || isPostOwner;

    return (
        <div className="flex items-start gap-3 group">
            <UserAvatar name={comment.authorName} photoURL={comment.authorPhotoURL} className="w-8 h-8" />
            <div className="flex-grow">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3">
                    <div className="flex justify-between items-start">
                        <p className="font-bold text-sm">{comment.authorName}</p>
                        <div className="flex items-center gap-2">
                             <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(comment.timestamp)}</p>
                             {canDelete && (
                                <button onClick={() => onDeleteComment(postId, commentId)} className="opacity-50 hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity">
                                    <TrashIcon className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.text}</p>
                </div>
            </div>
        </div>
    );
};

const PostCard: React.FC<{ post: FeedPost; onLike: (postId: string) => void; onShare: (post: FeedPost) => void; onDelete: (postId: string) => void; onComment: (postId: string, text: string) => void; onDeleteComment: (postId: string, commentId: string) => void; currentUser: firebase.User | null; }> = ({ post, onLike, onShare, onDelete, onComment, onDeleteComment, currentUser }) => {
    const { openAuthPrompt } = useAuthPrompt();
    const [showComments, setShowComments] = useState(false);
    const isLiked = !!(currentUser && post.likes && post.likes[currentUser.uid]);
    const likeCount = Object.keys(post.likes || {}).length;
    const commentCount = Object.keys(post.comments || {}).length;
    
    const handleAction = (action: () => void) => {
        if (!currentUser) {
            openAuthPrompt();
        } else {
            action();
        }
    };
    
    const isOwner = currentUser && currentUser.uid === post.uid;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700/50 overflow-hidden relative">
            <div className="p-4 flex items-center gap-3">
                <UserAvatar name={post.authorName} photoURL={post.authorPhotoURL} />
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{post.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.timestamp)}</p>
                </div>
            </div>
            
            {isOwner && (
                 <button onClick={() => handleAction(() => onDelete(post.id))} className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                </button>
            )}

            {post.caption && <p className="px-4 pb-4 whitespace-pre-wrap break-words">{post.caption}</p>}
            
            {post.mediaUrl && (
                <div className="bg-gray-100 dark:bg-black">
                    {post.mediaType === 'image' && <img src={post.mediaUrl} alt="Post media" className="w-full h-auto max-h-[70vh] object-contain" />}
                    {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full h-auto max-h-[70vh]"></video>}
                </div>
            )}

            <div className="p-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                {likeCount > 0 && <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>}
                {commentCount > 0 && <span className="cursor-pointer hover:underline" onClick={() => handleAction(() => setShowComments(s => !s))}>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>}
            </div>

            <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => handleAction(() => onLike(post.id))}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors font-semibold ${isLiked ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    <ThumbsUpIcon className="w-5 h-5" /> Like
                </button>
                 <button 
                    onClick={() => handleAction(() => setShowComments(s => !s))}
                    className="flex-1 flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors font-semibold"
                 >
                    <ChatBubbleIcon className="w-5 h-5" /> Comment
                </button>
                 <button 
                    onClick={() => onShare(post)}
                    className="flex-1 flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors font-semibold"
                 >
                    <ShareIcon className="w-5 h-5" /> Share
                </button>
            </div>
            
            {showComments && (
                <div className="p-4 border-t dark:border-gray-700/50">
                    <div className="mt-4 space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                        {post.comments && Object.keys(post.comments).length > 0 ? (
                            // FIX: Explicitly type the sort parameters to resolve 'unknown' type error.
                            Object.entries(post.comments).sort(([, a]: [string, any], [, b]: [string, any]) => a.timestamp - b.timestamp).map(([commentId, comment]) => (
                                <CommentItem 
                                    key={commentId} 
                                    comment={comment}
                                    commentId={commentId}
                                    postId={post.id}
                                    postAuthorId={post.uid}
                                    onDeleteComment={onDeleteComment}
                                    currentUser={currentUser}
                                />
                            ))
                        ) : (
                            <p className="text-sm text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
                        )}
                    </div>
                     <CommentInput postId={post.id} onComment={onComment} currentUser={currentUser} />
                </div>
            )}
        </div>
    );
};

const CreatePost: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [caption, setCaption] = useState('');
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [isPosting, setIsPosting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMediaFile(file);
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handlePost = async () => {
        if (!user || (!caption.trim() && !mediaFile)) return;
        setIsPosting(true);
        try {
            const postData: any = {
                uid: user.uid,
                authorName: user.displayName || 'Anonymous',
                authorPhotoURL: user.photoURL || null,
                caption: caption.trim(),
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                likes: {},
            };

            if (mediaFile) {
                const fileExt = mediaFile.name.split('.').pop()?.toLowerCase();
                const filePath = `feed-media/${user.uid}/${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from('feed-media')
                    .upload(filePath, mediaFile);

                if (uploadError) throw new Error(`Supabase upload error: ${uploadError.message}`);

                const { data } = supabase.storage.from('feed-media').getPublicUrl(filePath);
                
                if (data.publicUrl) {
                    postData.mediaUrl = data.publicUrl;

                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt || '')) {
                        postData.mediaType = 'image';
                    } else if (['mp4', 'webm', 'mov'].includes(fileExt || '')) {
                        postData.mediaType = 'video';
                    }
                }
            }

            await firebase.database().ref('feed_posts').push(postData);

            setCaption('');
            setMediaFile(null);
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            setMediaPreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (textareaRef.current) textareaRef.current.style.height = 'auto';

            addNotification('Post created successfully!', 'success');

        } catch (err: any) {
            addNotification(`Failed to create post: ${err.message}`, 'error');
        } finally {
            setIsPosting(false);
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [caption]);


    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 border dark:border-gray-700/50">
            <div className="flex items-start gap-3">
                <UserAvatar name={user?.displayName} photoURL={user?.photoURL} />
                <div 
                    className={`relative flex-grow border rounded-full transition-all duration-300 ease-in-out ${isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-gray-300 dark:border-gray-600'} ${caption.split('\n').length > 1 || mediaPreview ? '!rounded-2xl' : ''}`}
                >
                    <textarea
                        ref={textareaRef}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={`What's on your mind, ${user?.displayName?.split(' ')[0] || 'User'}?`}
                        className="w-full bg-transparent p-3 pl-4 pr-12 focus:outline-none resize-none overflow-hidden"
                        rows={1}
                        style={{ outline: 'none !important', boxShadow: 'none !important' }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-3">
                         <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-primary rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                           <AddImageIcon className="w-6 h-6" />
                         </button>
                    </div>
                </div>
            </div>
            {mediaPreview && (
                <div className="mt-4 pl-12 relative">
                    <img src={mediaPreview} alt="Preview" className="rounded-lg max-h-80 w-auto" />
                     <button onClick={() => { setMediaFile(null); if (mediaPreview) URL.revokeObjectURL(mediaPreview); setMediaPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full">
                        <CloseIcon className="w-4 h-4" />
                    </button>
                </div>
            )}
            {(caption || mediaFile) && (
                <div className="flex justify-end mt-4">
                    <button onClick={handlePost} disabled={isPosting} className="px-6 py-2 bg-primary text-primary-text font-semibold rounded-full disabled:opacity-50">
                        {isPosting ? <Spinner size="sm" /> : 'Post'}
                    </button>
                </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
        </div>
    );
};

const FeedPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { openAuthPrompt } = useAuthPrompt();
    const { addNotification } = useNotification();
    const { confirmAction } = useConfirmation();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const promptIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (authLoading) return; // Wait until auth state is resolved

        const db = firebase.database();
        const feedRef = db.ref('feed_posts').orderByChild('timestamp');

        const listener = feedRef.on('value', snapshot => {
            const feedData = snapshot.val();
            if (feedData) {
                const postsArray: FeedPost[] = Object.entries(feedData)
                    .map(([key, value]: [string, any]) => ({
                        id: key,
                        ...value,
                        likes: value.likes || {}
                    }))
                    // FIX: Explicitly type the sort parameters to resolve 'unknown' type error.
                    .sort((a: FeedPost, b: FeedPost) => b.timestamp - a.timestamp);
                setPosts(postsArray);
            } else {
                setPosts([]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Firebase Read Error:", error);
            addNotification(`Error fetching feed: ${error.message}`, 'error');
            setLoading(false);
        });

        return () => feedRef.off('value', listener);
    }, [addNotification, authLoading]);

    useEffect(() => {
        if (authLoading) return;
        
        const params = new URLSearchParams(location.search);
        const sharedPostId = params.get('post');
        if (sharedPostId && !user) {
            // Clear any existing interval before setting a new one
            if (promptIntervalRef.current) {
                clearInterval(promptIntervalRef.current);
            }
            openAuthPrompt(); // Open immediately
            promptIntervalRef.current = window.setInterval(() => {
                openAuthPrompt();
            }, 20000);
        }

        // Cleanup interval if user logs in or navigates away
        return () => {
            if (promptIntervalRef.current) {
                clearInterval(promptIntervalRef.current);
            }
        };
    }, [location.search, user, openAuthPrompt, authLoading]);
    
    // Clear interval if user logs in
    useEffect(() => {
        if (user && promptIntervalRef.current) {
            clearInterval(promptIntervalRef.current);
        }
    }, [user]);

    const handleLike = useCallback((postId: string) => {
        if (!user) {
            openAuthPrompt();
            return;
        }
        const postRef = firebase.database().ref(`feed_posts/${postId}/likes/${user.uid}`);
        postRef.once('value').then(snapshot => {
            if (snapshot.exists()) {
                postRef.remove();
            } else {
                postRef.set(true);
            }
        });
    }, [user, openAuthPrompt]);

    const handleComment = useCallback((postId: string, text: string) => {
        if (!user) return;
        const commentData = {
            uid: user.uid,
            authorName: user.displayName || 'Anonymous',
            authorPhotoURL: user.photoURL || null,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
        };
        firebase.database().ref(`feed_posts/${postId}/comments`).push(commentData);
    }, [user]);
    
    const handleDeleteComment = useCallback((postId: string, commentId: string) => {
        if (!user) {
            openAuthPrompt();
            return;
        }
        const commentRef = firebase.database().ref(`feed_posts/${postId}/comments/${commentId}`);
        const postRef = firebase.database().ref(`feed_posts/${postId}`);

        Promise.all([commentRef.once('value'), postRef.once('value')]).then(([commentSnapshot, postSnapshot]) => {
            const comment = commentSnapshot.val();
            const post = postSnapshot.val();
            if (comment && post) {
                const isCommentOwner = comment.uid === user.uid;
                const isPostOwner = post.uid === user.uid;

                if (isCommentOwner || isPostOwner) {
                    confirmAction({
                        title: 'Delete Comment?',
                        message: 'Are you sure you want to permanently delete this comment?',
                        confirmText: 'Delete',
                        icon: <TrashIcon className="w-6 h-6 text-red-500" />,
                        onConfirm: () => {
                            commentRef.remove()
                                .then(() => addNotification('Comment deleted.', 'success'))
                                .catch(err => addNotification(`Error: ${err.message}`, 'error'));
                        }
                    });
                } else {
                    addNotification("You don't have permission to delete this comment.", 'error');
                }
            }
        }).catch(err => {
            addNotification(`Could not verify permissions: ${err.message}`, 'error');
        });
    }, [user, openAuthPrompt, addNotification, confirmAction]);

    const handleDelete = useCallback((postId: string) => {
        if (!user) {
            openAuthPrompt();
            return;
        }
        
        const postRef = firebase.database().ref(`feed_posts/${postId}`);
        postRef.once('value').then(snapshot => {
            const post = snapshot.val();
            if (post && post.uid === user.uid) {
                confirmAction({
                    title: 'Delete Post?',
                    message: 'Are you sure you want to permanently delete this post and all its comments?',
                    confirmText: 'Delete Post',
                    icon: <TrashIcon className="w-6 h-6 text-red-500" />,
                    onConfirm: () => {
                        postRef.remove()
                            .then(() => addNotification('Post deleted.', 'success'))
                            .catch(err => addNotification(`Error deleting post: ${err.message}`, 'error'));
                    }
                });
            }
        });
    }, [user, openAuthPrompt, addNotification, confirmAction]);


    const handleShare = useCallback(async (post: FeedPost) => {
        const shareUrl = `https://hanjla.vercel.app/#/feed?post=${post.id}`;
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Check out this post!',
                    text: post.caption ? post.caption.substring(0, 100) + '...' : 'From Hanjla Harry',
                    url: shareUrl,
                });
            } catch (error) {
                console.log('Share was cancelled or failed', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareUrl);
                addNotification('Post link copied to clipboard!', 'success');
            } catch (err) {
                console.error('Failed to copy link: ', err);
                addNotification('Could not copy link to clipboard.', 'error');
            }
        }
    }, [addNotification]);


    if (authLoading || loading) {
        return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            {user && <CreatePost />}
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} onShare={handleShare} onDelete={handleDelete} onComment={handleComment} onDeleteComment={handleDeleteComment} currentUser={user} />)
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">The feed is empty.</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Be the first to create a post!</p>
                </div>
            )}
        </div>
    );
};

export default FeedPage;