import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Folder, Plus, MoreVertical } from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
}

interface CollectionsListProps {
  collections: Collection[];
  onCreateCollection: (name: string, color: string) => void;
}

export function CollectionsList({ collections, onCreateCollection }: CollectionsListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('blue');

  const colors = ['blue', 'red', 'green', 'yellow', 'purple', 'pink'];

  const handleCreate = () => {
    if (!newName) return;
    onCreateCollection(newName, newColor);
    setNewName('');
    setIsCreating(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Collections</h3>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
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
            className="min-w-[160px] bg-white p-4 rounded-xl border-2 border-dashed border-indigo-200 flex flex-col gap-3"
          >
            <input 
              autoFocus
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name..."
              className="w-full text-sm outline-none bg-transparent font-medium"
            />
            <div className="flex gap-1">
              {colors.map(c => (
                <button 
                  key={c}
                  onClick={() => setNewColor(c)}
                  className={`w-4 h-4 rounded-full bg-${c}-500 ${newColor === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                />
              ))}
            </div>
            <button 
              onClick={handleCreate}
              className="bg-indigo-600 text-white text-xs py-1.5 rounded-lg font-medium"
            >
              Create
            </button>
          </motion.div>
        )}

        {collections.map(collection => (
          <motion.div
            key={collection.id}
            whileHover={{ y: -2 }}
            className="min-w-[160px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group relative"
          >
            <div className={`w-10 h-10 rounded-lg bg-${collection.color}-100 text-${collection.color}-600 flex items-center justify-center mb-3`}>
              <Folder size={20} />
            </div>
            <h4 className="font-semibold text-gray-900 text-sm truncate">{collection.name}</h4>
            <p className="text-xs text-gray-500">{collection.count} items</p>
            
            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
              <MoreVertical size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
