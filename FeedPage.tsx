import React, { useState, useEffect, useCallback, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuth } from './src/contexts/AuthContext.tsx';
import { useNotification } from './src/contexts/NotificationContext.tsx';
import { useConfirmation } from './src/contexts/ConfirmationContext.tsx';
import { FeedPost } from './types.ts';
import Spinner from './components/Spinner.tsx';
import { ThumbsUpIcon, ChatBubbleIcon, TrashIcon, AddImageIcon } from './components/IconComponents.tsx';
import UserAvatar from './components/UserAvatar.tsx';
import { supabase } from './src/supabaseClient.ts';

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
        on(eventType: string, callback: (snapshot: any) => any, cancelCallbackOrContext?: object | null, context?: object | null): (a: any | null, b?: string) => any;
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


// --- HELPER & UTILITY COMPONENTS ---

const formatTimeAgo = (timestamp: number): string => {
    if (!timestamp) return '...';
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
};

const AudioPlayer: React.FC<{ src: string }> = ({ src }) => {
    return (
        <audio controls src={src} className="w-full h-12 my-2">
            Your browser does not support the audio element.
        </audio>
    );
};


// --- POST CREATION COMPONENT ---

const CreatePost: React.FC<{ onPostCreated: () => void }> = ({ onPostCreated }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [caption, setCaption] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        const type = selectedFile.type.startsWith('video') ? 'video' : 'image';

        setFile(selectedFile);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        setPreviewUrl(URL.createObjectURL(selectedFile));
        setMediaType(type);
    };

    const handleSubmit = async () => {
        if (!caption.trim() && !file) {
            addNotification('Please add a caption or a file to post.', 'info');
            return;
        }
        setIsSubmitting(true);

        try {
            let mediaUrl: string | undefined;
            let finalMediaType: 'image' | 'video' | 'audio' | undefined;

            if (file && mediaType) {
                const filePath = `feed-media/${user!.uid}/${Date.now()}_${file.name}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('feed-media')
                    .upload(filePath, file, {
                        cacheControl: '3600',
                        upsert: false,
                    });
                
                if (uploadError) {
                    throw new Error(`Supabase upload error: ${uploadError.message}`);
                }

                const { data } = supabase.storage
                    .from('feed-media')
                    .getPublicUrl(filePath);
                
                if (!data.publicUrl) {
                    throw new Error('Could not get public URL for the uploaded file.');
                }
                
                mediaUrl = data.publicUrl;
                finalMediaType = mediaType;
            }

            const postData: Omit<FeedPost, 'id'> = {
                uid: user!.uid,
                authorName: user!.displayName || 'Anonymous',
                authorPhotoURL: user!.photoURL || '',
                caption: caption.trim(),
                timestamp: firebase.database.ServerValue.TIMESTAMP as any,
                likes: {},
                ...(mediaUrl && { mediaUrl }),
                ...(finalMediaType && { mediaType: finalMediaType as 'image' | 'video' | 'audio' }),
            };
            
            await firebase.database().ref('feed_posts').push(postData);

            addNotification('Post created successfully!', 'success');
            onPostCreated();
            
            setCaption(''); 
            setFile(null); 
            setPreviewUrl(null); 
            setMediaType(null);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                if(textareaRef.current.parentElement) {
                    textareaRef.current.parentElement.style.borderRadius = '9999px';
                }
            }


        } catch (err: any) {
            addNotification(`Failed to create post: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 border dark:border-gray-700">
            <div className="flex items-start gap-3">
                <UserAvatar name={user?.displayName || null} photoURL={user?.photoURL} />
                <div className="relative flex-grow bg-gray-100 dark:bg-gray-700/50 rounded-full border border-gray-200 dark:border-gray-700 transition-all duration-300 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                    <textarea 
                        ref={textareaRef}
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder={`What's on your mind, ${user?.displayName || 'User'}?`} 
                        className="w-full bg-transparent p-3 pl-4 pr-12 border-none focus:ring-0 resize-none transition-all duration-200"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            const newHeight = target.scrollHeight;
                            target.style.height = `${Math.min(newHeight, 200)}px`; // Cap max height

                            const parent = target.parentElement;
                            if (parent) {
                                if (newHeight > 50) { // Threshold for multi-line
                                    parent.style.borderRadius = '24px';
                                } else {
                                    parent.style.borderRadius = '9999px';
                                }
                            }
                        }}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-light transition-colors rounded-full"
                        title="Add Image or Video"
                    >
                      <AddImageIcon className="w-6 h-6"/>
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                </div>
            </div>
            
            {previewUrl && mediaType && (
                <div className="mt-4 relative max-h-96">
                    {mediaType === 'image' && <img src={previewUrl} className="max-h-96 rounded-lg mx-auto" alt="Preview" />}
                    {mediaType === 'video' && <video src={previewUrl} className="max-h-96 rounded-lg mx-auto" controls />}
                    <button onClick={() => { setFile(null); setPreviewUrl(null); setMediaType(null); }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full leading-none w-6 h-6 flex items-center justify-center">&times;</button>
                </div>
            )}
            
            {(caption.trim() || file) && (
                 <div className="mt-3 pt-3 border-t dark:border-gray-700 flex justify-end">
                    <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-2 bg-primary text-primary-text font-bold rounded-full disabled:opacity-50 transition-transform hover:scale-105">
                        {isSubmitting ? <Spinner size="sm" /> : 'Post'}
                    </button>
                </div>
            )}
        </div>
    );
};


// --- POST CARD COMPONENT ---

interface PostCardProps {
    post: FeedPost;
    currentUserId: string;
    currentUser: firebase.User | null;
    onDeletePost: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, currentUser, onDeletePost }) => {
    const { addNotification } = useNotification();
    const { confirmAction } = useConfirmation();
    const hasLiked = post.likes && post.likes[currentUserId];
    const [commentsVisible, setCommentsVisible] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const handleLike = () => {
        const postLikesRef = firebase.database().ref(`feed_posts/${post.id}/likes/${currentUserId}`);
        if (hasLiked) {
            postLikesRef.remove();
        } else {
            postLikesRef.set(true);
        }
    };
    
    const handlePostComment = async (e: FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        setIsSubmittingComment(true);
        const commentData = {
            uid: currentUser.uid,
            authorName: currentUser.displayName || 'Anonymous',
            authorPhotoURL: currentUser.photoURL || '',
            text: newComment.trim(),
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };

        try {
            await firebase.database().ref(`feed_posts/${post.id}/comments`).push(commentData);
            setNewComment('');
        } catch (err: any) {
            addNotification(`Failed to post comment: ${err.message}`, 'error');
        } finally {
            setIsSubmittingComment(false);
        }
    };
    
    const handleDeleteComment = (commentId: string) => {
        confirmAction({
            title: 'Delete Comment?',
            message: 'Are you sure you want to permanently delete this comment?',
            confirmText: 'Delete',
            onConfirm: () => {
                firebase.database().ref(`feed_posts/${post.id}/comments/${commentId}`).remove();
            },
        });
    };
    
    // FIX: Defensively handle potentially malformed comment data from Firebase.
    const commentsArray = Object.entries(post.comments || {})
        .filter(([, comment]) => typeof comment === 'object' && comment !== null)
        .map(([id, comment]) => ({ ...(comment as any), id }))
        .sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center gap-3">
                <UserAvatar name={post.authorName} photoURL={post.authorPhotoURL} />
                <div className="flex-grow">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{post.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(post.timestamp)}</p>
                </div>
                {post.uid === currentUserId && (
                    <button onClick={() => onDeletePost(post.id)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
            {/* Body */}
            <p className="my-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.caption}</p>
            {post.mediaUrl && (
                <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 flex justify-center">
                    {post.mediaType === 'image' && <img src={post.mediaUrl} alt="Post content" className="w-full max-h-[60vh] object-contain"/>}
                    {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full" />}
                    {post.mediaType === 'audio' && <AudioPlayer src={post.mediaUrl} />}
                </div>
            )}
            {/* Footer */}
            <div className="mt-4 pt-3 border-t dark:border-gray-700 flex justify-around">
                <button onClick={handleLike} className={`flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full justify-center ${hasLiked ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
                    <ThumbsUpIcon className="w-5 h-5" /> Like ({Object.keys(post.likes || {}).length})
                </button>
                <button onClick={() => setCommentsVisible(prev => !prev)} className="flex items-center gap-2 text-sm font-semibold rounded-lg px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full justify-center text-gray-600 dark:text-gray-300">
                    <ChatBubbleIcon className="w-5 h-5" /> Comment ({commentsArray.length})
                </button>
            </div>
            {/* Comments Section */}
            {commentsVisible && (
                <div className="mt-4 pt-3 border-t dark:border-gray-700 space-y-4">
                    {/* List existing comments */}
                    <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin pr-2">
                        {commentsArray.length > 0 ? commentsArray.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2 group">
                                <UserAvatar name={comment.authorName} photoURL={comment.authorPhotoURL} />
                                <div className="flex-grow bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-sm">{comment.authorName}</span>
                                        <span className="text-xs text-gray-500">{formatTimeAgo(comment.timestamp)}</span>
                                    </div>
                                    <p className="text-sm mt-1">{comment.text}</p>
                                </div>
                                {comment.uid === currentUserId && (
                                     <button onClick={() => handleDeleteComment(comment.id)} className="p-1 rounded-full text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-500">
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        )) : <p className="text-sm text-center text-gray-500">No comments yet.</p>}
                    </div>

                    {/* New comment form */}
                    <form onSubmit={handlePostComment} className="flex items-start gap-2 pt-3 border-t dark:border-gray-600">
                         <UserAvatar name={currentUser?.displayName || null} photoURL={currentUser?.photoURL} />
                         <div className="flex-grow">
                             <input 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="w-full bg-gray-100 dark:bg-gray-700 rounded-full py-2 px-4 border-transparent focus:ring-2 focus:ring-primary text-sm"
                            />
                         </div>
                        <button type="submit" disabled={isSubmittingComment} className="px-4 py-2 bg-primary text-primary-text font-semibold rounded-full disabled:opacity-50 text-sm">
                            {isSubmittingComment ? <Spinner size="sm" /> : 'Post'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};


// --- MAIN FEED PAGE ---

const FeedPage: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const { confirmAction } = useConfirmation();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPosts = useCallback(() => {
        setIsLoading(true);
        const postsRef = firebase.database().ref('feed_posts').orderByChild('timestamp').limitToLast(100);
        
        const listener = postsRef.on('value', (snapshot: any) => {
            const postsData: FeedPost[] = [];
            snapshot.forEach((childSnapshot: any) => {
                postsData.push({ id: childSnapshot.key, ...childSnapshot.val() });
            });
            setPosts(postsData.reverse()); // Newest first
            setIsLoading(false);
        }, (error: any) => {
            console.error(error);
            setIsLoading(false);
        });

        // Cleanup listener on unmount
        return () => postsRef.off('value', listener);
    }, []);
    
    useEffect(() => {
        const cleanup = fetchPosts();
        return cleanup;
    }, [fetchPosts]);

    const handleDeletePost = useCallback((postId: string) => {
        confirmAction({
            title: 'Delete Post?',
            message: 'Are you sure you want to permanently delete this post and all its comments?',
            confirmText: 'Delete Post',
            icon: <TrashIcon className="w-6 h-6 text-red-500" />,
            onConfirm: () => {
                firebase.database().ref(`feed_posts/${postId}`).remove()
                    .then(() => {
                        addNotification('Post deleted.', 'success');
                    })
                    .catch((err: any) => addNotification(`Error deleting post: ${err.message}`, 'error'));
            },
        });
    }, [addNotification, confirmAction]);

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-8">
            <CreatePost onPostCreated={() => {}} />
            {isLoading && (
                <div className="flex justify-center py-12"><Spinner size="lg"/></div>
            )}
            {!isLoading && posts.length === 0 && (
                 <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Welcome to the Feed!</h2>
                    <p className="mt-1 text-sm text-gray-500">Be the first one to post something.</p>
                </div>
            )}
            {!isLoading && posts.map(post => (
                <PostCard key={post.id} post={post} currentUserId={user!.uid} currentUser={user} onDeletePost={handleDeletePost} />
            ))}
        </div>
    );
};

export default FeedPage;
