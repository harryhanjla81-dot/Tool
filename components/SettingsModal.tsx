import React, { useState, useEffect } from 'react';
import { useTheme } from '../src/contexts/ThemeContext.tsx';
import { CloseIcon, PaletteIcon, SunIcon, MoonIcon, FacebookIcon, KeyIcon, ShieldCheckIcon, UserCircleIcon } from './IconComponents.tsx';
import CustomColorPicker from './CustomColorPicker.tsx';
import { AppThemeSettings, GlobalFontOptions, SelectedGlobalFontFamily, GradientDirection, GradientDirectionOptions, DEFAULT_THEME_SETTINGS, darkenColor, getContrastingTextColor, isValidHexColor } from '../types.ts';
import { useFacebookPage } from '../src/contexts/FacebookPageContext.tsx';
import Spinner from './Spinner.tsx';
import ApiKeyManager from './ApiKeyManager.tsx';
import { useAuth } from '../src/contexts/AuthContext.tsx';

// --- THEME SETTINGS COMPONENT ---
const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="grid grid-cols-12 gap-2 items-center mb-3">
        <label className="col-span-4 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="col-span-8">{children}</div>
    </div>
);

const ThemeSettings: React.FC = () => {
    const [themeSettings, setThemeSettings] = useState<AppThemeSettings>(() => {
        const saved = localStorage.getItem('aiContentCardThemeSettings_v1');
        return saved ? JSON.parse(saved) : DEFAULT_THEME_SETTINGS;
    });
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    const handleThemeSettingChange = <K extends keyof AppThemeSettings>(key: K, value: AppThemeSettings[K]) => {
        setThemeSettings(prev => ({ ...prev, [key]: value }));
    };
    
    const getSafeColor = (color: string, defaultColor: string): string => isValidHexColor(color) ? color : defaultColor;

    useEffect(() => {
        const { globalFontFamily, primaryColor, backgroundType, backgroundSolidColor, backgroundGradientStart, backgroundGradientEnd, backgroundGradientDirection } = themeSettings;
        const safePrimaryColor = getSafeColor(primaryColor, DEFAULT_THEME_SETTINGS.primaryColor);
        document.documentElement.style.setProperty('--app-font-family', globalFontFamily);
        document.documentElement.style.setProperty('--app-primary-color', safePrimaryColor);
        document.documentElement.style.setProperty('--app-primary-color-hover', darkenColor(safePrimaryColor, 10));
        document.documentElement.style.setProperty('--app-primary-color-text', getContrastingTextColor(safePrimaryColor));
        document.body.style.background = backgroundType === 'solid'
            ? getSafeColor(backgroundSolidColor, DEFAULT_THEME_SETTINGS.backgroundSolidColor)
            : `linear-gradient(${backgroundGradientDirection}, ${getSafeColor(backgroundGradientStart, DEFAULT_THEME_SETTINGS.backgroundGradientStart)}, ${getSafeColor(backgroundGradientEnd, DEFAULT_THEME_SETTINGS.backgroundGradientEnd)})`;
        localStorage.setItem('aiContentCardThemeSettings_v1', JSON.stringify(themeSettings));
    }, [themeSettings]);

    return (
        <div className="p-4 space-y-4">
            <FormRow label="Primary Color"><CustomColorPicker label="Primary theme color" value={themeSettings.primaryColor} onChange={(c) => handleThemeSettingChange('primaryColor', c)} isOpen={activeColorPicker === 'themePrimary'} onToggle={() => setActiveColorPicker(p => p === 'themePrimary' ? null : 'themePrimary')} /></FormRow>
            <FormRow label="Global Font"><select value={themeSettings.globalFontFamily} onChange={e => handleThemeSettingChange('globalFontFamily', e.target.value as SelectedGlobalFontFamily)} className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200">{Object.entries(GlobalFontOptions).map(([val, name]) => <option key={val} value={val}>{name}</option>)}</select></FormRow>
        </div>
    );
};

// --- FACEBOOK SETTINGS COMPONENT ---
const FacebookSettings: React.FC = () => {
    const { isAuthenticated, activePage, login, logout, isLoading, loginError } = useFacebookPage();
    const [token, setToken] = useState('');

    const handleLogin = () => {
        if (token.trim()) {
            login(token).then(() => {
                // Clear token from input after successful login attempt
                setToken('');
            });
        }
    };

    return (
        <div className="p-4 space-y-4">
            {isAuthenticated && activePage ? (
                <div className="p-3 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200">
                    <p className="font-semibold">Connected</p>
                    <p className="text-sm">Active Page: <strong>{activePage.name}</strong></p>
                </div>
            ) : (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold">Not Connected</p>
                    <p className="text-sm">Connect your Facebook account to use page-related features.</p>
                </div>
            )}
            
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Facebook User Access Token</label>
                <input 
                    type="password" 
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your token here"
                    className="w-full mt-1 p-2 border rounded-md bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                />
                 <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary/80 hover:text-primary hover:underline mt-1 block">
                    How to get a User Access Token?
                </a>
                {loginError && <p className="text-xs text-red-500 mt-1">{loginError}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                {isAuthenticated && (
                    <button onClick={logout} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700">
                        Logout
                    </button>
                )}
                <button 
                    onClick={handleLogin} 
                    disabled={isLoading || !token.trim()}
                    className="px-4 py-2 text-sm rounded-md bg-primary text-primary-text hover:bg-primary-hover flex items-center gap-2 disabled:opacity-50"
                >
                    {isLoading ? <Spinner size="sm" /> : (isAuthenticated ? 'Reconnect' : 'Connect')}
                </button>
            </div>
        </div>
    );
};

// --- PROFILE & LICENSE SETTINGS COMPONENT ---
const ProfileSettings: React.FC = () => {
    const { user } = useAuth();
    const { activePage } = useFacebookPage();
    const [licenseInfo, setLicenseInfo] = useState<{ expiry: number; durationDays: number } | null>(null);

    useEffect(() => {
        const data = localStorage.getItem('hanjlaHarryLicense_v1');
        if (data) {
            try {
                setLicenseInfo(JSON.parse(data));
            } catch (e) {
                console.error("Error parsing license data", e);
            }
        }
    }, []);

    const expiryDate = licenseInfo ? new Date(licenseInfo.expiry).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : 'N/A';
    const durationText = licenseInfo ? (licenseInfo.durationDays === 30 ? "1 Month" : "6 Months") : 'N/A';

    return (
        <div className="p-6 space-y-6">
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">User Information</h3>
                <div className="space-y-1 text-sm">
                    <p><strong className="text-gray-600 dark:text-gray-300">Name:</strong> {user?.displayName || 'Not set'}</p>
                    <p><strong className="text-gray-600 dark:text-gray-300">Email:</strong> {user?.email || 'Not set'}</p>
                </div>
            </div>
             <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">Connected Page</h3>
                <p className="text-sm">{activePage ? `Currently connected to: ${activePage.name}` : 'No Facebook Page connected.'}</p>
            </div>
            <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">License Details</h3>
                {licenseInfo ? (
                    <div className="space-y-3">
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 rounded-md">
                            <p className="font-bold flex items-center gap-2"><ShieldCheckIcon className="w-5 h-5" /> License Active</p>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Plan Duration:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{durationText}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm p-2">
                            <span className="font-medium text-gray-600 dark:text-gray-300">Expires On:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{expiryDate}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No active license found.</p>
                )}
            </div>
        </div>
    );
};


// --- MAIN SETTINGS MODAL ---
interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}
type Tab = 'profile' | 'appearance' | 'facebook' | 'apiKeys';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>('profile');

    if (!isOpen) return null;

    const TabButton: React.FC<{ tabId: Tab, children: React.ReactNode }> = ({ tabId, children }) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start flex-shrink-0 w-24 lg:w-full p-2 lg:p-3 rounded-lg transition-colors text-center lg:text-left gap-1 lg:gap-3 text-xs lg:text-sm font-semibold ${activeTab === tabId ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"><CloseIcon /></button>
                </div>
                
                <div className="flex flex-col lg:flex-row flex-grow overflow-hidden">
                    {/* Tabs (Horizontal on mobile, Vertical on desktop) */}
                    <div className="w-full lg:w-1/4 flex-shrink-0 border-b lg:border-b-0 lg:border-r dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <div className="flex flex-row lg:flex-col overflow-x-auto scrollbar-thin p-2 lg:space-y-1">
                            <TabButton tabId="profile"><UserCircleIcon className="w-5 h-5 flex-shrink-0" />Profile</TabButton>
                            <TabButton tabId="appearance"><PaletteIcon className="w-5 h-5 flex-shrink-0" />Appearance</TabButton>
                            <TabButton tabId="facebook"><FacebookIcon className="w-5 h-5 flex-shrink-0" />Facebook</TabButton>
                            <TabButton tabId="apiKeys"><KeyIcon className="w-5 h-5 flex-shrink-0" />API Keys</TabButton>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="w-full lg:w-3/4 flex flex-col">
                        <div className="flex-grow overflow-y-auto scrollbar-thin">
                            {activeTab === 'profile' && <ProfileSettings />}
                            {activeTab === 'appearance' && <ThemeSettings />}
                            {activeTab === 'facebook' && <FacebookSettings />}
                            {activeTab === 'apiKeys' && <ApiKeyManager />}
                        </div>
                        <div className="p-4 border-t dark:border-gray-700 flex justify-between items-center flex-shrink-0 bg-gray-50/50 dark:bg-gray-800/50">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Manage your application settings.</span>
                            <button onClick={toggleTheme} className="p-2.5 rounded-lg text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600" aria-label="Toggle theme">
                                {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;