import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Palette, Trophy, Sparkles, Layout } from 'lucide-react';
import { themes } from '../lib/theme';

interface OnboardingProps {
  onComplete: (preferences: any) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState({
    theme: 'default',
    layout: 'grid'
  });

  const steps = [
    {
      title: "Welcome to Social Saver",
      description: "Your personal knowledge base for everything you save on social media.",
      icon: <Sparkles size={48} className="text-yellow-400" />,
      content: null
    },
    {
      title: "Choose Your Vibe",
      description: "Select a theme that matches your style.",
      icon: <Palette size={48} className="text-purple-500" />,
      content: (
        <div className="grid grid-cols-2 gap-4 mt-6">
          {Object.entries(themes).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setPreferences({ ...preferences, theme: key })}
              className={`p-4 rounded-xl border-2 transition-all ${
                preferences.theme === key 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-full h-12 rounded-lg mb-2 bg-${theme.colors.primary}-500 opacity-80`} />
              <span className="font-medium text-sm">{theme.name}</span>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Gamify Your Life",
      description: "Earn points and badges for saving and remixing content.",
      icon: <Trophy size={48} className="text-orange-500" />,
      content: (
        <div className="mt-6 bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <Trophy size={24} className="text-orange-500" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Level 1: Novice Saver</h4>
              <p className="text-xs text-gray-500">0 / 100 XP</p>
            </div>
          </div>
          <div className="w-full bg-orange-200 h-2 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-orange-500" />
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(preferences);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <motion.div
              key={step}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {steps[step].icon}
            </motion.div>
          </div>
          
          <motion.div
            key={`text-${step}`}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{steps[step].title}</h2>
            <p className="text-gray-500">{steps[step].description}</p>
          </motion.div>

          <div className="min-h-[200px]">
            {steps[step].content}
          </div>

          <div className="flex items-center justify-between mt-8">
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} 
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors"
            >
              {step === steps.length - 1 ? 'Get Started' : 'Next'}
              {step === steps.length - 1 ? <Check size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
