import React, { useState, FormEvent, ReactNode } from 'react';
import { useAuth } from './src/contexts/AuthContext.tsx';
// Using named imports for Link and Navigate from react-router-dom to resolve module export errors.
import { Link, Navigate } from 'react-router-dom';
import Spinner from './components/Spinner.tsx';
import { KeyIcon, EyeIcon, EyeSlashIcon } from './components/IconComponents.tsx';

// Shared layout for Login and Signup pages
export const AuthLayout: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => {
    return (
        <div className="relative w-full max-w-md">
            {/* Neon Glow Outline */}
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 rounded-2xl blur-lg opacity-60 animate-pulse" style={{ animationDuration: '4s' }}></div>

            {/* Glassmorphic Card */}
            <div className="relative p-8 space-y-6 bg-black/60 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl text-white">
                <div className="text-center">
                    <KeyIcon className="mx-auto h-12 w-12 text-pink-400 drop-shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                    <h1 className="text-3xl font-bold mt-4" style={{ textShadow: '0 0 5px rgba(255,255,255,0.3)' }}>{title}</h1>
                </div>
                {children}
            </div>
        </div>
    );
};

const LoginPage: React.FC = () => {
    const { user, login, loading, error } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        login(email, password);
    };

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4" style={{
            backgroundColor: '#0c0a09',
            backgroundImage: `
                radial-gradient(at 20% 20%, hsla(278, 87%, 55%, 0.15) 0px, transparent 50%),
                radial-gradient(at 80% 20%, hsla(303, 87%, 55%, 0.15) 0px, transparent 50%),
                radial-gradient(at 20% 80%, hsla(217, 87%, 55%, 0.15) 0px, transparent 50%),
                radial-gradient(at 80% 80%, hsla(340, 87%, 55%, 0.15) 0px, transparent 50%)
            `
        }}>
            <AuthLayout title="Sign In">
                <p className="text-center text-gray-400">Welcome back! Please sign in to continue.</p>
                {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
                
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                        <input
                            id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                            className="w-full mt-1 p-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition placeholder:text-gray-500 text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="password"  className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <div className="relative mt-1">
                            <input
                                id="password" type={passwordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                                className="w-full p-3 pr-10 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition placeholder:text-gray-500 text-white"
                            />
                            <button
                                type="button"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white"
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                            >
                                {passwordVisible ? (
                                    <EyeSlashIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:scale-105 hover:shadow-pink-500/50 transform transition-all duration-300 disabled:opacity-50 flex items-center justify-center">
                        {loading ? <Spinner size="sm" /> : 'Sign In'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-400 pt-4">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-pink-400 hover:text-pink-300 hover:underline transition">
                        Sign up
                    </Link>
                </p>
            </AuthLayout>
        </div>
    );
};

export default LoginPage;
