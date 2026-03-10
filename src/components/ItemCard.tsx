import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Tag, Wand2, Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Loader2, Globe, X, Copy, Trash2, StickyNote, Eye, Sparkles, FolderPlus, Check, Volume2 } from 'lucide-react';

interface Collection {
  id: number;
  name: string;
  color: string;
}

interface Item {
  id: number;
  url: string;
  source: string;
  type: string;
  summary: string;
  tags: string; // JSON string
  content: string;
  media_url: string | null;
  location_data?: string; // JSON string
  remix_url?: string;
  is_favorite?: boolean;
  notes?: string;
  view_count?: number;
}

interface ItemCardProps {
  item: Item;
  collections: Collection[];
  onRemix: (item: Item) => void;
  onUpdate: (id: number, updates: Partial<Item>) => void;
  onDelete: (id: number) => void;
  onAddToCollection: (itemId: number, collectionId: number) => void;
}

export function ItemCard({ item, collections, onRemix, onUpdate, onDelete, onAddToCollection }: ItemCardProps) {
  const [locating, setLocating] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [isAddingToCollection, setIsAddingToCollection] = useState<number | null>(null);
  const [noteValue, setNoteValue] = useState(item.notes || '');
  const [locationInfo, setLocationInfo] = useState<any>(item.location_data ? JSON.parse(item.location_data) : null);
  const [isRemixingImage, setIsRemixingImage] = useState(false);
  const [remixImagePrompt, setRemixImagePrompt] = useState('');
  const tags = JSON.parse(item.tags || '[]');
  const isVideo = item.url.includes('tiktok') || item.url.includes('youtube') || item.url.includes('reel') || item.type === 'video';

  const handleToggleFavorite = () => {
    onUpdate(item.id, { is_favorite: !item.is_favorite });
  };

  const handleSaveNote = () => {
    onUpdate(item.id, { notes: noteValue });
    setShowNotes(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    // Could add a toast here
  };

  const handleView = () => {
    onUpdate(item.id, { view_count: (item.view_count || 0) + 1 });
    window.open(item.url, '_blank');
  };

  const handleLocate = async () => {
    if (locationInfo) {
        setLocationInfo(null); // Toggle off
        return;
    }
    
    setLocating(true);
    try {
        const res = await fetch('/api/locate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id, locationHint: item.summary })
        });
        const data = await res.json();
        setLocationInfo(data);
    } catch (error) {
        console.error("Locate failed", error);
    } finally {
        setLocating(false);
    }
  };

  const handleRemixImage = async () => {
    if (!remixImagePrompt) return;
    setIsRemixingImage(true);
    try {
        const res = await fetch('/api/edit-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: item.media_url, prompt: remixImagePrompt })
        });
        const data = await res.json();
        if (data.imageUrl) {
            onUpdate(item.id, { media_url: data.imageUrl });
            setIsRemixingImage(false);
            setRemixImagePrompt('');
        }
    } catch (error) {
        console.error("Image Remix Error:", error);
    } finally {
        setIsRemixingImage(false);
    }
  };

  const handleAddToCollection = async (collectionId: number) => {
    setIsAddingToCollection(collectionId);
    try {
        await onAddToCollection(item.id, collectionId);
        // Show success state briefly
        setTimeout(() => {
            setIsAddingToCollection(null);
            setShowCollections(false);
        }, 1000);
    } catch (error) {
        console.error("Failed to add to collection", error);
        setIsAddingToCollection(null);
    }
  };

  const handleReadAloud = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(item.summary || item.content);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const ytEmbedUrl = getYouTubeEmbedUrl(item.url);

  return (    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all group relative hover-glow"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                item.source === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 
                item.source === 'twitter' ? 'bg-blue-400' : 'bg-gray-800 dark:bg-gray-700'
            }`}>
                {item.source[0].toUpperCase()}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">{item.source}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Saved just now</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleLocate}
                className={`p-2 rounded-full transition-colors ${locationInfo ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
                title="Locate this place"
            >
                {locating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            </button>
            <button 
                onClick={() => onDelete(item.id)}
                className="text-gray-400 dark:text-gray-500 hover:text-red-500 p-2 transition-colors"
                title="Delete item"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Media Preview */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {ytEmbedUrl ? (
            <iframe 
                src={ytEmbedUrl} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
            ></iframe>
        ) : item.remix_url ? (
            <video 
                src={item.remix_url} 
                controls 
                className="w-full h-full object-cover"
                autoPlay 
                loop 
                muted 
            />
        ) : item.media_url ? (
          <img 
            src={item.media_url} 
            alt="Preview" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800">
            <ExternalLink size={48} className="mb-2 opacity-50" />
            <span className="text-xs uppercase tracking-widest opacity-50">External Link</span>
          </div>
        )}
        
        {/* Location Info Overlay */}
        <AnimatePresence>
            {locationInfo && (
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="absolute inset-0 bg-indigo-900/95 dark:bg-gray-900/95 backdrop-blur-md p-6 text-white flex flex-col z-10 overflow-y-auto scrollbar-hide"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-indigo-300">
                            <Globe size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Location Found</span>
                        </div>
                        <button 
                            onClick={() => setLocationInfo(null)}
                            className="text-white/50 hover:text-white p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-4">
                        <h4 className="text-lg font-bold mb-1">Google Maps Insight</h4>
                        <div className="h-1 w-12 bg-indigo-500 rounded-full mb-3"></div>
                        <p className="text-xs text-indigo-100 leading-relaxed line-clamp-4 mb-4">
                            {locationInfo.text}
                        </p>
                    </div>

                    {/* Map Preview Placeholder */}
                    <div className="relative w-full aspect-video bg-gray-800 rounded-xl overflow-hidden mb-4 border border-white/10 group/map">
                        <img 
                            src={`https://picsum.photos/seed/${encodeURIComponent(locationInfo.text.substring(0, 10))}/400/200?blur=2`} 
                            alt="Map Preview" 
                            className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <MapPin size={32} className="text-indigo-400 mb-2 animate-bounce" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Interactive Map Preview</span>
                        </div>
                        <a 
                            href={`https://www.google.com/maps/search/${encodeURIComponent(item.summary)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 bg-indigo-600/0 group-hover/map:bg-indigo-600/20 transition-colors flex items-center justify-center"
                        >
                            <span className="opacity-0 group-hover/map:opacity-100 bg-white text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold transition-opacity">OPEN IN MAPS</span>
                        </a>
                    </div>

                    <div className="mt-auto space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {locationInfo.earth_link && (
                                <a 
                                    href={locationInfo.earth_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 text-[10px] bg-indigo-500 hover:bg-indigo-600 px-3 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                >
                                    <Globe size={14} /> View in 3D
                                </a>
                            )}
                            <a 
                                href={`https://www.google.com/maps/search/${encodeURIComponent(item.summary)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 text-[10px] bg-white/10 hover:bg-white/20 px-3 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm active:scale-95"
                            >
                                <MapPin size={14} /> Directions
                            </a>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-2">
                            {locationInfo.grounding?.map((chunk: any, i: number) => (
                                chunk.web && (
                                    <a 
                                        key={i}
                                        href={chunk.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[9px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-colors flex items-center gap-1 border border-white/10"
                                    >
                                        <ExternalLink size={10} /> {chunk.web.title?.substring(0, 15) || `Source ${i + 1}`}...
                                    </a>
                                )
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        
        {/* Overlay Actions */}
        {!locationInfo && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                {isVideo && (
                    <button 
                        onClick={() => onRemix(item)}
                        className="bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                    >
                        <Wand2 size={16} className="text-purple-600" /> Remix
                    </button>
                )}
                <button 
                    onClick={handleView}
                    className="bg-white/20 text-white border border-white/50 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-all backdrop-blur-md"
                >
                    <ExternalLink size={16} /> Open
                </button>
            </div>
        )}
      </div>

      {/* Remix Image UI */}
      {item.media_url && !item.url.includes('instagram') && !isVideo && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-50 dark:border-gray-700">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AI Image Remix</p>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={remixImagePrompt}
                    onChange={(e) => setRemixImagePrompt(e.target.value)}
                    placeholder="Add a llama next to it..."
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button 
                    onClick={handleRemixImage}
                    disabled={isRemixingImage || !remixImagePrompt}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                >
                    {isRemixingImage ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Remix
                </button>
            </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-700">
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <button onClick={handleToggleFavorite} className="transition-colors">
                <Heart size={22} className={item.is_favorite ? 'fill-red-500 text-red-500' : 'hover:text-red-500'} />
            </button>
            <button onClick={() => setShowNotes(!showNotes)} className="transition-colors">
                <StickyNote size={22} className={item.notes ? 'text-indigo-500' : 'hover:text-indigo-500'} />
            </button>
            <button onClick={() => setShowCollections(!showCollections)} className="transition-colors">
                <FolderPlus size={22} className={showCollections ? 'text-indigo-500' : 'hover:text-indigo-500'} />
            </button>
            <button onClick={handleCopyLink} className="transition-colors">
                <Copy size={20} className="hover:text-green-500" />
            </button>
            <button onClick={handleReadAloud} className="transition-colors" title="Read Aloud">
                <Volume2 size={20} className="hover:text-indigo-500" />
            </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Eye size={12} />
            {item.view_count || 0} views
        </div>
      </div>

      {/* Collections Area */}
      <AnimatePresence>
        {showCollections && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-gray-50 dark:border-gray-700 overflow-hidden"
            >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Add to Collection</p>
                <div className="flex flex-wrap gap-2">
                    {collections.map(col => (
                        <button
                            key={col.id}
                            onClick={() => handleAddToCollection(col.id)}
                            disabled={isAddingToCollection === col.id}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                                isAddingToCollection === col.id
                                    ? 'bg-green-500 text-white'
                                    : `bg-${col.color}-100 dark:bg-${col.color}-900/30 text-${col.color}-600 dark:text-${col.color}-400 border border-${col.color}-200 dark:border-${col.color}-700/50 hover:scale-105`
                            }`}
                        >
                            {isAddingToCollection === col.id ? <Check size={12} /> : <FolderPlus size={12} />}
                            {col.name}
                        </button>
                    ))}
                    {collections.length === 0 && (
                        <p className="text-[10px] text-gray-400 italic">No collections yet. Create one in the Collections tab!</p>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Area */}
      <AnimatePresence>
        {showNotes && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-gray-50 dark:border-gray-700 overflow-hidden"
            >
                <textarea 
                    value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    placeholder="Add your thoughts about this item..."
                    className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none resize-none min-h-[60px]"
                />
                <div className="flex justify-end mt-2">
                    <button 
                        onClick={handleSaveNote}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:underline"
                    >
                        Save Note
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="p-4 pt-3">
        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed mb-3 line-clamp-3">
            <span className="font-semibold mr-2">AI Summary:</span>
            {item.summary || item.content}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag: string, i: number) => (
            <motion.span 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (i * 0.05), duration: 0.3 }}
              className="text-[10px] font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-default"
            >
              #{tag}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
