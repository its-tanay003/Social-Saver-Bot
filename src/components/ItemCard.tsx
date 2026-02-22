import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Tag, Wand2, Heart, MessageCircle, Share2, MoreHorizontal, MapPin, Loader2, Globe } from 'lucide-react';

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
}

interface ItemCardProps {
  item: Item;
  onRemix: (item: Item) => void;
}

export function ItemCard({ item, onRemix }: ItemCardProps) {
  const [locating, setLocating] = useState(false);
  const [locationInfo, setLocationInfo] = useState<any>(item.location_data ? JSON.parse(item.location_data) : null);
  const tags = JSON.parse(item.tags || '[]');
  const isVideo = item.url.includes('tiktok') || item.url.includes('youtube') || item.url.includes('reel') || item.type === 'video';

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group relative"
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                item.source === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 
                item.source === 'twitter' ? 'bg-blue-400' : 'bg-gray-800'
            }`}>
                {item.source[0].toUpperCase()}
            </div>
            <div>
                <p className="text-sm font-semibold text-gray-900 capitalize">{item.source}</p>
                <p className="text-[10px] text-gray-500">Saved just now</p>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={handleLocate}
                className={`p-2 rounded-full transition-colors ${locationInfo ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                title="Locate this place"
            >
                {locating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
            </button>
            <button className="text-gray-400 hover:text-gray-600 p-2">
                <MoreHorizontal size={18} />
            </button>
        </div>
      </div>

      {/* Media Preview */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {item.remix_url ? (
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
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
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
                    className="absolute inset-0 bg-indigo-900/90 backdrop-blur-md p-6 text-white flex flex-col justify-center z-10"
                >
                    <div className="flex items-center gap-2 mb-2 text-indigo-300">
                        <Globe size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Location Found</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Google Maps Insight</h4>
                    <p className="text-xs text-indigo-100 leading-relaxed mb-4 line-clamp-6">
                        {locationInfo.text}
                    </p>
                    <div className="flex gap-2">
                        {locationInfo.earth_link && (
                            <a 
                                href={locationInfo.earth_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] bg-indigo-500 hover:bg-indigo-600 px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1 shadow-lg"
                            >
                                <Globe size={12} /> View in 3D
                            </a>
                        )}
                        {locationInfo.grounding?.map((chunk: any, i: number) => (
                            chunk.web && (
                                <a 
                                    key={i}
                                    href={chunk.web.uri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] bg-white/20 hover:bg-white/30 px-2 py-1.5 rounded-lg transition-colors flex items-center"
                                >
                                    Source {i + 1}
                                </a>
                            )
                        ))}
                    </div>
                    <button 
                        onClick={() => setLocationInfo(null)}
                        className="absolute top-4 right-4 text-white/50 hover:text-white"
                    >
                        <Tag size={18} className="rotate-45" />
                    </button>
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
                <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/20 text-white border border-white/50 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-black transition-all backdrop-blur-md"
                >
                    <ExternalLink size={16} /> Open
                </a>
            </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
        <div className="flex items-center gap-4 text-gray-600">
            <Heart size={22} className="hover:text-red-500 cursor-pointer transition-colors" />
            <MessageCircle size={22} className="hover:text-blue-500 cursor-pointer transition-colors" />
            <Share2 size={22} className="hover:text-green-500 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-3">
            <span className="font-semibold mr-2">AI Summary:</span>
            {item.summary || item.content}
        </p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {tags.map((tag: string, i: number) => (
            <span key={i} className="text-[10px] font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-default">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
