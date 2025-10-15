import React, { useState } from 'react';
import { base32ToBytes, verifyTotpWindow } from './types.ts';
import { AuthLayout } from './LoginPage.tsx'; // Re-use the nice layout
import Spinner from './components/Spinner.tsx';
import { useAuth } from './src/contexts/AuthContext.tsx';
import { useNotification } from './src/contexts/NotificationContext.tsx';

// You can replace these secrets with your own secure, randomly generated base32 strings.
// These keys have been verified to contain only valid Base32 characters (A-Z, 2-7).
const SECRET_30_DAYS = 'K7HFE73HRIKYIWJFWXE5DSN4ZUA3LZSK'; 
const SECRET_180_DAYS = 'RJCM3XBBMDLGHU6FWKH6DSEACKZMZKGI';

const LicenseActivationPage: React.FC = () => {
    const { logout } = useAuth();
    const { addNotification } = useNotification();
    const [licenseKey, setLicenseKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleActivate = async () => {
        setIsLoading(true);
        setError(null);
        
        const key = licenseKey.trim().replace(/\s/g, '');

        if (!/^\d{6}$/.test(key)) {
            setError('Invalid format. License key must be 6 digits.');
            setIsLoading(false);
            return;
        }

        // Use a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        let durationDays: number | null = null;

        try {
            const secret30Bytes = base32ToBytes(SECRET_30_DAYS);
            const secret180Bytes = base32ToBytes(SECRET_180_DAYS);

            const isValid30 = await verifyTotpWindow(secret30Bytes, key);
            if (isValid30) {
                durationDays = 30;
            } else {
                const isValid180 = await verifyTotpWindow(secret180Bytes, key);
                if (isValid180) {
                    durationDays = 180;
                }
            }
        } catch (e: any) {
            setError(`An error occurred during verification: ${e.message}`);
            setIsLoading(false);
            return;
        }

        if (durationDays) {
            const expiry = Date.now() + durationDays * 24 * 60 * 60 * 1000;
            localStorage.setItem('hanjlaHarryLicense_v1', JSON.stringify({ expiry, durationDays }));
            
            const durationText = durationDays === 30 ? "1 month" : "6 months";
            addNotification(`License activated successfully for ${durationText}!`, 'success', 4000);

            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            setError('Invalid or expired license key. Please check the code and try again.');
            setIsLoading(false);
        }
    };

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
            <AuthLayout title="Activate License">
                <p className="text-center text-gray-400">Please enter your license key to activate the application.</p>
                {error && <p className="text-center text-red-400 bg-red-900/30 p-3 rounded-lg border border-red-500/50">{error}</p>}
                
                <div className="space-y-6 text-left">
                    <div>
                        <label htmlFor="license" className="block text-sm font-medium text-gray-300 mb-1">License Key</label>
                        <input
                            id="license" type="text" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} required
                            className="w-full mt-1 p-3 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition placeholder:text-gray-500 text-white font-mono tracking-widest text-center"
                            placeholder="_ _ _ _ _ _"
                        />
                    </div>
                    <button onClick={handleActivate} disabled={isLoading || !licenseKey.trim()} className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg hover:scale-105 hover:shadow-pink-500/50 transform transition-all duration-300 disabled:opacity-50 flex items-center justify-center">
                        {isLoading ? <Spinner size="sm" /> : 'Activate'}
                    </button>
                </div>

                <div className="pt-4 mt-4 border-t border-white/20">
                    <p className="text-xs text-center text-gray-500">
                        If you don't have a license key, please contact support. You can also log out.
                    </p>
                    <button onClick={logout} className="w-full mt-4 px-4 py-2 text-sm font-semibold bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors">
                        Log Out
                    </button>
                </div>
            </AuthLayout>
        </div>
    );
};

export default LicenseActivationPage;