import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Hash, Zap, Lightbulb } from 'lucide-react';

interface InsightsProps {
  topTags: { tag: string; count: number }[];
  topVibes: { vibe: string; count: number }[];
  dailyTip: string;
}

export function InsightsPanel({ topTags, topVibes, dailyTip }: InsightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Daily Tip */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-50 to-orange-50 p-5 rounded-2xl border border-yellow-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3 text-yellow-700 font-bold">
          <Lightbulb size={18} />
          <h4>Daily AI Tip</h4>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {dailyTip || "Loading tip..."}
        </p>
      </motion.div>

      {/* Top Vibes */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3 text-purple-600 font-bold">
          <Zap size={18} />
          <h4>Top Vibes</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {topVibes.map((v, i) => (
            <div key={i} className="flex items-center justify-between w-full text-sm">
              <span className="text-gray-600 capitalize">{v.vibe}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${Math.min(v.count * 10, 100)}%` }} 
                  />
                </div>
                <span className="text-xs font-medium text-gray-400">{v.count}</span>
              </div>
            </div>
          ))}
          {topVibes.length === 0 && <p className="text-xs text-gray-400">No vibes detected yet.</p>}
        </div>
      </motion.div>

      {/* Trending Tags */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold">
          <Hash size={18} />
          <h4>Trending Tags</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {topTags.map((t, i) => (
            <span 
              key={i} 
              className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium"
            >
              #{t.tag} <span className="opacity-50 ml-1">{t.count}</span>
            </span>
          ))}
          {topTags.length === 0 && <p className="text-xs text-gray-400">No tags yet.</p>}
        </div>
      </motion.div>
    </div>
  );
}
