import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, Edit2, Trash2, Check, X, Plus, Loader2, Search } from 'lucide-react';

interface Tag {
  name: string;
  count: number;
}

interface TagManagerProps {
  onTagsUpdated: () => void;
}

export function TagManager({ onTagsUpdated }: TagManagerProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [search, setSearch] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/tags');
      const data = await res.json();
      setTags(data);
    } catch (error) {
      console.error("Failed to fetch tags", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleRename = async (oldName: string) => {
    if (!editValue.trim() || editValue === oldName) {
      setEditingTag(null);
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(oldName)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newName: editValue.trim() })
      });
      if (res.ok) {
        setEditingTag(null);
        fetchTags();
        onTagsUpdated();
      }
    } catch (error) {
      console.error("Failed to rename tag", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete the tag #${name}? It will be removed from all items.`)) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/tags/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTags();
        onTagsUpdated();
      }
    } catch (error) {
      console.error("Failed to delete tag", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Tag Management</h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium">Organize your knowledge base by managing your global tags.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tags..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-transparent rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white dark:focus:bg-gray-900 transition-all dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Hash size={14} />
            {tags.length} Total Tags
          </div>
        </div>

        <div className="p-4 md:p-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode='popLayout'>
                {filteredTags.map((tag) => (
                  <motion.div
                    key={tag.name}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      {editingTag === tag.name ? (
                        <div className="flex items-center gap-2">
                          <input 
                            autoFocus
                            type="text" 
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleRename(tag.name)}
                            className="w-full bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2 py-1 text-sm outline-none dark:text-white"
                          />
                          <button 
                            onClick={() => handleRename(tag.name)}
                            disabled={isUpdating}
                            className="text-green-500 hover:text-green-600"
                          >
                            <Check size={18} />
                          </button>
                          <button 
                            onClick={() => setEditingTag(null)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Hash size={14} className="text-indigo-500 shrink-0" />
                          <span className="font-bold text-gray-900 dark:text-white truncate">
                            {tag.name}
                          </span>
                          <span className="text-[10px] font-black text-gray-400 bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-md border border-gray-100 dark:border-gray-700">
                            {tag.count}
                          </span>
                        </div>
                      )}
                    </div>

                    {!editingTag && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingTag(tag.name);
                            setEditValue(tag.name);
                          }}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                          title="Rename"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(tag.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredTags.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash size={32} className="text-gray-200 dark:text-gray-700" />
                  </div>
                  <p className="text-gray-400 dark:text-gray-500 font-medium">No tags found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 p-8 bg-indigo-600 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-indigo-200 dark:shadow-indigo-900/40">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Pro Tip: Smart Tagging</h3>
          <p className="text-indigo-100 text-sm max-w-md">Our AI automatically tags your saves, but you can rename them here to keep your knowledge base perfectly organized.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center text-[10px] font-bold">
                        #{['tech', 'food', 'travel'][i-1]}
                    </div>
                ))}
            </div>
            <div className="h-8 w-[1px] bg-white/20" />
            <p className="text-xs font-bold uppercase tracking-widest">AI Enhanced</p>
        </div>
      </div>
    </div>
  );
}
