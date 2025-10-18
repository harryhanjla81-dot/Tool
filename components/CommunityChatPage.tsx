import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext.tsx';
import { supabase } from '../src/supabaseClient.ts';

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
        // FIX: Corrected the return type of 'on' to match the callback's signature.
        on(eventType: string, callback: (snapshot: any) => any, cancelCallbackOrContext?: ((error: Error) => void) | object | null, context?: object | null): (snapshot: any) => any;
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


const CommunityChatPage: React.FC = () => {
    const { user } = useAuth();
    const chatInitialized = useRef(false);
    const [userProfiles, setUserProfiles] = useState<Record<string, { displayName: string; photoURL?: string }>>({});

    useEffect(() => {
        if (!user || chatInitialized.current) return;

        const db = firebase.database();
        const usersRef = db.ref('users');
        const profilesListener = usersRef.on('value', (snapshot: any) => {
            setUserProfiles(snapshot.val() || {});
        });

        // Cleanup listener on unmount
        return () => usersRef.off('value', profilesListener);
    }, [user]);

    useEffect(() => {
        if (chatInitialized.current || !user || Object.keys(userProfiles).length === 0) return;

        const initChat = async () => {
            const db = firebase.database();
            
            const $messages = document.getElementById('messages') as HTMLElement;
            const $msg = document.getElementById('msg') as HTMLInputElement;
            const $send = document.getElementById('send') as HTMLButtonElement;
            const $imgBtn = document.getElementById('imgBtn') as HTMLButtonElement;
            const $imgUpload = document.getElementById('imgUpload') as HTMLInputElement;
            const $info = document.getElementById('info') as HTMLElement;
            const $typingIndicator = document.getElementById('typingIndicator') as HTMLElement;
            const $replyPreview = document.getElementById('replyPreview') as HTMLElement;
            const $replyPreviewName = document.getElementById('replyPreviewName') as HTMLElement;
            const $replyPreviewText = document.getElementById('replyPreviewText') as HTMLElement;
            const $cancelReply = document.getElementById('cancelReply') as HTMLButtonElement;
            let currentRoom = 'global';
            let messagesRef: any | null = null;
            // FIX: Updated listener type to be compatible with the corrected 'on' method's return type.
            let listener: ((snapshot: any) => any) | null = null;
            let typingRef: any | null = null;
            let userPresenceRef: any | null = null;
            let typingTimer: ReturnType<typeof setTimeout> | null = null;
            let lastDayLabel: string | null = null;
            let replyContext: { uid: string; text: string } | null = null;
            let usersCount = 1;

            const stringToHash = (str: string) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
              }
              return hash;
            }
            const colorPalette = ['#ef4444', '#f97316', '#84cc16', '#10b981', '#06b6d4', '#6366f1', '#d946ef', '#f43f5e'];
            const getColorForName = (name: string) => {
              const hash = stringToHash(name);
              const index = Math.abs(hash) % colorPalette.length;
              return colorPalette[index];
            }

            $send.addEventListener('click', sendMessage);
            $imgBtn.addEventListener('click', () => { $imgUpload.click(); });
            $imgUpload.addEventListener('change', handleImage);
            $cancelReply.addEventListener('click', () => {
              replyContext = null;
              $replyPreview.style.display = 'none';
            });
            $msg.addEventListener('keydown', (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
              }
            });

            function joinRoom(uid: string) {
              (window as any)._chatUid = uid;
              $msg.disabled = false; $send.disabled = false; $imgBtn.disabled = false;
              if (listener && messagesRef) messagesRef.off('child_added', listener);
              lastDayLabel = null; $messages.innerHTML = ''; $info.textContent = 'Loading messages…';
              messagesRef = db.ref('rooms/' + currentRoom + '/messages').orderByChild('ts').limitToLast(200);
              const initialMessageKeys = new Set();
              
              messagesRef.once('value').then((snapshot: any) => {
                  const initialMessages: any[] = [];
                  snapshot.forEach((childSnap: any) => {
                      const key = childSnap.key; if(key) { initialMessageKeys.add(key); initialMessages.push({ key, ...childSnap.val() }); }
                  });
                  initialMessages.sort((a, b) => a.ts - b.ts);
                  initialMessages.forEach(msg => {
                      if (msg.uid !== (window as any)._chatUid) db.ref('rooms/' + currentRoom + '/messages/' + msg.key + '/readBy/' + (window as any)._chatUid).set(true);
                      addMessage(msg.key, msg);
                  });
                  $info.textContent = '';
                  setTimeout(() => { $messages.scrollTop = $messages.scrollHeight; }, 50);

                  listener = messagesRef!.on('child_added', (snap: any) => {
                      const key = snap.key; if (key && !initialMessageKeys.has(key)) { const m = snap.val(); if (m.uid !== (window as any)._chatUid) db.ref('rooms/' + currentRoom + '/messages/' + key + '/readBy/' + (window as any)._chatUid).set(true); addMessage(key, m); }
                  });
              });

              if (userPresenceRef) userPresenceRef.remove();
              userPresenceRef = db.ref('rooms/' + currentRoom + '/users/' + uid);
              userPresenceRef.set(true); userPresenceRef.onDisconnect().remove();
              db.ref('rooms/' + currentRoom + '/users').on('value', (snap: any) => { usersCount = snap.numChildren() || 1; });

              if (typingRef) typingRef.remove();
              typingRef = db.ref('rooms/' + currentRoom + '/typing/' + uid);
              typingRef.onDisconnect().remove();

              db.ref('rooms/' + currentRoom + '/typing').on('value', (snap: any) => {
                const uids: string[] = [];
                snap.forEach((child: any) => { if (child.val() && child.key !== (window as any)._chatUid) uids.push(child.key!); });
                if (uids.length > 0) {
                  const names = uids.map(uid => userProfiles[uid]?.displayName || 'Someone');
                  $typingIndicator.style.display = 'block';
                  $typingIndicator.textContent = names.length === 1 ? `${names[0]} is typing…` : 'Several people are typing…';
                } else {
                  $typingIndicator.style.display = 'none';
                }
              });
              $msg.addEventListener('input', () => {
                if (!currentRoom || !typingRef) return;
                typingRef.set(true); if(typingTimer) clearTimeout(typingTimer);
                typingTimer = setTimeout(() => { typingRef!.set(false); }, 1500);
              });
            }

            function sendMessage() {
              const text = ($msg.value || '').trim();
              if ((!text && !replyContext) || !currentRoom) return;
              if (text.length > 1000) { alert('Max 1000 characters'); return; }
              const payload: any = { uid: (window as any)._chatUid, text, ts: Date.now(), img: null };
              if (replyContext) { payload.replyToUid = replyContext.uid; payload.replyText = replyContext.text; }
              db.ref('rooms/' + currentRoom + '/messages').push(payload).catch((err: any) => { alert('Write failed: ' + err.message); });
              $msg.value = ''; if (replyContext) { replyContext = null; $replyPreview.style.display = 'none'; }
              if (typingRef) typingRef.set(false);
            }

            async function handleImage() {
                const file = $imgUpload.files?.[0];
                if (!file || !currentRoom) return;
                if (file.size > 5 * 1024 * 1024) { // Increased to 5MB
                    alert('Max 5MB image size');
                    $imgUpload.value = '';
                    return;
                }

                $imgBtn.disabled = true;
                $send.disabled = true;

                try {
                    const filePath = `chat-media/${user!.uid}/${Date.now()}_${file.name}`;
                    const { error: uploadError } = await supabase.storage
                        .from('feed-media') // Re-using the feed bucket
                        .upload(filePath, file);

                    if (uploadError) {
                        throw new Error(`Supabase upload error: ${uploadError.message}`);
                    }

                    const { data } = supabase.storage
                        .from('feed-media')
                        .getPublicUrl(filePath);

                    if (!data.publicUrl) {
                        throw new Error('Could not get public URL for the uploaded image.');
                    }
                    
                    const imageUrl = data.publicUrl;

                    const payload: any = { uid: (window as any)._chatUid, text: '', img: imageUrl, ts: Date.now() };
                    if (replyContext) {
                        payload.replyToUid = replyContext.uid;
                        payload.replyText = replyContext.text;
                    }
                    await db.ref('rooms/' + currentRoom + '/messages').push(payload);

                    $imgUpload.value = '';
                    if (replyContext) {
                        replyContext = null;
                        $replyPreview.style.display = 'none';
                    }
                    if (typingRef) typingRef.set(false);

                } catch (err: any) {
                    console.error("Image upload failed:", err);
                    alert('Image upload failed: ' + err.message);
                } finally {
                    $imgBtn.disabled = false;
                    $send.disabled = false;
                }
            }

            function initials(name: string) { return name.trim().split(/\s+/).map(s => s[0]).join('').slice(0, 2).toUpperCase(); }

            function addMessage(key: string, m: any) {
              const { uid, text, ts, img, replyToUid, replyText, readBy } = m;
              const author = userProfiles[uid];
              if (!author) return;
              const { displayName: name, photoURL } = author;
              const date = new Date(ts || Date.now()); const dayStr = date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
              if (dayStr !== lastDayLabel) {
                const sep = document.createElement('div'); sep.className = 'relative text-center my-6';
                sep.innerHTML = `<hr class="absolute top-1/2 left-0 w-full border-gray-200 dark:border-gray-700" /><span class="relative bg-gray-50 dark:bg-gray-900 px-3 text-xs font-semibold text-gray-500">${dayStr}</span>`;
                $messages.appendChild(sep); lastDayLabel = dayStr;
              }
              const isSelf = (uid === (window as any)._chatUid);
              
              const row = document.createElement('div'); row.className = `flex items-start gap-3 group ${isSelf ? 'flex-row-reverse' : ''}`;
              
              const avatar = document.createElement('div');
              avatar.className = 'w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 overflow-hidden';
              if (photoURL) {
                avatar.innerHTML = `<img src="${photoURL}" class="w-full h-full object-cover" alt="${name}"/>`;
              } else {
                avatar.textContent = initials(name);
                avatar.style.backgroundColor = isSelf ? 'var(--app-primary-color)' : getColorForName(name);
              }
              
              const bubbleContainer = document.createElement('div'); bubbleContainer.className = `max-w-lg flex flex-col ${isSelf ? 'items-end' : 'items-start'}`;
              if (!isSelf) { const nameEl = document.createElement('div'); nameEl.className = 'text-xs font-bold mb-1'; nameEl.textContent = name; nameEl.style.color = getColorForName(name); bubbleContainer.appendChild(nameEl); }

              const bubble = document.createElement('div'); bubble.className = `p-3 rounded-xl relative ${isSelf ? 'bg-primary text-primary-text rounded-br-none' : 'bg-white dark:bg-gray-700 rounded-bl-none'}`;
              
              if (replyToUid && replyText) {
                  const replyBlock = document.createElement('div');
                  replyBlock.className = 'mb-2 p-2 border-l-2 opacity-80';
                  replyBlock.style.borderColor = isSelf ? 'rgba(255,255,255,0.5)' : 'var(--app-primary-color)';
                  const replyName = userProfiles[replyToUid]?.displayName || 'User';
                  replyBlock.innerHTML = `<strong class="text-xs">${replyName}</strong><p class="text-sm line-clamp-2">${replyText}</p>`;
                  bubble.appendChild(replyBlock);
              }

              if (text && text.trim()) { const body = document.createElement('p'); body.className = 'text-base break-words whitespace-pre-wrap'; body.textContent = text; bubble.appendChild(body); }
              if (img) { const im = document.createElement('img'); im.src = img; im.alt = 'image'; im.loading = 'lazy'; im.className = "rounded-lg mt-2 max-w-xs cursor-pointer"; im.onclick = () => {}; bubble.appendChild(im); }
              
              const meta = document.createElement('div'); meta.className = `text-xs opacity-70 mt-1 flex items-center gap-1 ${isSelf ? 'justify-end' : ''}`;
              const timeSpan = document.createElement('span'); timeSpan.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const replyIcon = document.createElement('button'); replyIcon.className = 'opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity'; replyIcon.title = 'Reply';
              replyIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.128a.75.75 0 010 1.5H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clip-rule="evenodd" /></svg>`;
              replyIcon.addEventListener('click', (e) => {
                e.stopPropagation(); const previewText = text?.trim().slice(0, 120) || (img ? '[image]' : '');
                replyContext = { uid, text: previewText };
                $replyPreviewName.textContent = name; $replyPreviewText.textContent = previewText;
                $replyPreview.style.display = 'flex'; $msg.focus();
              });

              if (isSelf) { const tickSpan = document.createElement('span'); let count = readBy ? Object.keys(readBy).length : 1; let symbol = '✔'; let color = 'currentColor'; if(count < usersCount) symbol = '✔✔'; if(count >= usersCount) { symbol = '✔✔'; color = '#3b82f6'; } tickSpan.textContent = symbol; tickSpan.style.color = color; meta.appendChild(tickSpan); meta.appendChild(timeSpan); bubbleContainer.appendChild(replyIcon); } else { meta.appendChild(timeSpan); bubbleContainer.appendChild(replyIcon); }
              bubbleContainer.appendChild(bubble); bubbleContainer.appendChild(meta);
              row.appendChild(avatar); row.appendChild(bubbleContainer);
              $messages.appendChild(row);
              const isScrolledToBottom = $messages.scrollHeight - $messages.clientHeight <= $messages.scrollTop + 150;
              if (isScrolledToBottom || isSelf) $messages.scrollTop = $messages.scrollHeight;
            }

            if (user && user.uid) {
                joinRoom(user.uid);
            } else {
                 if ($info) $info.textContent = 'You must be logged in to join the chat.';
            }
        };

        initChat();
        chatInitialized.current = true;

    }, [user, userProfiles]);

    return (
        <div className="chat-container h-[calc(100vh-5rem)] p-0 m-0">
            <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div id="messages" className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4"></div>
                <div id="info" className="p-4 text-center text-gray-500" style={{display: 'none'}}></div>
                <div id="typingIndicator" className="px-4 pb-2 text-sm text-gray-500 italic" style={{ display: 'none' }}></div>
                <div id="replyPreview" className="p-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2" style={{ display: 'none' }}>
                    <div className="border-l-4 border-primary pl-2 flex-grow">
                        <div className="text-sm font-bold text-primary" id="replyPreviewName"></div>
                        <div className="text-sm truncate text-gray-600 dark:text-gray-400" id="replyPreviewText"></div>
                    </div>
                    <button id="cancelReply" className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 flex-shrink-0">&times;</button>
                </div>
                <div className="composer p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3 bg-gray-50 dark:bg-gray-800">
                    <button id="imgBtn" disabled title="Send Image" className="p-2 text-gray-500 hover:text-primary disabled:opacity-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                    </button>
                    <input id="msg" className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full py-2 px-4 focus:ring-primary focus:border-primary" placeholder="Type a message…" maxLength={1000} disabled />
                    <button id="send" disabled title="Send Message" className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-text hover:bg-primary-hover disabled:opacity-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 -mr-1 rotate-90">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </button>
                    <input id="imgUpload" type="file" accept="image/*" className="hidden" />
                </div>
            </div>
        </div>
    );
};

export default CommunityChatPage;