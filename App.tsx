import React, { useEffect } from 'react';
// Using named imports for react-router-dom components to resolve module export errors.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import MainAppPage from './MainAppPage.tsx';
import CollageMakerPage from './CollageMakerPage.tsx';
import FrameMakerPage from './FrameMakerPage.tsx';
import UploaderPage from './UploaderPage.tsx';
import ManagePostsPage from './ManagePostsPage.tsx';
import CrossPostPage from './CrossPostPage.tsx'; // Import the new page
import MessagesPage from './MessagesPage.tsx'; // Import the new Messages page
import TwoFactorAuthPage from './TwoFactorAuthPage.tsx'; // Import the new 2FA page
import AudienceInsightsPage from './AudienceInsightsPage.tsx'; // New: Merged page
import AboutPage from './AboutPage.tsx'; // New: About Page
import PrivacyPolicyPage from './PrivacyPolicyPage.tsx'; // New: Privacy Policy Page
import CommunityChatPage from './components/CommunityChatPage.tsx'; // New: Community Chat Page
import PricingPage from './PricingPage.tsx'; // New: Pricing Page
import LoginPage from './LoginPage.tsx'; // New: Login Page
import SignupPage from './SignupPage.tsx'; // New: Signup Page
import FeedPage from './FeedPage.tsx'; // New: Feed Page
import LicenseGate from './LicenseGate.tsx';
import { SidebarProvider, PageActionProvider } from './src/contexts/SidebarContext.tsx';
import { NotificationProvider } from './src/contexts/NotificationContext.tsx';
import { SettingsProvider } from './src/contexts/SettingsContext.tsx';
import { FacebookPageProvider } from './src/contexts/FacebookPageContext.tsx';
import { AuthProvider } from './src/contexts/AuthContext.tsx';
import { ThemeProvider } from './src/contexts/ThemeContext.tsx';
import { ApiKeysProvider, useApiKeys } from './src/contexts/ApiKeysContext.tsx';
import { setApiKey as setGeminiApiKey } from './services/geminiService.ts';
import UserAvatar from './components/UserAvatar.tsx';


const ApiKeyInitializer: React.FC = () => {
    const { apiKeys } = useApiKeys(); // Listen to changes in keys
    
    useEffect(() => {
        // Find the first active Gemini key
        const activeGeminiKey = apiKeys.find(k => k.provider === 'gemini' && k.isActive);
        if (activeGeminiKey) {
            setGeminiApiKey(activeGeminiKey.key);
        } else {
            setGeminiApiKey(''); // Set to empty to trigger errors if used without a key
        }
    }, [apiKeys]); // Rerun whenever keys change

    return null; // This component doesn't render anything
};


const AuthenticatedApp: React.FC = () => (
  <PageActionProvider>
    <ApiKeyInitializer />
    <Layout>
      <Routes>
        <Route index element={<Navigate to="/feed" replace />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="dashboard" element={<MainAppPage />} />
        <Route path="collage-maker" element={<CollageMakerPage />} />
        <Route path="frame-maker" element={<FrameMakerPage />} />
        <Route path="cross-post" element={<CrossPostPage />} />
        <Route path="uploader" element={<UploaderPage />} />
        <Route path="manage-posts" element={<ManagePostsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="audience-insights" element={<AudienceInsightsPage />} />
        <Route path="2fa" element={<TwoFactorAuthPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="community-chat" element={<CommunityChatPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="*" element={<Navigate to="/feed" replace />} /> {/* Fallback for any other path */}
      </Routes>
    </Layout>
  </PageActionProvider>
);

const App: React.FC = () => {
  return (
    <>
      <div id="export-board" style={{ position: 'fixed', left: '-9999px', top: '-9999px', width: '1080px', height: '1080px' }}></div>
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
            <SidebarProvider>
              <ApiKeysProvider>
                <SettingsProvider>
                  <FacebookPageProvider>
                    <HashRouter>
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignupPage />} />
                        <Route
                          path="/*"
                          element={
                            <ProtectedRoute>
                              <LicenseGate>
                                <AuthenticatedApp />
                              </LicenseGate>
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </HashRouter>
                  </FacebookPageProvider>
                </SettingsProvider>
              </ApiKeysProvider>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </>
  );
};

export default App;