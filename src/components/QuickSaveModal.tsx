import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Link as LinkIcon, Loader2, Mic, MicOff } from 'lucide-react';

interface QuickSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string, note: string) => Promise<void>;
}

export function QuickSaveModal({ isOpen, onClose, onSave }: QuickSaveModalProps) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url && !note) return;
    
    setLoading(true);
    // If no URL but note exists, treat as a text note (mock URL)
    const finalUrl = url || `note://${Date.now()}`;
    await onSave(finalUrl, note);
    setLoading(false);
    setUrl('');
    setNote('');
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
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Quick Save</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link URL (Optional)</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Note / Voice Memo</label>
                <button
                    type="button"
                    onClick={toggleListening}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                        isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              rows={4}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || (!url && !note)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            {loading ? 'Saving...' : 'Save to Dashboard'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
