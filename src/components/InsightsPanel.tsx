import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Hash, Zap, Lightbulb, BarChart3, PieChart, Activity, Users, Star, Calendar, ArrowUpRight, User } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, LineChart, Line 
} from 'recharts';

interface InsightsProps {
  topTags: { tag: string; count: number }[];
  topVibes: { vibe: string; count: number }[];
  dailyTip: string;
  activeUsers: number;
  stats: {
    totalSaved: number;
    favoritesCount: number;
    avgSavesPerWeek: number;
    topCategory: string;
    topSource: string;
    categoryDistribution: { name: string; value: number }[];
    sourceDistribution: { name: string; value: number }[];
    weeklyTrend: { day: string; count: number }[];
  };
  aiInsights: string;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

export function InsightsPanel({ topTags, topVibes, dailyTip, activeUsers, stats, aiInsights }: InsightsProps) {
  return (
    <div className="space-y-8">
      {/* Real-time Collaboration Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-1 rounded-[2.5rem] shadow-xl"
      >
        <div className="bg-white dark:bg-gray-950 rounded-[2.4rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600">
                <Users size={32} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white dark:border-gray-950 rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Live Collaboration</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">You are currently syncing with {activeUsers} other digital souls.</p>
            </div>
          </div>
          <div className="flex -space-x-3">
            {Array.from({ length: Math.min(activeUsers, 5) }).map((_, i) => (
              <motion.div 
                key={i}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-950 bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-400"
              >
                <User size={20} />
              </motion.div>
            ))}
            {activeUsers > 5 && (
              <div className="w-12 h-12 rounded-full border-4 border-white dark:border-gray-950 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                +{activeUsers - 5}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Saved', value: stats.totalSaved, icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
          { label: 'Favorites', value: stats.favoritesCount, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
          { label: 'Avg / Week', value: stats.avgSavesPerWeek, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Top Source', value: stats.topSource, icon: ArrowUpRight, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`${stat.bg} p-6 rounded-3xl border border-black/5 dark:border-white/5`}
          >
            <stat.icon className={`${stat.color} mb-3`} size={24} />
            <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Charts Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" />
                Weekly Activity
              </h3>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                <PieChart size={18} className="text-purple-600" />
                Categories
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={stats.categoryDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categoryDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                <BarChart3 size={18} className="text-pink-600" />
                Top Sources
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.sourceDistribution}>
                    <XAxis dataKey="name" hide />
                    <Tooltip />
                    <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* AI Insights & Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40"
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap size={20} className="text-indigo-200" />
              <h3 className="text-lg font-black uppercase tracking-tighter">AI Habit Insight</h3>
            </div>
            <p className="text-sm text-indigo-100 leading-relaxed italic">
              "{aiInsights || "Analyzing your saving patterns to provide personalized growth tips..."}"
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Updated Daily</span>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-indigo-600 bg-indigo-400" />
                ))}
              </div>
            </div>
          </motion.div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-orange-600" />
              Trending Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {topTags.map((t, i) => (
                <span 
                  key={i} 
                  className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-bold border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-default"
                >
                  #{t.tag} <span className="text-indigo-500 ml-1">{t.count}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
              <Star size={18} className="text-yellow-500" />
              Mood Tracking
            </h3>
            <div className="space-y-4">
              {topVibes.slice(0, 3).map((v, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 capitalize">{v.vibe}</span>
                  <div className="flex-1 mx-4 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full" 
                      style={{ width: `${(v.count / (topVibes[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-gray-400">{v.count}</span>
                </div>
              ))}
              {topVibes.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center">Save more items to track your mood.</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 p-8 rounded-[2.5rem] border border-yellow-100 dark:border-yellow-900/20">
            <div className="flex items-center gap-2 mb-4 text-yellow-700 dark:text-yellow-400 font-black uppercase tracking-tighter">
              <Lightbulb size={20} />
              <h4>Daily Tip</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
              {dailyTip || "Loading your daily inspiration..."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
