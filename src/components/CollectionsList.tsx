import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Folder, Plus, MoreVertical } from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  icon: string;
  color: string;
  description?: string;
  count: number;
}

interface CollectionsListProps {
  collections: Collection[];
  onCreateCollection: (name: string, color: string, description: string) => void;
  onSelectCollection?: (id: number | null) => void;
  selectedId?: number | null;
}

export function CollectionsList({ collections, onCreateCollection, onSelectCollection, selectedId }: CollectionsListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newColor, setNewColor] = useState('indigo');

  const colors = [
    { name: 'indigo', hex: '#6366f1' },
    { name: 'rose', hex: '#f43f5e' },
    { name: 'emerald', hex: '#10b981' },
    { name: 'amber', hex: '#f59e0b' },
    { name: 'violet', hex: '#8b5cf6' },
    { name: 'cyan', hex: '#06b6d4' },
  ];

  const handleCreate = () => {
    if (!newName) return;
    onCreateCollection(newName, newColor, newDescription);
    setNewName('');
    setNewDescription('');
    setIsCreating(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white">Collections</h3>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          + New Collection
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Create New Card (Inline) */}
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-w-[240px] bg-white dark:bg-gray-800 p-6 rounded-[2rem] border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col gap-4"
          >
            <input 
              autoFocus
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Collection Name"
              className="w-full text-lg outline-none bg-transparent font-black tracking-tighter dark:text-white"
            />
            <textarea 
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="What's this for?"
              className="w-full text-xs outline-none bg-transparent text-gray-500 dark:text-gray-400 resize-none h-12"
            />
            <div className="flex gap-2">
              {colors.map(c => (
                <button 
                  key={c.name}
                  onClick={() => setNewColor(c.name)}
                  className={`w-6 h-6 rounded-full transition-transform ${newColor === c.name ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-600' : 'hover:scale-110'}`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <button 
              onClick={handleCreate}
              className="bg-indigo-600 text-white text-xs py-3 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
            >
              Create Collection
            </button>
          </motion.div>
        )}

        {collections.length === 0 && !isCreating && (
          <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 px-12">
            <p className="text-sm text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">No collections yet</p>
            <button 
              onClick={() => setIsCreating(true)}
              className="mt-3 px-6 py-2 bg-white dark:bg-gray-700 text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest rounded-full shadow-sm hover:shadow-md transition-all"
            >
              Start Organizing
            </button>
          </div>
        )}

        {collections.map(collection => (
          <motion.div
            key={collection.id}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onSelectCollection?.(selectedId === collection.id ? null : collection.id)}
            className={`min-w-[240px] p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
              selectedId === collection.id 
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/10 shadow-xl' 
                : 'border-black/5 dark:border-white/5 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl'
            }`}
          >
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 dark:opacity-20 bg-${collection.color}-500`} />
            
            <div className={`w-12 h-12 rounded-2xl bg-${collection.color}-50 dark:bg-${collection.color}-900/20 text-${collection.color}-600 dark:text-${collection.color}-400 flex items-center justify-center mb-4 shadow-inner`}>
              <Folder size={24} />
            </div>
            
            <h4 className="font-black text-gray-900 dark:text-white text-lg tracking-tighter truncate mb-1">{collection.name}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 font-medium h-8">
                {collection.description || 'No description provided.'}
            </p>
            
            <div className="flex items-center justify-between mt-auto">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    {collection.count} items
                </span>
                <div className={`w-2 h-2 rounded-full bg-${collection.color}-500`} />
            </div>
            
            <button className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity p-2">
              <MoreVertical size={18} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
