import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Link as LinkIcon, Loader2, Mic, MicOff } from 'lucide-react';

interface QuickSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, note: string, mood?: string) => Promise<void>;
}

const moods = [
  { id: 'Inspired', icon: '💡', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'Productive', icon: '🚀', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'Relaxed', icon: '☕', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'Adventurous', icon: '✈️', color: 'bg-orange-100 text-orange-700' },
  { id: 'Creative', icon: '🎨', color: 'bg-pink-100 text-pink-700' },
  { id: 'Curious', icon: '👁️', color: 'bg-purple-100 text-purple-700' },
];

export function QuickSaveModal({ isOpen, onClose, onSave }: QuickSaveModalProps) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !note) return;
    
    setLoading(true);
    // If no URL but note exists, treat as a text note (mock URL)
    const finalUrl = url || `note://${Date.now()}`;
    await onSave(finalUrl, note, selectedMood || undefined);
    setLoading(false);
    setUrl('');
    setNote('');
    setSelectedMood(null);
    onClose();
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Stop recognition logic would go here
      return;
    }

    setIsListening(true);
    
    // Simple Web Speech API implementation
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setNote(prev => prev + (prev ? ' ' : '') + transcript);
            setIsListening(false);
        };

        recognition.onerror = () => {
            setIsListening(false);
            alert("Voice recognition failed. Please try again.");
        };

        recognition.start();
    } else {
        alert("Voice recognition is not supported in this browser.");
        setIsListening(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Save</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link URL (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Note / Voice Memo</label>
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                        isListening ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                    {isListening ? 'Listening...' : 'Record'}
                </button>
            </div>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Type a note or record your thoughts..."
              className="w-full p-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none dark:text-white"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How are you feeling?</label>
            <div className="grid grid-cols-3 gap-2">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  type="button"
                  onClick={() => setSelectedMood(mood.id === selectedMood ? null : mood.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                    selectedMood === mood.id 
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-105' 
                      : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="text-xl mb-1">{mood.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">{mood.id}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || (!url && !note)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {loading ? 'Saving...' : 'Save to Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
