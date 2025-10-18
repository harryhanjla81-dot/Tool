import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
    const sectionClasses = "mt-6 pt-6 border-t border-gray-200 dark:border-gray-700";
    const h2Classes = "text-2xl font-semibold mb-3 text-gray-800 dark:text-gray-200";
    const h3Classes = "text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300";
    const pClasses = "mb-4 leading-relaxed";
    const ulClasses = "list-disc list-inside space-y-2 mb-4 pl-4";
    const liClasses = "text-gray-600 dark:text-gray-400";
    const appName = "Hanjla Harry"; // Exact name from Meta dashboard

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 max-w-4xl mx-auto text-gray-700 dark:text-gray-300">
                <h1 className="text-4xl font-bold text-center mb-2 text-primary">Privacy Policy for {appName}</h1>
                <p className="text-center text-gray-500 mb-8"><strong>Last Updated: September 20, 2024</strong></p>
                
                <p className={pClasses}>Welcome to the {appName} application ("the App"). We are committed to protecting your privacy. This Privacy Policy explains how we handle your information when you use our application. Since our App is a client-side tool, our data practices are designed with your privacy as the top priority.</p>
                <p className={pClasses}><strong>Our core privacy promise: We do not have servers that store your personal data, Facebook data, or API keys. All sensitive information is stored locally on your device in your browser's local storage.</strong></p>


                <div className={sectionClasses}>
                    <h2 className={h2Classes}>Information We Handle and How We Use It</h2>
                    <p className={pClasses}>Our application requires access to certain information to provide its features. This data is handled entirely on your device.</p>
                    
                    <h3 className={h3Classes}>1. Facebook Page Data and Permissions</h3>
                    <p className={pClasses}>To provide its core functionality, the App requests specific permissions to access your Facebook data on your behalf. All API calls are made directly from your browser to Facebook's servers. We do not store this data on our servers. Here is a detailed breakdown of each permission and why we need it:</p>
                    <ul className={ulClasses}>
                        <li className={liClasses}>
                            <strong>publish_video (part of pages_manage_posts):</strong> This permission is essential for the "Scheduler" and "Cross-Post" features. It allows you to upload, schedule, and publish video content directly to your selected Facebook Page from within the App. The App uses the Graph API's <code>{'/{page-id}/videos'}</code> endpoint to perform this action.
                        </li>
                        <li className={liClasses}>
                            <strong>Page Mentions:</strong> This permission enables you to tag or "@mention" other Facebook Pages in the captions of your posts. This is a standard feature for creating engaging content and is used in the content creation sections of the App.
                        </li>
                        <li className={liClasses}>
                            <strong>Page Public Content Access:</strong> This permission allows the App to access public information (like posts and comments) from Facebook Pages. This is used in the "Audience Insights" feature to help you analyze trends and find inspiration for new content. We only process this data for analysis and do not store it.
                        </li>
                        <li className={liClasses}>
                            <strong>pages_show_list, pages_read_engagement:</strong> Used to list your managed pages so you can select which one to work with and to read post engagement data (likes, comments, reach) for the "Manage Posts" and "Audience Insights" dashboards.
                        </li>
                        <li className={liClasses}>
                            <strong>pages_manage_posts:</strong> A general permission required to create, edit, delete, and manage posts (including images and videos) on your behalf.
                        </li>
                        <li className={liClasses}>
                            <strong>pages_messaging:</strong> Powers the "Inbox" feature, allowing you to fetch conversations and send replies to users who message your Page.
                        </li>
                        <li className={liClasses}>
                            <strong>read_insights:</strong> Used to fetch analytics about your Page's performance (e.g., follower growth) for the "Audience Insights" dashboard.
                        </li>
                        <li className={liClasses}>
                            <strong>Your Facebook User Access Token:</strong> This token is required to make any API requests. It is stored securely in your browser's local storage and is never sent to our servers.
                        </li>
                    </ul>

                    <h3 className={h3Classes}>2. Third-Party API Keys (e.g., Google Gemini)</h3>
                    <p className={pClasses}>The App uses AI services to generate content. You must provide your own API key for these services.</p>
                    <ul className={ulClasses}>
                        <li className={liClasses}><strong>Storage:</strong> Your API keys are stored in your browser's local storage only. They are never transmitted to our servers.</li>
                        <li className={liClasses}><strong>Usage:</strong> The keys are used to make direct API calls from your browser to the provider (e.g., Google) to generate text and images.</li>
                    </ul>

                    <h3 className={h3Classes}>3. User Account Information (Firebase Authentication)</h3>
                    <p className={pClasses}>We use Firebase Authentication for user login and account management.</p>
                     <ul className={ulClasses}>
                        <li className={liClasses}><strong>Data Collected:</strong> We collect your email, password (hashed), full name, phone number, and optional profile picture.</li>
                        <li className={liClasses}><strong>Usage:</strong> This information is used solely for authentication, securing your account, and personalizing your app experience.</li>
                    </ul>
                    
                    <h3 className={h3Classes}>4. Community Chat Data (Firebase Realtime Database)</h3>
                    <p className={pClasses}>Our Community Chat feature allows real-time interaction between users.</p>
                    <ul className={ulClasses}>
                        <li className={liClasses}><strong>Data Stored:</strong> Chat messages, your user ID, and timestamps are stored in Firebase Realtime Database.</li>
                        <li className={liClasses}><strong>Usage:</strong> This data is used only to operate the chat room.</li>
                    </ul>
                </div>

                <div className={sectionClasses}>
                    <h2 className={h2Classes}>Data Deletion</h2>
                    <p className={pClasses}>You have full control over your data. To remove your data from the App, you can perform the following actions:</p>
                    <ul className={ulClasses}>
                        <li className={liClasses}><strong>Clear Browser Data:</strong> Clearing your browser's cache and local storage for this site will remove all locally stored data, including your Facebook Access Token and API keys.</li>
                        <li className={liClasses}><strong>Revoke App Permissions on Facebook:</strong> This is the most important step. To completely disconnect the App from your Facebook account, you must visit your Facebook settings and revoke permissions for the "{appName}" app. This will invalidate the access token and ensure the App can no longer access your data. You can manage your connected apps here: <a href="https://www.facebook.com/settings?tab=applications" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook Apps and Websites Settings</a>.</li>
                        <li className={liClasses}><strong>Delete Your App Account:</strong> To permanently delete your authentication account and associated data (name, email, etc.), please contact us at the email address provided below.</li>
                    </ul>
                </div>
                
                <div className={sectionClasses}>
                    <h2 className={h2Classes}>Compliance with Facebook Platform Policies</h2>
                    <p className={pClasses}>This application is designed for compliance with the <a href="https://developers.facebook.com/terms/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Facebook Platform Terms</a> and <a href="https://developers.facebook.com/devpolicy/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Developer Policies</a>. The features provided are intended to help you manage your own content effectively and are to be used in a manner that respects these policies.</p>
                </div>

                <div className={sectionClasses}>
                    <h2 className={h2Classes}>Contact Us</h2>
                    <p className={pClasses}>If you have questions about this Privacy Policy, please contact us at:</p>
                    <p className="font-semibold">Hanjla Harry</p>
                    <p><a href="mailto:Hanjla@proton.me" className="text-primary hover:underline">Hanjla@proton.me</a></p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;