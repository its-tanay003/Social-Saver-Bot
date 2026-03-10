import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, Camera, Mail, Phone, Calendar, Globe, Lock, Unlock, 
  Settings, LogOut, Moon, Sun, Shield, UserPlus, Save, Edit2,
  Instagram, Twitter, Linkedin, Github, User, Sparkles
} from 'lucide-react';

interface ProfileData {
  full_name: string;
  dob: string;
  phone: string;
  email: string;
  avatar_url: string;
  bio: string;
  is_public: boolean;
  social_links: any;
  avatar_config?: any;
}

interface ProfileViewProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onToggleTheme: () => void;
}

export function ProfileView({ isOpen, onClose, currentTheme, onToggleTheme }: ProfileViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    dob: '',
    phone: '',
    email: '',
    avatar_url: '',
    bio: '',
    is_public: false,
    social_links: {},
    avatar_config: {
      seed: 'Alex',
      top: 'shortHair',
      accessories: 'none',
      hairColor: 'brown',
      facialHair: 'none',
      clothing: 'shirt',
      skinColor: 'light'
    }
  });

  const avatarOptions = {
    top: [
      'shortHair', 'longHair', 'bob', 'curly', 'shaved', 'turban', 'hijab', 
      'bigHair', 'bun', 'dreads', 'frida', 'frizzle', 'fro', 'froBand', 
      'longHairCurly', 'miaWallace', 'sidePart', 'theCaesar'
    ],
    accessories: ['none', 'glasses', 'sunglasses', 'round', 'kurt', 'prescription01', 'prescription02', 'wayfarers'],
    hairColor: ['brown', 'black', 'blonde', 'red', 'silver', 'auburn', 'pastelPink', 'platinum', 'shone'],
    facialHair: ['none', 'beard', 'mustache', 'beardLight', 'beardMajestic', 'moustachFancy'],
    clothing: ['shirt', 'hoodie', 'blazer', 'overall', 'collarAndSweater', 'graphicShirt', 'tankTop'],
    skinColor: ['light', 'brown', 'dark', 'yellow', 'tanned', 'pale']
  };

  const getAvatarUrl = (config: any) => {
    const params = new URLSearchParams({
      seed: config.seed || 'Alex',
      top: config.top,
      accessories: config.accessories,
      hairColor: config.hairColor,
      facialHair: config.facialHair,
      clothing: config.clothing,
      skinColor: config.skinColor
    });
    return `https://api.dicebear.com/7.x/avataaars/svg?${params.toString()}`;
  };

  // Mock Friends Data
  const friends = [
    { id: 1, name: "Sarah J.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: 2, name: "Mike R.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    { id: 3, name: "Jessica T.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile({
        ...data,
        social_links: JSON.parse(data.social_links || '{}'),
        avatar_config: data.avatar_config || profile.avatar_config,
        is_public: Boolean(data.is_public)
      });
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedProfile = {
        ...profile,
        avatar_url: getAvatarUrl(profile.avatar_config)
      };
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile", error);
    }
  };

  const updateAvatar = (key: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      avatar_config: { ...prev.avatar_config, [key]: value }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex justify-end">
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        className="w-full max-w-2xl bg-white dark:bg-gray-900 h-full shadow-2xl overflow-y-auto"
      >
        {/* Header Image */}
        <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-8 pb-8 -mt-20">
          {/* Profile Header */}
          <div className="flex justify-between items-end mb-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 overflow-hidden shadow-lg">
                {profile.avatar_config ? (
                    <img 
                      src={getAvatarUrl(profile.avatar_config)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                ) : profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={48} />
                    </div>
                )}
              </div>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-full shadow-md">
                  <Camera size={16} />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mb-2">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Main Info */}
          <div className="space-y-6">
            <div>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="text-3xl font-bold text-gray-900 dark:text-white border-b-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-600 outline-none w-full bg-transparent"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h1>
              )}
              
              {isEditing ? (
                <textarea 
                  value={profile.bio}
                  onChange={(e) => setProfile({...profile, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  className="mt-2 text-gray-600 dark:text-gray-400 w-full border dark:border-gray-700 rounded-lg p-2 text-sm bg-transparent"
                />
              ) : (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.bio || "No bio yet."}</p>
              )}
            </div>

            {/* Avatar Customizer */}
            {isEditing && (
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50 space-y-4">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <Sparkles size={18} /> Customize 3D Avatar
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(avatarOptions).map(([key, options]) => (
                    <div key={key}>
                      <label className="block text-[10px] uppercase font-bold text-indigo-400 mb-1">{key}</label>
                      <select 
                        value={profile.avatar_config[key]}
                        onChange={(e) => updateAvatar(key, e.target.value)}
                        className="w-full bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-lg p-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                      >
                        {options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield size={18} className="text-indigo-600" /> Personal Info
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Mail size={16} />
                    {isEditing ? (
                      <input 
                        value={profile.email} 
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span>{profile.email}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone size={16} />
                    {isEditing ? (
                      <input 
                        value={profile.phone} 
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        placeholder="+1 234 567 890"
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span>{profile.phone || "Add phone number"}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar size={16} />
                    {isEditing ? (
                      <input 
                        type="date"
                        value={profile.dob} 
                        onChange={(e) => setProfile({...profile, dob: e.target.value})}
                        className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <span>{profile.dob || "Add birthday"}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Globe size={18} className="text-indigo-600" /> Social Links
                </h3>
                
                <div className="space-y-3">
                  {['instagram', 'twitter', 'linkedin', 'github'].map((platform) => (
                    <div key={platform} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="capitalize w-20 font-medium">{platform}</span>
                      {isEditing ? (
                        <input 
                          value={profile.social_links[platform] || ''} 
                          onChange={(e) => setProfile({
                            ...profile, 
                            social_links: { ...profile.social_links, [platform]: e.target.value }
                          })}
                          placeholder={`Your ${platform} username`}
                          className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded px-2 py-1 w-full"
                        />
                      ) : (
                        <span className={profile.social_links[platform] ? 'text-indigo-600' : 'text-gray-400 dark:text-gray-500'}>
                          {profile.social_links[platform] || "Not connected"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Friends & Privacy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Friends */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <UserPlus size={18} className="text-green-600" /> Friends
                    </h3>
                    <button className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Find Friends</button>
                  </div>
                  <div className="flex -space-x-2 overflow-hidden mb-4">
                    {friends.map(friend => (
                      <img 
                        key={friend.id}
                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white dark:ring-gray-800"
                        src={friend.avatar}
                        alt={friend.name}
                      />
                    ))}
                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 ring-2 ring-white dark:ring-gray-800">
                      +5
                    </div>
                  </div>
                  <button className="w-full py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Invite Friends
                  </button>
               </div>

               {/* Settings */}
               <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Settings size={18} className="text-gray-600 dark:text-gray-400" /> Settings
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {profile.is_public ? <Unlock size={16} /> : <Lock size={16} />}
                      <span>Profile Privacy</span>
                    </div>
                    {isEditing ? (
                      <button 
                        onClick={() => setProfile({...profile, is_public: !profile.is_public})}
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          profile.is_public ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {profile.is_public ? 'Public' : 'Private'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{profile.is_public ? 'Public' : 'Private'}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      {currentTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                      <span>Appearance</span>
                    </div>
                    <button 
                      onClick={onToggleTheme}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Toggle Theme
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Save size={16} />
                      <span>Export Data</span>
                    </div>
                    <button 
                      onClick={() => {
                        fetch('/api/items')
                          .then(res => res.json())
                          .then(data => {
                            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'digital_soul_export.json';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          });
                      }}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                    >
                      Download JSON
                    </button>
                  </div>

                  <hr className="border-gray-100 dark:border-gray-700" />

                  <button className="w-full flex items-center justify-center gap-2 text-red-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 py-2 rounded-lg transition-colors">
                    <LogOut size={16} /> Log Out
                  </button>
               </div>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
