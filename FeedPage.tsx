import React, { useState, useEffect, useCallback, useRef, ChangeEvent, FormEvent } from 'react';
import { useAuth } from './src/contexts/AuthContext.tsx';
import { useNotification } from './src/contexts/NotificationContext.tsx';
import { FeedPost } from './types.ts';
import Spinner from './components/Spinner.tsx';
import { ThumbsUpIcon, ChatBubbleIcon, TrashIcon } from './components/IconComponents.tsx';
import UserAvatar from './components/UserAvatar.tsx';

// FIX: Replaced `declare var firebase: any` with a more specific declaration to resolve namespace errors.
// Declare firebase global to avoid TypeScript errors, as it's loaded via script tag
declare namespace firebase {
    // Basic user properties used in the app
    interface User {
        uid: string;
        displayName: string | null;
        photoURL: string | null;
    }

    interface DatabaseReference {
        remove(): Promise<void>;
        set(value: any): Promise<void>;
        push(value: any): Promise<DatabaseReference>;
        on(eventType: 'value', callback: (snapshot: any) => any, cancelCallbackOrContext?: object | null, context?: object | null): (a: any | null, b?: string) => any;
        off(eventType: 'value', callback?: (snapshot: any) => any): void;
        orderByChild(path: string): DatabaseReference;
        limitToLast(limit: number): DatabaseReference;
    }

    interface Database {
        ref(path: string): DatabaseReference;
    }
    
    interface UploadTaskSnapshot {
        ref: StorageReference;
    }

    interface StorageReference {
        child(path: string): StorageReference;
        put(data: Blob | Uint8Array | ArrayBuffer | File, metadata?: object): Promise<UploadTaskSnapshot>;
        getDownloadURL(): Promise<string>;
    }
    
    interface Storage {
        ref(path?: string): StorageReference;
    }

    function database(): Database;
    function storage(): Storage;

    namespace database {
        const ServerValue: {
            TIMESTAMP: object;
        };
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
    const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'audio') => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        if (previewUrl) URL.revokeObjectURL(previewUrl);

        if (type === 'image' || type === 'video') {
            setPreviewUrl(URL.createObjectURL(selectedFile));
        } else {
            setPreviewUrl(null);
        }
        setMediaType(type);
    };

    const handleRecord = async () => {
        if (isRecording) { // Stop recording
            mediaRecorderRef.current?.stop();
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setIsRecording(false);
        } else { // Start recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                const audioChunks: Blob[] = [];
                mediaRecorderRef.current.ondataavailable = e => audioChunks.push(e.data);
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    setFile(new File([audioBlob], `recording-${Date.now()}.webm`, { type: audioBlob.type }));
                    setMediaType('audio');
                    setPreviewUrl(null); 
                    stream.getTracks().forEach(track => track.stop()); // Release microphone
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
                setRecordingTime(0);
                recordingIntervalRef.current = window.setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
            } catch (err) {
                addNotification('Microphone access denied or not found.', 'error');
                console.error("Microphone access error:", err);
            }
        }
    };
    
    const handleSubmit = async () => {
        if (!caption.trim() && !file) return;
        setIsSubmitting(true);
        try {
            const post: Omit<FeedPost, 'id'> = {
                uid: user!.uid,
                authorName: user!.displayName || 'Anonymous',
                authorPhotoURL: user!.photoURL || '',
                caption: caption.trim(),
                // FIX: Cast ServerValue.TIMESTAMP to 'any' to satisfy the FeedPost['timestamp'] type of 'number'. Firebase correctly interprets this server-side placeholder.
                timestamp: firebase.database.ServerValue.TIMESTAMP as any,
                likes: {}
            };

            if (file) {
                const storageRef = firebase.storage().ref();
                const fileRef = storageRef.child(`feed_media/${user!.uid}/${Date.now()}_${file.name}`);
                const snapshot = await fileRef.put(file);
                post.mediaUrl = await snapshot.ref.getDownloadURL();
                post.mediaType = mediaType!;
            }
            
            await firebase.database().ref('feed_posts').push(post);
            addNotification('Post created successfully!', 'success');
            onPostCreated();
            // Reset form
            setCaption(''); setFile(null); setPreviewUrl(null); setMediaType(null);
        } catch (err: any) {
            addNotification(`Failed to create post: ${err.message}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border dark:border-gray-700">
            <div className="flex gap-4">
                <UserAvatar name={user?.displayName || null} photoURL={user?.photoURL} />
                <textarea 
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder={`What's on your mind, ${user?.displayName || 'User'}?`} 
                    className="w-full bg-gray-100 dark:bg-gray-700 rounded-lg p-3 border-transparent focus:ring-2 focus:ring-primary"
                    rows={2}
                />
            </div>
            {previewUrl && mediaType !== 'audio' && (
                <div className="mt-4 relative max-h-96">
                    {mediaType === 'image' && <img src={previewUrl} className="max-h-96 rounded-lg mx-auto" alt="Preview" />}
                    {mediaType === 'video' && <video src={previewUrl} className="max-h-96 rounded-lg mx-auto" controls />}
                    <button onClick={() => { setFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full">&times;</button>
                </div>
            )}
            {file && mediaType === 'audio' && (
                 <div className="mt-4 text-sm text-gray-500">Audio file selected: {file.name}</div>
            )}
            <div className="mt-3 pt-3 border-t dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e, e.target.files?.[0]?.type.startsWith('video') ? 'video' : 'image')} accept="image/*,video/*" className="hidden" />
                    <input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept="audio/*" className="hidden" />

                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">📷 Image/Video</button>
                    <button onClick={() => audioInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">🎵 Audio</button>
                    <button onClick={handleRecord} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 ${isRecording ? 'text-red-500' : ''}`}>
                        🎤 {isRecording ? `Stop (${Math.floor(recordingTime / 60)}:${(recordingTime % 60).toString().padStart(2, '0')})` : 'Record Voice'}
                    </button>
                </div>
                <button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 bg-primary text-primary-text font-bold rounded-full disabled:opacity-50">
                    {isSubmitting ? <Spinner size="sm" /> : 'Post'}
                </button>
            </div>
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
        if (window.confirm('Are you sure you want to delete this comment?')) {
            firebase.database().ref(`feed_posts/${post.id}/comments/${commentId}`).remove();
        }
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
        if (window.confirm('Are you sure you want to delete this post?')) {
            firebase.database().ref(`feed_posts/${postId}`).remove()
                .then(() => {
                    addNotification('Post deleted.', 'success');
                    // The Firebase on('value') listener will automatically update the UI.
                })
                .catch((err: any) => addNotification(`Error deleting post: ${err.message}`, 'error'));
        }
    }, [addNotification]);

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