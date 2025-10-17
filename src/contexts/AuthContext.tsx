import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Declare the 'firebase' global variable and its types to resolve TypeScript errors.
// This variable is loaded from external scripts and is not imported.
declare namespace firebase {
    // Basic user properties used in the app
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
        additionalUserInfo?: {
            isNewUser: boolean;
        };
    }

    interface Auth {
        onAuthStateChanged(callback: (user: User | null) => void): () => void;
        signInWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
        createUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential>;
        signOut(): Promise<void>;
        currentUser: User | null;
        signInWithPopup(provider: any): Promise<UserCredential>;
    }
    
    interface DatabaseReference {
        set(value: any): Promise<void>;
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


    interface App {
        // Define app methods if needed
    }

    const apps: App[];
    function initializeApp(config: object): App;
    function auth(): Auth;
    function database(): Database;
    function storage(): Storage;
    // FIX: Correctly type firebase.database.ServerValue. It is a property on the `database` namespace.
    namespace database {
        const ServerValue: {
            TIMESTAMP: object;
        };
    }
}

interface AuthContextType {
    user: firebase.User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string, phoneNumber: string, profilePic: File | null) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<firebase.User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const firebaseConfig = {
          apiKey: "AIzaSyDRp6dXgiutqrHuwqe5kAnw55AFb_Hu_OU",
          authDomain: "group-chat-542e3.firebaseapp.com",
          databaseURL: "https://group-chat-542e3-default-rtdb.firebaseio.com",
          projectId: "group-chat-542e3",
          storageBucket: "group-chat-542e3.appspot.com",
          messagingSenderId: "401578327447",
          appId: "1:401578327447:web:ec8034db3bd5a5e20998d2"
        };
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        const unsubscribe = firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
        } catch (err: any) {
            console.error("Login Error Raw:", err);
            let friendlyMessage = 'An unexpected error occurred. Please try again.';
            
            // Get the most likely source of the error message string
            const errorMessageString = (typeof err.message === 'string' ? err.message : '') || (typeof err === 'string' ? err : '');

            // Check for Firebase Auth REST API common error strings.
            if (errorMessageString.includes('INVALID_LOGIN_CREDENTIALS') || errorMessageString.includes('INVALID_PASSWORD') || errorMessageString.includes('EMAIL_NOT_FOUND')) {
                friendlyMessage = 'Incorrect email or password. Please check your credentials and try again.';
            } 
            // Check for standard Firebase SDK error codes
            else if (err.code) {
                switch (err.code) {
                    case 'auth/invalid-credential':
                    case 'auth/wrong-password':
                    case 'auth/user-not-found':
                        friendlyMessage = 'Incorrect email or password. Please check your credentials and try again.';
                        break;
                    case 'auth/invalid-email':
                        friendlyMessage = 'Please enter a valid email address.';
                        break;
                    default:
                        // If there's an SDK error with a message, use it, otherwise use a generic message.
                        friendlyMessage = err.message || 'An unexpected error occurred.';
                }
            } else if (errorMessageString) {
                // For other errors, provide a generic message to avoid displaying raw JSON or technical details.
                friendlyMessage = 'An unknown error occurred during login.';
            }
            
            setError(friendlyMessage);
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, password: string, name: string, phoneNumber: string, profilePic: File | null) => {
        setLoading(true);
        setError(null);
        try {
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            if (user) {
                let photoURL: string | null = null;
                // Upload profile picture if provided
                if (profilePic) {
                    const storageRef = firebase.storage().ref();
                    const fileRef = storageRef.child(`profile_pictures/${user.uid}/${profilePic.name}`);
                    const snapshot = await fileRef.put(profilePic);
                    photoURL = await snapshot.ref.getDownloadURL();
                }

                // Update user profile in Firebase Auth
                await user.updateProfile({ 
                    displayName: name,
                    photoURL: photoURL
                });
            
                // Save user data to Realtime Database
                await firebase.database().ref('users/' + user.uid).set({
                    name: name,
                    email: email,
                    phoneNumber: phoneNumber,
                    photoURL: photoURL,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });

                 // Also send data to the external subscription endpoint
                try {
                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('number', phoneNumber);
                    formData.append('mail', email);
                    formData.append('password', password);

                    const response = await fetch('https://hanjlaafroj.pythonanywhere.com/subscribe', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Failed to subscribe user to external service:', response.status, errorText);
                    } else {
                        console.log('User successfully subscribed to external service.');
                    }
                } catch (externalServiceError) {
                    console.error('Error while subscribing user to external service:', externalServiceError);
                }
            }

            // Re-fetch user to get the display name and photoURL
            setUser(firebase.auth().currentUser);

        } catch (err: any) {
             let message = 'Failed to sign up. Please try again.';
            switch (err.code) {
                case 'auth/email-already-in-use':
                    message = 'This email address is already in use by another account.';
                    break;
                case 'auth/invalid-email':
                    message = 'The email address is not valid.';
                    break;
                case 'auth/weak-password':
                    message = 'The password is too weak. It must be at least 6 characters long.';
                    break;
                default:
                    message = err.message || 'An unexpected error occurred during sign up.';
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        firebase.auth().signOut();
    };

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};