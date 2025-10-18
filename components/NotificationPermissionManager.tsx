import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../src/contexts/AuthContext.tsx';
import { useNotification } from '../src/contexts/NotificationContext.tsx';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// This is required to use the firebase global object from the script tag in index.html
declare const firebase: any;

const NotificationPermissionManager: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

    const setupPushNotifications = useCallback(async () => {
        if (!user || typeof firebase.messaging === 'undefined') {
            return;
        }

        try {
            // The compat script already initialized the app, so we can get it.
            const app = firebase.app();
            const messaging = getMessaging(app);
            
            // Register the service worker with the recommended scope
            const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/firebase-cloud-messaging-push-scope',
            });

            // IMPORTANT: You need to generate this key in your Firebase project settings
            // Go to Project Settings > Cloud Messaging > Web configuration > Generate key pair
            const vapidKey = "YOUR_VAPID_KEY_HERE"; // <---- PASTE YOUR VAPID KEY HERE

            // Get token using the modular SDK, passing the registration and VAPID key
            const token = await getToken(messaging, { 
                vapidKey: vapidKey,
                serviceWorkerRegistration: swReg
            });
            
            if (token) {
                // Save the token to the Realtime Database under the user's profile
                const tokenRef = firebase.database().ref(`users/${user.uid}/fcmTokens/${token}`);
                await tokenRef.set(true);
                console.log('FCM Token stored successfully.');

                // Handle incoming messages when the app is in the foreground
                onMessage(messaging, (payload: any) => {
                    console.log('Message received in foreground.', payload);
                    if (payload.notification) {
                        addNotification(
                            `${payload.notification.title}\n${payload.notification.body}`,
                            'info',
                            10000 // Show for 10 seconds
                        );
                    }
                });

            } else {
                console.warn('No registration token available. Request permission to generate one.');
                addNotification('Could not get notification token. Please try again.', 'error');
            }
        } catch (err: any) {
            console.error('An error occurred while retrieving token. ', err);
            addNotification(`Notification setup failed: ${err.message}`, 'error');
        }
    }, [user, addNotification]);

    useEffect(() => {
        if (!user || !('Notification' in window) || typeof firebase.messaging === 'undefined') {
            return;
        }
        
        // Show the prompt banner if permission hasn't been asked yet
        if (Notification.permission === 'default') {
            setShowPermissionPrompt(true);
        } else if (Notification.permission === 'granted') {
            setShowPermissionPrompt(false);
            // If already granted, ensure we have the token
            setupPushNotifications();
        } else {
            // Permission is denied, hide the prompt
            setShowPermissionPrompt(false);
        }
    }, [user, setupPushNotifications]);

    const handleRequestPermission = async () => {
        if (!('Notification' in window)) {
            addNotification('This browser does not support desktop notifications.', 'error');
            return;
        }
        
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                addNotification('Notifications enabled!', 'success');
                setShowPermissionPrompt(false);
                await setupPushNotifications();
            } else {
                addNotification('Notifications permission was denied.', 'info');
                setShowPermissionPrompt(false);
            }
        } catch (err) {
            console.error('Error requesting notification permission:', err);
            addNotification('Could not request notification permission.', 'error');
        }
    };
    
    if (!user || !showPermissionPrompt) {
        return null;
    }

    return (
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg flex items-center justify-between gap-4 mb-4 animate-[fade-in_0.5s_ease-out]">
            <p className="text-sm text-blue-800 dark:text-blue-200">
                Enable notifications to get alerts for new messages and comments on your posts.
            </p>
            <button 
                onClick={handleRequestPermission} 
                className="flex-shrink-0 px-4 py-1.5 text-sm font-semibold bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm"
            >
                Enable
            </button>
        </div>
    );
};

export default NotificationPermissionManager;