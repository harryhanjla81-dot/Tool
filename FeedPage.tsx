import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './src/contexts/AuthContext.tsx';
import { FeedPost } from './types.ts';
import Spinner from './components/Spinner.tsx';
import UserAvatar from './components/UserAvatar.tsx';
import { ThumbsUpIcon, ChatBubbleIcon, ShareIcon } from './components/IconComponents.tsx';
import { useNotification } from './src/contexts/NotificationContext.tsx';
import { useAuthPrompt } from './src/contexts/AuthPromptContext.tsx';

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
        // FIX: Added ((error: Error) => void) to the type of cancelCallbackOrContext to allow for a failure callback.
        on(eventType: string, callback: (snapshot: any) => any, cancelCallbackOrContext?: ((error: Error) => void) | object | null, context?: object | null): (a: any | null, b?: string) => any;
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

const PostCard: React.FC<{ post: FeedPost; onLike: (postId: string) => void; currentUser: firebase.User | null; }> = ({ post, onLike, currentUser }) => {
    const isLiked = !!(currentUser && post.likes && post.likes[currentUser.uid]);
    const likeCount = Object.keys(post.likes || {}).length;
    const commentCount = Object.keys(post.comments || {}).length;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border dark:border-gray-700/50 overflow-hidden">
            <div className="p-4 flex items-center gap-3">
                <UserAvatar name={post.authorName} photoURL={post.authorPhotoURL} />
                <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{post.authorName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{timeAgo(post.timestamp)}</p>
                </div>
            </div>
            
            {post.caption && <p className="px-4 pb-4 whitespace-pre-wrap break-words">{post.caption}</p>}
            
            {post.mediaUrl && (
                <div className="bg-gray-100 dark:bg-black">
                    {post.mediaType === 'image' && <img src={post.mediaUrl} alt="Post media" className="w-full h-auto max-h-[70vh] object-contain" />}
                    {post.mediaType === 'video' && <video src={post.mediaUrl} controls className="w-full h-auto max-h-[70vh]"></video>}
                </div>
            )}

            <div className="p-2 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                {likeCount > 0 && <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>}
                {commentCount > 0 && <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>}
            </div>

            <div className="flex border-t border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => onLike(post.id)}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors font-semibold ${isLiked ? 'text-primary' : 'text-gray-600 dark:text-gray-300'}`}
                >
                    <ThumbsUpIcon className="w-5 h-5" /> Like
                </button>
                 <button className="flex-1 flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors font-semibold">
                    <ChatBubbleIcon className="w-5 h-5" /> Comment
                </button>
                 <button className="flex-1 flex items-center justify-center gap-2 p-3 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors font-semibold">
                    <ShareIcon className="w-5 h-5" /> Share
                </button>
            </div>
        </div>
    );
};


const FeedPage: React.FC = () => {
    const { user } = useAuth();
    const { openAuthPrompt } = useAuthPrompt();
    const { addNotification } = useNotification();
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Ensure firebase is initialized before using it.
        if (firebase.apps.length === 0) return;

        const db = firebase.database();
        const feedRef = db.ref('feed_posts').orderByChild('timestamp').limitToLast(100);

        const listener = feedRef.on('value', snapshot => {
            const feedData = snapshot.val();
            if (feedData) {
                const postsArray: FeedPost[] = Object.entries(feedData)
                    .map(([key, value]: [string, any]) => ({
                        id: key,
                        ...value,
                        likes: value.likes || {} // Ensure likes is an object
                    }))
                    .sort((a, b) => b.timestamp - a.timestamp); // Sort descending by time
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
    }, [addNotification]);
    
    const handleLike = useCallback((postId: string) => {
        if (!user) {
            openAuthPrompt();
            return;
        }
        const postRef = firebase.database().ref(`feed_posts/${postId}/likes/${user.uid}`);
        postRef.once('value', snapshot => {
            if (snapshot.exists()) {
                postRef.remove(); // Unlike
            } else {
                postRef.set(true); // Like
            }
        });
    }, [user, openAuthPrompt]);

    if (loading) {
        return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Community Feed</h1>
            {posts.length > 0 ? (
                posts.map(post => <PostCard key={post.id} post={post} onLike={handleLike} currentUser={user} />)
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">The feed is empty.</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">There are no posts to show right now.</p>
                </div>
            )}
        </div>
    );
};

export default FeedPage;
