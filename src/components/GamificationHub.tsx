import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Award, Flame, Check } from 'lucide-react';

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
  isOpen?: boolean;
  onClose?: () => void;
  isFullPage?: boolean;
}

const iconMap: Record<string, any> = {
  bookmark: Star,
  zap: Trophy,
  wand: Award,
  flame: Flame
};

export function GamificationHub({ stats, isOpen, onClose, isFullPage = false }: GamificationHubProps) {
  if (!isFullPage && !isOpen) return null;

  const progress = (stats.points % 100); // Simple level logic

  const content = (
    <div className={`${isFullPage ? 'w-full' : 'w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-6 overflow-y-auto'}`}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black flex items-center gap-2 text-gray-900 dark:text-white uppercase tracking-tighter">
          <Trophy className="text-yellow-500" /> Achievements
        </h2>
        {!isFullPage && onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">Close</button>
        )}
      </div>

      {/* Level Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px] mb-2">Current Level</p>
            <h3 className="text-6xl font-black tracking-tighter">{stats.level}</h3>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black tracking-tighter">{stats.points}</p>
            <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px]">Total Points</p>
          </div>
        </div>

        <div className="relative h-4 bg-black/20 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"
          />
        </div>
        <p className="text-[10px] font-bold text-indigo-100 mt-3 text-right uppercase tracking-widest">{100 - progress} points to next level</p>
      </div>

      {/* Streak */}
      <div className="flex items-center gap-6 bg-orange-50 dark:bg-orange-900/10 p-6 rounded-[2rem] border border-orange-100 dark:border-orange-900/20 mb-8">
        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center shadow-inner">
          <Flame className="text-orange-500" size={28} />
        </div>
        <div>
          <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-lg">{stats.streak_days} Day Streak</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Keep saving daily to maintain your momentum!</p>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="mb-8">
        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 px-2 flex items-center gap-2">
          <Star size={16} className="text-indigo-500" /> Daily Challenges
        </h3>
        <div className="space-y-3">
          {[
            { title: "Save 3 new items", progress: 1, total: 3, xp: 50 },
            { title: "Remix an image", progress: 0, total: 1, xp: 100 },
            { title: "Read a saved article", progress: 1, total: 1, xp: 20, done: true }
          ].map((challenge, i) => (
            <div key={i} className={`p-4 rounded-2xl border ${challenge.done ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'} flex items-center justify-between shadow-sm`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${challenge.done ? 'bg-green-100 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {challenge.done ? <Check size={14} /> : <Star size={14} />}
                </div>
                <div>
                  <p className={`text-sm font-bold ${challenge.done ? 'text-green-800 dark:text-green-400 line-through opacity-70' : 'text-gray-900 dark:text-white'}`}>{challenge.title}</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">+{challenge.xp} XP</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-gray-500">{challenge.progress} / {challenge.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-6 px-2">Unlocked Badges</h3>
      <div className={`grid ${isFullPage ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-2'} gap-4`}>
        {stats.badges.map((badge) => {
          const Icon = iconMap[badge.icon] || Star;
          return (
            <motion.div 
              key={badge.id}
              whileHover={badge.earned ? { y: -5, scale: 1.02 } : {}}
              className={`p-6 rounded-[2rem] border-2 flex flex-col items-center text-center transition-all ${
                badge.earned 
                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/10 shadow-lg shadow-yellow-100 dark:shadow-none' 
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 opacity-40 grayscale'
              }`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${
                badge.earned ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                <Icon size={32} />
              </div>
              <h4 className="font-black text-gray-900 dark:text-white text-sm mb-1 uppercase tracking-tight">{badge.name}</h4>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{badge.description}</p>
              {badge.earned && (
                <div className="mt-4 px-3 py-1 bg-yellow-400 text-yellow-900 text-[8px] font-black uppercase tracking-widest rounded-full">
                  UNLOCKED
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  if (isFullPage) return content;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-end">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-6 overflow-y-auto"
      >
        {content}
      </motion.div>
    </div>
  );
}
