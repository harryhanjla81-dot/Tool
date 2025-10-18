import React, { useState, FormEvent } from 'react';
import { useAuth } from '../src/contexts/AuthContext.tsx';
import { Link } from 'react-router-dom';
import Spinner from './Spinner.tsx';
import { CloseIcon, EyeIcon, EyeSlashIcon } from './IconComponents.tsx';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginPromptModal: React.FC<LoginPromptModalProps> = ({ isOpen, onClose }) => {
    const { login, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await login(email, password);
        // Do not automatically close on error, but close on success
        if (!error) {
             onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Please Sign In</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">You need to be logged in to continue.</p>
                        </div>
                        <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 -mt-2 -mr-2">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {error && <p className="text-center text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg my-4">{error}</p>}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                id="modal-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                                className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="modal-password"  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <div className="relative mt-1">
                                <input
                                    id="modal-password" type={passwordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                                    className="w-full p-3 pr-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {passwordVisible ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-primary rounded-lg shadow-md hover:bg-primary-hover disabled:opacity-50 flex items-center justify-center">
                            {loading ? <Spinner size="sm" /> : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-sm text-center text-gray-500 dark:text-gray-400 pt-4 mt-4 border-t dark:border-gray-700">
                        Don't have an account?{' '}
                        <Link to="/signup" onClick={onClose} className="font-medium text-primary hover:underline transition">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
