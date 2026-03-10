import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import io from 'socket.io-client';
import { ItemCard } from './ItemCard';
import { WhatsAppSimulator } from './WhatsAppSimulator';
import { ChatAssistant } from './ChatAssistant';
import { Onboarding } from './Onboarding';
import { GamificationHub } from './GamificationHub';
import { QuickSaveModal } from './QuickSaveModal';
import { InsightsPanel } from './InsightsPanel';
import { CollectionsList } from './CollectionsList';
import { ProfileView } from './ProfileView';
import { DigestModal } from './DigestModal';
import { FeedbackModal } from './FeedbackModal';
import { Search, Filter, Loader2, Sparkles, X, Menu, Dice5, Trophy, Plus, LayoutGrid, Activity, Moon, Sun, User, Newspaper, Hash, Folder, Heart, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { themes } from '../lib/theme';
import { TagManager } from './TagManager';

interface Item {
  id: number;
  url: string;
  source: string;
  type: string;
  summary: string;
  tags: string;
  content: string;
  vibe: string;
  media_url: string | null;
  is_favorite?: boolean;
  notes?: string;
  view_count?: number;
}

export function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [insights, setInsights] = useState({ topTags: [], topVibes: [] });
  const [dailyTip, setDailyTip] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [remixItem, setRemixItem] = useState<Item | null>(null);
  const [remixPrompt, setRemixPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showMobileSimulator, setShowMobileSimulator] = useState(false);
  
  // New State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [showQuickSave, setShowQuickSave] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDigest, setShowDigest] = useState(false);
  const [digestContent, setDigestContent] = useState('');
  const [isGeneratingDigest, setIsGeneratingDigest] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState(1);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'insights' | 'tags' | 'collections' | 'achievements'>('grid');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] = useState<number | null>(null);
  const [collectionItems, setCollectionItems] = useState<number[]>([]);

  const moods = [
    { id: 'inspired', label: 'Inspired', icon: '💡', color: 'bg-yellow-100 text-yellow-700' },
    { id: 'productive', label: 'Productive', icon: '🚀', color: 'bg-blue-100 text-blue-700' },
    { id: 'relaxed', label: 'Relaxed', icon: '☕', color: 'bg-green-100 text-green-700' },
    { id: 'adventurous', label: 'Adventurous', icon: '✈️', color: 'bg-orange-100 text-orange-700' },
    { id: 'creative', label: 'Creative', icon: '🎨', color: 'bg-purple-100 text-purple-700' },
    { id: 'curious', label: 'Curious', icon: '👁️', color: 'bg-indigo-100 text-indigo-700' },
  ];

  const getAvatarUrl = (config: any) => {
    const params = new URLSearchParams({
      seed: config.seed || 'Alex',
      top: config.top || 'shortHair',
      accessories: config.accessories || 'none',
      hairColor: config.hairColor || 'brown',
      facialHair: config.facialHair || 'none',
      clothing: config.clothing || 'shirt',
      skinColor: config.skinColor || 'light'
    });
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  const fetchUserData = async () => {
    try {
      const [userRes, profileRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/profile')
      ]);
      const userData = await userRes.json();
      const profileData = await profileRes.json();
      
      setUserStats(userData.stats);
      setProfile(profileData);
      setCurrentTheme(userData.settings.theme_id);
      
      if (!userData.settings.onboarding_completed) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error("Failed to fetch user data", error);
    }
  };

  const handleGenerateDigest = async () => {
    setIsGeneratingDigest(true);
    try {
        const res = await fetch('/api/digest', { method: 'POST' });
        const data = await res.json();
        setDigestContent(data.digest);
        setShowDigest(true);
    } catch (error) {
        console.error("Failed to generate digest", error);
    } finally {
        setIsGeneratingDigest(false);
    }
  };

  const handleThemeToggle = async () => {
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme })
      });
      setCurrentTheme(newTheme);
    } catch (error) {
      console.error("Failed to toggle theme", error);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/items');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExtras = async () => {
    try {
      const [colRes, insRes, tipRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/insights'),
        fetch('/api/daily-tip')
      ]);
      setCollections(await colRes.json());
      setInsights(await insRes.json());
      const tipData = await tipRes.json();
      setDailyTip(tipData.tip);
    } catch (error) {
      console.error("Failed to fetch extras", error);
    }
  };

  const fetchCollectionItems = async (id: number) => {
    try {
        const res = await fetch(`/api/collections/${id}/items`);
        const data = await res.json();
        setCollectionItems(data.map((i: any) => i.item_id));
    } catch (error) {
        console.error("Failed to fetch collection items", error);
    }
  };

  useEffect(() => {
    if (selectedCollectionId) {
        fetchCollectionItems(selectedCollectionId);
    } else {
        setCollectionItems([]);
    }
  }, [selectedCollectionId]);

  useEffect(() => {
    const socket = io();
    socket.on('presence:update', ({ count }) => setActiveUsers(count));
    socket.on('item:created', (newItem) => {
      setItems(prev => {
        if (prev.find(i => i.id === newItem.id)) return prev;
        return [newItem, ...prev];
      });
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f46e5', '#9333ea']
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchItems();
    fetchUserData();
    fetchExtras();
  }, []);

  const handleWhatsAppMessage = async (text: string, url?: string) => {
    if (!url) return;
    await saveItem(url, text);
  };

  const saveItem = async (url: string, content: string, mood?: string) => {
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, content, mood })
      });
      
      if (res.ok) {
        const data = await res.json();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        fetchItems();
        fetchUserData();
        fetchExtras();
        
        if (data.newBadges && data.newBadges.length > 0) {
            alert(`🎉 You earned a new badge: ${data.newBadges[0].name}!`);
        }
      }
    } catch (error) {
      console.error("Failed to save item", error);
    }
  };

  const handleAddToCollection = async (itemId: number, collectionId: number) => {
    try {
        const res = await fetch(`/api/collections/${collectionId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId })
        });
        if (res.ok) {
            // If we are currently viewing this collection, refresh its items
            if (selectedCollectionId === collectionId) {
                fetchCollectionItems(collectionId);
            }
        }
    } catch (error) {
        console.error("Failed to add to collection", error);
    }
  };

  const handleCreateCollection = async (name: string, color: string, description: string) => {
    try {
        await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, color, description, icon: 'folder' })
        });
        fetchExtras();
    } catch (error) {
        console.error("Failed to create collection", error);
    }
  };

  const handleOnboardingComplete = async (prefs: any) => {
    try {
      await fetch('/api/user/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            theme: prefs.theme, 
            onboarding_completed: true 
        })
      });
      setCurrentTheme(prefs.theme);
      setShowOnboarding(false);
      confetti();
    } catch (error) {
      console.error("Failed to save settings", error);
    }
  };

  const handleRemix = async () => {
    if (!remixItem || !remixPrompt) return;
    setIsGeneratingVideo(true);
    
    try {
        const res = await fetch('/api/generate-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: remixPrompt })
        });
        
        const data = await res.json();
        if (res.ok && data.videoUri) {
            // Update the item in the local state
            setItems(prev => prev.map(item => 
                item.id === remixItem.id ? { ...item, remix_url: data.videoUri } : item
            ));
            setRemixItem(null);
            setRemixPrompt('');
            confetti();
        } else if (data.status === 'processing') {
            alert("Video generation is in progress. It will appear on the card once ready.");
            setRemixItem(null);
        }
    } catch (error) {
        console.error("Remix failed", error);
        alert("Video generation failed. Please try again.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  const handleRandomInspiration = () => {
    if (items.length === 0) return;
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const element = document.getElementById(`item-${randomItem.id}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-indigo-500', 'ring-offset-2');
        setTimeout(() => element.classList.remove('ring-4', 'ring-indigo-500', 'ring-offset-2'), 2000);
    }
    confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.5 }
    });
  };

  const handleUpdateItem = async (id: number, updates: any) => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
      }
    } catch (error) {
      console.error("Failed to update item", error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const res = await fetch(`/api/items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
        confetti();
      }
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const handleExport = (format: 'json' | 'csv') => {
    const dataToExport = filteredItems;
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-saver-export-${new Date().toISOString()}.json`;
      a.click();
    } else {
      const headers = ['id', 'url', 'source', 'type', 'summary', 'tags', 'vibe', 'is_favorite', 'notes', 'view_count'];
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(item => headers.map(h => JSON.stringify((item as any)[h] || '')).join(','))
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `social-saver-export-${new Date().toISOString()}.csv`;
      a.click();
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.summary?.toLowerCase().includes(search.toLowerCase()) || 
                          item.tags?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesMood = !selectedMood || item.vibe?.toLowerCase().includes(selectedMood.toLowerCase());
    const matchesFavorite = !showFavoritesOnly || item.is_favorite;
    const matchesCollection = !selectedCollectionId || collectionItems.includes(item.id);
    return matchesSearch && matchesFilter && matchesMood && matchesFavorite && matchesCollection;
  });

  // Theme Config
  const theme = themes[currentTheme as keyof typeof themes] || themes.default;
  const bgClass = `bg-${theme.colors.background}`;

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [currentTheme]);

  return (
    <div className={`min-h-screen ${bgClass} dark:bg-gray-900 flex flex-col lg:flex-row overflow-hidden transition-colors duration-500 font-sans`}>
      {/* Onboarding Overlay */}
      {showOnboarding && <Onboarding onComplete={handleOnboardingComplete} />}

      {/* Quick Save Modal */}
      <QuickSaveModal 
        isOpen={showQuickSave} 
        onClose={() => setShowQuickSave(false)} 
        onSave={saveItem} 
      />

      {/* Gamification Hub */}
      {userStats && (
        <GamificationHub 
            stats={userStats} 
            isOpen={showGamification} 
            onClose={() => setShowGamification(false)} 
        />
      )}

      {/* Left Sidebar: WhatsApp & Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-full lg:w-[400px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transform transition-transform duration-500 ease-in-out
        ${showMobileSimulator ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex
      `}>
        <div className="p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white flex items-center gap-2"
                >
                    <span className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3">
                        <Sparkles size={20} />
                    </span>
                    SOCIAL SAVER
                </motion.h2>
                <button onClick={() => setShowMobileSimulator(false)} className="lg:hidden p-2 text-gray-500 dark:text-gray-400">
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-8">
                <nav className="space-y-2">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <LayoutGrid size={20} />
                        <span className="font-bold text-sm">Dashboard</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('insights')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${viewMode === 'insights' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Activity size={20} />
                        <span className="font-bold text-sm">Insights</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('collections')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${viewMode === 'collections' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Folder size={20} />
                        <span className="font-bold text-sm">Collections</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('achievements')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${viewMode === 'achievements' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Trophy size={20} />
                        <span className="font-bold text-sm">Achievements</span>
                    </button>
                    <button 
                        onClick={() => setViewMode('tags')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${viewMode === 'tags' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <Hash size={20} />
                        <span className="font-bold text-sm">Manage Tags</span>
                    </button>
                </nav>

                <section>
                    <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Live Simulator</h3>
                    <WhatsAppSimulator onSendMessage={handleWhatsAppMessage} />
                </section>

                <section className="bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100/50 dark:border-indigo-800/50">
                    <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
                        <Activity size={14} /> AI Activity
                    </h3>
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 leading-relaxed">
                        Your AI is currently processing {items.length} items. 
                        Top vibe this week: <span className="font-bold">{insights.topVibes[0]?.vibe || 'Curious'}</span>.
                    </p>
                </section>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden border-2 border-white dark:border-gray-600 shadow-sm">
                        <img src={getAvatarUrl(profile?.avatar_config || {})} alt="User" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{profile?.full_name || 'Guest User'}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Level {Math.floor((userStats?.points || 0) / 100) + 1} Curator</p>
                    </div>
                    <button 
                        onClick={() => setShowProfile(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400 dark:text-gray-500"
                    >
                        <User size={20} />
                    </button>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8F9FB] dark:bg-gray-900 relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/20 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-200/20 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Header */}
        <header className="h-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-8 flex items-center justify-between z-20 sticky top-0">
            <div className="flex items-center gap-6 flex-1">
                <button onClick={() => setShowMobileSimulator(true)} className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                    <Menu size={24} />
                </button>
                
                <div className="relative w-full max-w-md hidden md:block group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search your global knowledge..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-100/50 dark:bg-gray-700/50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-gray-700 focus:border-indigo-200 transition-all placeholder:text-gray-400 dark:text-white"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden xl:flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover-glow">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{activeUsers} Active Now</span>
                </div>

                <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block" />

                <button 
                    onClick={() => setShowQuickSave(true)}
                    className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 group hover-lift"
                    title="Quick Save"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <button
                    onClick={handleThemeToggle}
                    className="p-3 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:border-indigo-200"
                >
                    {currentTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button 
                    onClick={() => setShowFeedback(true)}
                    className="p-3 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:border-indigo-200 group"
                    title="Feedback"
                >
                    <MessageSquare size={20} className="group-hover:text-indigo-600 transition-colors" />
                </button>

                <button 
                    onClick={() => setShowProfile(true)}
                    className="p-1 rounded-2xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm hover:ring-4 hover:ring-indigo-500/10 hover:border-indigo-300 transition-all overflow-hidden w-12 h-12 group"
                >
                    <img src={getAvatarUrl(profile?.avatar_config || {})} alt="Profile" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                </button>

                <button 
                    onClick={handleGenerateDigest}
                    disabled={isGeneratingDigest}
                    className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl hover:bg-black dark:hover:bg-gray-100 hover:shadow-gray-300 transition-all active:scale-95 disabled:opacity-70 hover-lift"
                >
                    {isGeneratingDigest ? <Loader2 size={16} className="animate-spin" /> : <Newspaper size={16} />}
                    Rewind
                </button>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-16 scroll-smooth relative z-10">
            {/* Hero Section */}
            <div className="mb-20">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-5xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-indigo-100">
                        <Sparkles size={12} /> Intelligence Layer v3.1
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black tracking-tighter text-gray-900 dark:text-white mb-8 leading-[0.85] uppercase">
                        Archive Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">Digital Soul.</span>
                    </h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-10 leading-relaxed font-medium">
                        Transform scattered social saves into a structured, AI-powered knowledge base. Search, remix, and rediscover your inspirations.
                    </p>
                    <div className="flex flex-wrap gap-4 items-center">
                        <button 
                            onClick={handleRandomInspiration}
                            className="px-10 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:scale-105 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center gap-3 hover-glow"
                        >
                            <Dice5 size={20} /> Get Inspired
                        </button>
                        <div className="flex items-center gap-4 px-8 py-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] border border-gray-200 dark:border-gray-700 shadow-xl shadow-gray-100/50 dark:shadow-black/20">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-inner">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Collector XP</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white">{userStats?.points || 0}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Mood Discovery */}
            <div className="mb-10">
                <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-4">Mood Discovery</h3>
                <div className="flex flex-wrap gap-3">
                    {moods.map(mood => (
                        <button
                            key={mood.id}
                            onClick={() => setSelectedMood(selectedMood === mood.id ? null : mood.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                selectedMood === mood.id 
                                    ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 hover:border-indigo-200'
                            }`}
                        >
                            <span>{mood.icon}</span>
                            {mood.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                    <button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2 ${
                            showFavoritesOnly 
                                ? 'bg-yellow-500 text-white shadow-xl shadow-yellow-200' 
                                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <Heart size={14} className={showFavoritesOnly ? 'fill-white' : ''} />
                        Favorites
                    </button>
                    <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-700 mx-1" />
                    {['all', 'social', 'web', 'video'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                filter === f 
                                    ? `bg-indigo-600 text-white shadow-xl shadow-indigo-200 transform -translate-y-1` 
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'grid' ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid size={16} /> GRID
                        </button>
                        <button 
                            onClick={() => setViewMode('insights')}
                            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold ${viewMode === 'insights' ? 'bg-gray-900 dark:bg-white dark:text-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Activity size={16} /> STATS
                        </button>
                    </div>

                    <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
                        <button 
                            onClick={() => handleExport('json')}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-indigo-600 transition-all flex items-center gap-2"
                        >
                            JSON
                        </button>
                        <button 
                            onClick={() => handleExport('csv')}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-indigo-600 transition-all flex items-center gap-2"
                        >
                            CSV
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {viewMode === 'tags' ? (
                    <motion.div 
                        key="tags"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <TagManager onTagsUpdated={fetchExtras} />
                    </motion.div>
                ) : viewMode === 'insights' ? (
                    <motion.div 
                        key="insights"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12"
                    >
                        <InsightsPanel 
                            topTags={insights.topTags} 
                            topVibes={insights.topVibes} 
                            dailyTip={dailyTip} 
                            activeUsers={activeUsers}
                            stats={{
                                totalSaved: items.length,
                                favoritesCount: items.filter(i => i.is_favorite).length,
                                avgSavesPerWeek: Math.ceil(items.length / 4), // Mock calculation
                                topCategory: 'Social',
                                topSource: 'Instagram',
                                categoryDistribution: [
                                    { name: 'Social', value: items.filter(i => i.type === 'social').length },
                                    { name: 'Web', value: items.filter(i => i.type === 'web').length },
                                    { name: 'Video', value: items.filter(i => i.type === 'video').length },
                                ],
                                sourceDistribution: [
                                    { name: 'Instagram', value: items.filter(i => i.source === 'instagram').length },
                                    { name: 'Twitter', value: items.filter(i => i.source === 'twitter').length },
                                    { name: 'WhatsApp', value: items.filter(i => i.source === 'whatsapp').length },
                                ],
                                weeklyTrend: [
                                    { day: 'Mon', count: 4 },
                                    { day: 'Tue', count: 7 },
                                    { day: 'Wed', count: 5 },
                                    { day: 'Thu', count: 12 },
                                    { day: 'Fri', count: 8 },
                                    { day: 'Sat', count: 15 },
                                    { day: 'Sun', count: 10 },
                                ]
                            }}
                            aiInsights="Your saving habits show a strong interest in visual storytelling and tech innovation. You tend to save most on weekends!"
                        />
                    </motion.div>
                ) : viewMode === 'collections' ? (
                    <motion.div 
                        key="collections"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-12"
                    >
                        <CollectionsList 
                            collections={collections} 
                            onCreateCollection={handleCreateCollection} 
                            onSelectCollection={setSelectedCollectionId}
                            selectedId={selectedCollectionId}
                        />

                        {selectedCollectionId && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-32">
                                <AnimatePresence mode='popLayout'>
                                    {filteredItems.map(item => (
                                        <div id={`item-${item.id}`} key={item.id}>
                                            <ItemCard 
                                                item={item} 
                                                collections={collections}
                                                onRemix={() => {
                                                    setRemixItem(item);
                                                    setRemixPrompt(`Create a video based on: ${item.summary}`);
                                                }} 
                                                onUpdate={handleUpdateItem}
                                                onDelete={handleDeleteItem}
                                                onAddToCollection={handleAddToCollection}
                                            />
                                        </div>
                                    ))}
                                </AnimatePresence>
                                {filteredItems.length === 0 && (
                                    <div className="col-span-full py-20 text-center text-gray-400">
                                        <p className="font-bold uppercase tracking-widest text-xs">No items in this collection matching your filters.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                ) : viewMode === 'achievements' ? (
                    <motion.div 
                        key="achievements"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        <GamificationHub 
                            stats={userStats} 
                            isFullPage={true}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-12"
                    >
                        {/* Collections Horizontal Scroll */}
                        <div className="overflow-x-auto scrollbar-hide -mx-8 px-8">
                            <CollectionsList 
                                collections={collections} 
                                onCreateCollection={handleCreateCollection} 
                            />
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                    <Sparkles className="absolute inset-0 m-auto text-indigo-600" size={24} />
                                </div>
                                <p className="mt-6 font-bold tracking-widest uppercase text-xs">Synchronizing Knowledge...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-32">
                                <AnimatePresence mode='popLayout'>
                                    {filteredItems.map(item => (
                                        <div id={`item-${item.id}`} key={item.id}>
                                            <ItemCard 
                                                item={item} 
                                                collections={collections}
                                                onRemix={() => {
                                                    setRemixItem(item);
                                                    setRemixPrompt(`Create a video based on: ${item.summary}`);
                                                }} 
                                                onUpdate={handleUpdateItem}
                                                onDelete={handleDeleteItem}
                                                onAddToCollection={handleAddToCollection}
                                            />
                                        </div>
                                    ))}
                                </AnimatePresence>
                                {filteredItems.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-32 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-inner">
                                        <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                                            {search ? <Search size={40} className="text-gray-200 dark:text-gray-600" /> : <Sparkles size={40} className="text-gray-200 dark:text-gray-600" />}
                                        </div>
                                        <p className="font-black text-xl text-gray-900 dark:text-white mb-2 uppercase tracking-tight">
                                            {search ? 'No Matches Found' : 'Empty Canvas'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center px-4">
                                            {search 
                                                ? `We couldn't find anything matching "${search}". Try a different keyword or filter.` 
                                                : "Your knowledge base is waiting for its first spark. Save something from WhatsApp to get started!"}
                                        </p>
                                        {search && (
                                            <button 
                                                onClick={() => setSearch('')}
                                                className="mt-6 px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                CLEAR SEARCH
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </main>

      {/* Digest Modal */}
      <DigestModal 
        isOpen={showDigest} 
        onClose={() => setShowDigest(false)} 
        content={digestContent} 
      />

      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={showFeedback} 
        onClose={() => setShowFeedback(false)} 
      />

      {/* Chat Assistant */}
      <ChatAssistant />

      {/* Profile View */}
      <AnimatePresence>
        {showProfile && (
            <ProfileView 
                isOpen={showProfile} 
                onClose={() => setShowProfile(false)} 
                currentTheme={currentTheme}
                onToggleTheme={handleThemeToggle}
            />
        )}
      </AnimatePresence>

      {/* Remix Modal */}
      <AnimatePresence>
        {remixItem && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                onClick={() => setRemixItem(null)}
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl overflow-hidden relative"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    
                    <div className="flex justify-between items-center mb-6 mt-2">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="text-purple-500" size={20} />
                            Remix Content
                        </h3>
                        <button onClick={() => setRemixItem(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="flex gap-4 mb-6">
                        <div className="w-1/3 aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                            {remixItem.media_url ? (
                                <img src={remixItem.media_url} alt="Original" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                    <Sparkles size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Original Summary</h4>
                            <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {remixItem.summary}
                            </p>
                            <div className="mt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">AI Model</h4>
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-medium">
                                    <Sparkles size={10} /> Veo 3.1
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Prompt</label>
                        <textarea 
                            value={remixPrompt}
                            onChange={(e) => setRemixPrompt(e.target.value)}
                            placeholder="Describe how you want to remix this... (e.g., 'Make it cinematic with neon lights')"
                            className="w-full p-4 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none bg-gray-50 focus:bg-white transition-colors"
                            rows={3}
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            onClick={() => setRemixItem(null)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleRemix}
                            disabled={isGeneratingVideo || !remixPrompt}
                            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {isGeneratingVideo ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            {isGeneratingVideo ? 'Generating...' : 'Generate Video'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
