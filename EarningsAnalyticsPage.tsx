import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Spinner from './components/Spinner.tsx';
import { useNotification } from './src/contexts/NotificationContext.tsx';
import { FBPage, PageInsightsSummary, InsightDataPoint, TopEngagingPost, ManagedPost } from './types.ts';
import { GenerateIcon, ThumbsUpIcon, ChatBubbleIcon, EyeIcon } from './components/IconComponents.tsx';
import * as geminiService from './services/geminiService.ts';
import { useFacebookPage } from './src/contexts/FacebookPageContext.tsx';
import FacebookLoginPrompt from './components/FacebookLoginPrompt.tsx';

// --- CONSTANTS ---
const API_VERSION = 'v19.0';

// --- HELPER COMPONENTS ---
const KPICard: React.FC<{ title: string; value: string; description: string }> = ({ title, value, description }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50 transform transition-transform hover:-translate-y-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{description}</p>
    </div>
);

const FollowerGrowthChart: React.FC<{ data: InsightDataPoint[] }> = ({ data }) => {
    const values = data.map(d => d.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(...values);
    const range = maxVal - minVal;

    const getPointY = (value: number) => {
        if (range === 0) return 50;
        return 100 - ((value - minVal) / range) * 100;
    };
    
    const pathData = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = getPointY(d.value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Follower Growth (Net)</h3>
            <div className="h-64 relative">
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d={pathData} fill="none" stroke="var(--app-primary-color, #6366F1)" strokeWidth="0.5" />
                </svg>
                <div className="absolute inset-0 flex justify-between items-center text-xs text-gray-400">
                    <span>{data[0]?.date}</span>
                    <span>{data[data.length-1]?.date}</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
const PageInsightsPage: React.FC = () => {
    const { addNotification } = useNotification();
    const { isAuthenticated, activePage, logout } = useFacebookPage();
    
    // Data State
    const [summaryData, setSummaryData] = useState<PageInsightsSummary | null>(null);
    const [isFetchingData, setIsFetchingData] = useState(true);
    const [aiInsights, setAiInsights] = useState<string | null>(null);
    const [isFetchingInsights, setIsFetchingInsights] = useState(false);
    const [sortKey, setSortKey] = useState<keyof TopEngagingPost>('engagement');
    
    const fetchInsightsData = useCallback(async (page: FBPage) => {
        setIsFetchingData(true);
        setAiInsights(null);
        setSummaryData(null);

        try {
            const until = Math.floor(Date.now() / 1000);
            const since = until - (28 * 24 * 60 * 60); // 28 days ago

            const pageInsightsBatch = [
                { method: 'GET', relative_url: `/${page.id}/insights?metric=page_fans&period=day`},
                { method: 'GET', relative_url: `/${page.id}/insights?metric=page_fan_adds_unique&period=day&since=${since}&until=${until}`},
                { method: 'GET', relative_url: `/${page.id}/insights?metric=page_fan_removes_unique&period=day&since=${since}&until=${until}`},
                { method: 'GET', relative_url: `/${page.id}/insights?metric=page_impressions_unique&period=day_28`},
                { method: 'GET', relative_url: `/${page.id}/insights?metric=page_engaged_users&period=day_28`},
            ];

            const formData = new FormData();
            formData.append('access_token', page.access_token);
            formData.append('batch', JSON.stringify(pageInsightsBatch));
            
            const response = await fetch(`https://graph.facebook.com/${API_VERSION}`, { method: 'POST', body: formData });
            const batchData = await response.json();

            if (batchData.error) throw new Error(`Batch request for page insights failed: ${batchData.error.message}`);
            
            // Helper to parse results
            const getResult = (index: number) => {
                 if (batchData[index]?.code === 200) {
                    try { return JSON.parse(batchData[index].body).data[0]; } catch { return null; }
                 }
                 return null;
            };

            const totalFollowers = getResult(0)?.values.slice(-1)[0]?.value || 0;
            const fanAdds = getResult(1)?.values || [];
            const fanRemoves = getResult(2)?.values || [];
            const totalReach = getResult(3)?.values[0]?.value || 0;
            const totalEngagement = getResult(4)?.values[0]?.value || 0;
            
            let newFollowers = 0;
            const followerChartData: InsightDataPoint[] = [];
            const fanAddsMap = new Map(fanAdds.map((item: any) => [item.end_time.split('T')[0], item.value]));
            const fanRemovesMap = new Map(fanRemoves.map((item: any) => [item.end_time.split('T')[0], item.value]));
            
            for (let i = 0; i < 28; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const addsRaw = fanAddsMap.get(dateStr);
                const removesRaw = fanRemovesMap.get(dateStr);
                const adds = typeof addsRaw === 'number' ? addsRaw : 0;
                const removes = typeof removesRaw === 'number' ? removesRaw : 0;
                const netChange = adds - removes;
                newFollowers += netChange;
                followerChartData.unshift({ date: d.toLocaleDateString('en-us',{month: 'short', day: 'numeric'}), value: netChange });
            }

            // Fetch top posts
            const postsUrl = `https://graph.facebook.com/${API_VERSION}/${page.id}/posts?fields=id,message,full_picture,created_time,likes.summary(true),comments.summary(true)&limit=25&access_token=${page.access_token}`;
            const postsResponse = await fetch(postsUrl);
            const postsData = await postsResponse.json();
            if (postsData.error) throw new Error(`Failed to fetch posts: ${postsData.error.message}`);
            
            const latestPosts: ManagedPost[] = postsData.data || [];
            let topPosts: TopEngagingPost[] = [];

            if (latestPosts.length > 0) {
                 const postInsightsBatch = latestPosts.map(post => ({
                    method: 'GET',
                    relative_url: `/${post.id}/insights?metric=post_impressions_unique,post_engaged_users&period=lifetime`
                }));
                
                const postFormData = new FormData();
                postFormData.append('access_token', page.access_token);
                postFormData.append('batch', JSON.stringify(postInsightsBatch));
                const postBatchResponse = await fetch(`https://graph.facebook.com/${API_VERSION}`, { method: 'POST', body: postFormData });
                const postBatchData = await postBatchResponse.json();

                if (postBatchData.error) console.error(`Batch request for post insights failed: ${postBatchData.error.message}`);
                else {
                    topPosts = latestPosts.map((post, index) => {
                        const res = postBatchData[index];
                        if (res?.code === 200) {
                             try {
                                const body = JSON.parse(res.body);
                                const reach = body.data?.find((m: any) => m.name === 'post_impressions_unique')?.values?.[0]?.value || 0;
                                const engagement = body.data?.find((m: any) => m.name === 'post_engaged_users')?.values?.[0]?.value || 0;
                                return {
                                    id: post.id,
                                    message: post.message || 'No caption',
                                    thumbnail: post.full_picture || `https://via.placeholder.com/100/F3F4F6/9CA3AF?text=No+Img`,
                                    reach: reach,
                                    engagement: engagement,
                                    likes: post.likes?.summary.total_count || 0,
                                    comments: post.comments?.summary.total_count || 0,
                                };
                            } catch(e) { /* ignore */ }
                        }
                        return null;
                    }).filter((p): p is TopEngagingPost => p !== null);
                }
            }
            
            setSummaryData({
                totalFollowers,
                newFollowers,
                totalReach,
                totalEngagement,
                followerChartData,
                topPosts
            });

        } catch (e: any) {
            const message = (e.message || '').toLowerCase();
            if (message.includes('session') || message.includes('token') || message.includes('oauth')) {
                logout();
            } else {
                addNotification(e.message, 'error');
            }
            setSummaryData(null);
        } finally {
            setIsFetchingData(false);
        }
    }, [addNotification, logout]);


    useEffect(() => {
        if (activePage) {
            fetchInsightsData(activePage);
        }
    }, [activePage, fetchInsightsData]);

    const handleGetAiInsights = async () => {
        if (!summaryData || !activePage) return;
        setIsFetchingInsights(true);
        try {
            const insights = await geminiService.getPageInsights(JSON.stringify(summaryData), activePage.name);
            setAiInsights(insights);
            addNotification("AI Insights generated successfully!", "success");
        } catch(e: any) {
            addNotification(`Error generating AI insights: ${e.message}`, "error");
        } finally {
            setIsFetchingInsights(false);
        }
    }
    
    const sortedTopPosts = useMemo(() => {
        if (!summaryData) return [];
        return [...summaryData.topPosts].sort((a, b) => {
            const valA = a[sortKey];
            const valB = b[sortKey];
            if (typeof valA === 'number' && typeof valB === 'number') {
                return valB - valA;
            }
            return 0;
        });
    }, [summaryData, sortKey]);

    if (!isAuthenticated || !activePage) {
        return <FacebookLoginPrompt title="Page Insights" subtitle="Connect to Facebook to view your page insights." />;
    }
    
    return (
         <div className="p-4 md:p-6 lg:p-8 space-y-8">
             <div className="p-4 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50">
                <h1 className="text-2xl font-bold">Page Insights</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                   Viewing insights for: <span className="font-semibold text-primary">{activePage.name}</span>
                </p>
            </div>

            {isFetchingData ? (
                <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>
            ) : summaryData ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KPICard title="Total Followers" value={summaryData.totalFollowers.toLocaleString()} description="Current page likes" />
                        <KPICard title="New Followers" value={`${summaryData.newFollowers > 0 ? '+' : ''}${summaryData.newFollowers.toLocaleString()}`} description="Last 28 days" />
                        <KPICard title="Total Reach" value={summaryData.totalReach.toLocaleString()} description="Last 28 days" />
                        <KPICard title="Total Engagement" value={summaryData.totalEngagement.toLocaleString()} description="Last 28 days" />
                    </div>
                    
                    <FollowerGrowthChart data={summaryData.followerChartData} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Top Posts</h3>
                                <select value={sortKey} onChange={e => setSortKey(e.target.value as keyof TopEngagingPost)} className="p-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 text-sm">
                                    <option value="engagement">By Engagement</option>
                                    <option value="reach">By Reach</option>
                                    <option value="likes">By Likes</option>
                                    <option value="comments">By Comments</option>
                                </select>
                             </div>
                             <div className="overflow-x-auto">
                                 <table className="w-full text-sm text-left">
                                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                         <tr>
                                             <th scope="col" className="px-4 py-3">Post</th>
                                             <th scope="col" className="px-4 py-3 text-right">Reach</th>
                                             <th scope="col" className="px-4 py-3 text-right">Engagement</th>
                                             <th scope="col" className="px-4 py-3 text-right"><ThumbsUpIcon className="w-4 h-4 inline-block" /></th>
                                             <th scope="col" className="px-4 py-3 text-right"><ChatBubbleIcon className="w-4 h-4 inline-block" /></th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                        {sortedTopPosts.length > 0 ? sortedTopPosts.map(post => (
                                            <tr key={post.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-3 font-medium flex items-center gap-3">
                                                    <img src={post.thumbnail} alt="" className="w-10 h-10 object-cover rounded-md"/>
                                                    <span className="truncate w-40" title={post.message}>{post.message}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold">{post.reach.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right font-semibold">{post.engagement.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right">{post.likes.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-right">{post.comments.toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-gray-500">No posts with engagement data found.</td>
                                            </tr>
                                        )}
                                     </tbody>
                                 </table>
                             </div>
                        </div>

                         <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700/50">
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">AI-Powered Insights</h3>
                                <button onClick={handleGetAiInsights} disabled={isFetchingInsights} className="px-4 py-2 text-sm bg-primary text-primary-text rounded-md hover:bg-primary-hover flex items-center gap-2 disabled:opacity-50">
                                    {isFetchingInsights ? <Spinner size="sm" /> : <GenerateIcon className="w-4 h-4"/>}
                                    {isFetchingInsights ? "Analyzing..." : "Get Insights"}
                                </button>
                             </div>
                             {isFetchingInsights ? (
                                <div className="flex justify-center items-center h-40"><Spinner/></div>
                             ) : aiInsights ? (
                                <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    {aiInsights}
                                </div>
                             ) : (
                                 <div className="text-center py-10 text-gray-500">
                                     <p>Click "Get Insights" for AI-powered tips to improve your engagement.</p>
                                 </div>
                             )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">Could not load insights data.</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please refresh or check your token permissions (e.g., `pages_read_engagement`).</p>
                </div>
            )}
        </div>
    );
};

export default PageInsightsPage;