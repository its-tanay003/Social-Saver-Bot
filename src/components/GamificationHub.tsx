import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Award, Flame } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface UserStats {
  points: number;
  level: number;
  streak_days: number;
  badges: Badge[];
}

interface GamificationHubProps {
  stats: UserStats;
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, any> = {
  bookmark: Star,
  zap: Trophy,
  wand: Award,
  flame: Flame
};

export function GamificationHub({ stats, isOpen, onClose }: GamificationHubProps) {
  if (!isOpen) return null;

  const progress = (stats.points % 100); // Simple level logic

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" /> Achievements
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        {/* Level Card */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-indigo-100 font-medium mb-1">Current Level</p>
              <h3 className="text-4xl font-bold">{stats.level}</h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{stats.points}</p>
              <p className="text-indigo-100 text-sm">Total Points</p>
            </div>
          </div>

          <div className="relative h-3 bg-black/20 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full"
            />
          </div>
          <p className="text-xs text-indigo-100 mt-2 text-right">{100 - progress} points to next level</p>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100 mb-8">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Flame className="text-orange-500" size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{stats.streak_days} Day Streak</h4>
            <p className="text-sm text-gray-500">Keep saving daily to maintain it!</p>
          </div>
        </div>

        {/* Badges */}
        <h3 className="text-lg font-bold mb-4">Badges</h3>
        <div className="grid grid-cols-2 gap-4">
          {stats.badges.map((badge) => {
            const Icon = iconMap[badge.icon] || Star;
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-xl border-2 flex flex-col items-center text-center transition-all ${
                  badge.earned 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-100 bg-gray-50 opacity-60 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  badge.earned ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-200 text-gray-400'
                }`}>
                  <Icon size={24} />
                </div>
                <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                <p className="text-xs text-gray-500">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
