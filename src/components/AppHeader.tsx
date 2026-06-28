import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, LogIn, LogOut, BookOpen, Crown } from 'lucide-react';
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';

export default function AppHeader({ onLogout }: { onLogout?: () => void }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
    if (onLogout) onLogout();
  };

  const isAdmin = !!localStorage.getItem('adminName');
  const currentName = user?.displayName || (isAdmin ? localStorage.getItem('adminName') : localStorage.getItem('user_teacher')) || "គណនី";
  const currentAvatar = isAdmin ? localStorage.getItem('admin_avatar') : localStorage.getItem('teacher_avatar');

  return (
    <header className="relative w-full z-50 print:hidden">
      {/* 100% Viewport Width Background Container */}
      <div className="relative overflow-hidden bg-slate-900 min-h-[80px] flex items-center shadow-xl border-b border-white/10">
        
        {/* Colorful Mix Effects - Not Too Dark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.45] mix-blend-screen">
          <div className="absolute top-[-100px] left-[5%] w-96 h-96 bg-emerald-500/40 rounded-full blur-[80px]" />
          <div className="absolute top-[20px] left-[25%] w-80 h-80 bg-cyan-500/40 rounded-full blur-[70px]" />
          <div className="absolute bottom-[-100px] left-[45%] w-96 h-96 bg-indigo-500/40 rounded-full blur-[90px]" />
          <div className="absolute top-[0px] right-[30%] w-72 h-72 bg-fuchsia-500/30 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-50px] right-[5%] w-[25rem] h-[25rem] bg-amber-500/20 rounded-full blur-[100px]" />
        </div>

        {/* Subtle Decorative Background Elements - Edges to Edges */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
          <div className="absolute top-1/2 left-[10%] -translate-y-1/2 w-64 h-64 border-[1px] border-white rounded-full blur-[1px]" />
          <div className="absolute top-1/2 left-[40%] -translate-y-1/2 w-32 h-32 border-[1px] border-white rounded-md rotate-45" />
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-80 h-80 border-[1px] border-white rounded-full" />
        </div>

        {/* Content Area - Centered within the full width bar */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-2 md:px-10 flex items-center justify-between gap-4">
          
          {/* Left: Logo & Titles */}
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="relative flex items-center justify-center">
              {/* Ornamental rings behind logo */}
              <div className="absolute w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] border-[0.5px] border-emerald-400/20 rounded-full animate-pulse" />
              <div className="absolute w-[50px] h-[50px] sm:w-[65px] sm:h-[65px] border-[0.5px] border-emerald-400/10 rounded-full" />
              
              {/* Premium Official-style Logo */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-900 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(16,185,129,0.3)] border-2 border-emerald-400/40 overflow-hidden group"
              >
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                
                {/* Circuit Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:15px_15px]" />
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {/* Icon Part: Elegant Book with Digital Pulse */}
                  <div className="relative">
                    <div className="bg-amber-400 p-1.5 rounded-xl shadow-[0_5px_10px_rgba(251,191,36,0.4)] group-hover:rotate-[10deg] transition-transform duration-500 ease-out">
                      <BookOpen className="w-5 h-5 text-emerald-950" strokeWidth={2.5} />
                    </div>
                    {/* Tiny blinking lights */}
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-300 rounded-full animate-ping" />
                  </div>
                  
                  {/* Text Part: Professional Khmer Typography */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-black text-amber-200 khmer-font leading-tight tracking-tighter drop-shadow-sm">
                      គ្រូបង្រៀន
                    </span>
                    <div className="w-full h-[1px] bg-amber-400/30 my-0.5 shadow-sm" />
                    <span className="text-[9px] font-black text-white khmer-font leading-tight tracking-normal drop-shadow-md">
                      ឌីជីថល
                    </span>
                  </div>
                </div>

                {/* Glassy Sweep */}
                <div className="absolute inset-x-0 -top-[100%] h-full w-full bg-gradient-to-b from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
              </motion.div>
            </div>
            
            {/* Modern Vertical Separator */}
            <div className="hidden sm:block h-10 w-[2px] bg-gradient-to-b from-transparent via-emerald-500/40 to-transparent mx-2 rounded-full" />

            <div className="flex flex-col py-1">
              <h1 className="text-base sm:text-lg md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-emerald-200 font-moul leading-tight tracking-tight drop-shadow-sm filter contrast-125 pb-1 pt-1">
                គ្រូបង្រៀនឌីជីថល
              </h1>
              <p className="hidden sm:flex text-emerald-400 font-bold text-[7px] md:text-[9px] tracking-[0.4em] uppercase font-sans mt-0.5 opacity-80 items-center gap-2">
                <span className="w-4 h-[1px] bg-emerald-500/50"></span>
                Khmer Primary Education
                <span className="w-4 h-[1px] bg-emerald-500/50"></span>
              </p>
            </div>
          </div>

          {/* Right: Search & Profile & Backup Status */}
          <div className="flex items-center gap-3 sm:gap-6">

            {/* Prime Button */}
            <button className="hidden sm:flex relative group items-center bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full pl-3 pr-1.5 py-1.5 gap-2 shadow-lg hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5 border border-amber-300">
              <Crown className="w-4 h-4 text-white drop-shadow-sm" />
              <span className="text-white font-bold text-xs uppercase tracking-wide drop-shadow-sm">Prime</span>
              <span className="bg-white text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-full shadow-inner animate-pulse whitespace-nowrap">
                Free 1ខែ
              </span>
            </button>

            {/* Profile & Auth */}
            <div className="flex items-center gap-4">
              <button 
                onClick={onLogout}
                className="text-white hover:text-red-400 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all"
                title="ចាកចេញពីប្រព័ន្ធ (ចេញទៅក្រៅ)"
              >
                <LogOut className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4">
                <div className="hidden md:flex flex-col items-end justify-center gap-3">
                  <span className="text-white font-bold text-sm leading-normal pb-1" style={{ fontFamily: isAdmin ? '"Khmer Mool1", Moul' : undefined }}>
                    {currentName}
                  </span>
                  <span className="text-emerald-300 text-xs font-bold uppercase tracking-widest leading-normal pt-1" style={{ fontFamily: isAdmin ? '"Kh Muol Pali", Moul' : undefined }}>
                    {isAdmin ? 'អ្នកគ្រប់គ្រង' : 'គ្រូបង្រៀន'}
                  </span>
                </div>
                <div className="relative group">
                  {/* Glow effect */}
                  <div className={`absolute -inset-2 rounded-full blur-md opacity-60 transition-opacity group-hover:opacity-100 ${isAdmin ? 'bg-amber-500' : 'bg-yellow-400'}`}></div>
                  
                  {/* Spinning Ring */}
                  <div className={`absolute -inset-1 rounded-full border-[3px] border-t-transparent border-r-transparent animate-[spin_3s_linear_infinite] z-0 ${isAdmin ? 'border-amber-400' : 'border-yellow-400'}`}></div>
                  <div className={`absolute -inset-1 rounded-full border-[3px] border-b-transparent border-l-transparent animate-[spin_4s_linear_infinite_reverse] z-0 ${isAdmin ? 'border-yellow-200' : 'border-amber-200'}`}></div>

                  {/* Avatar Container */}
                  <div className="relative z-10 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-[2px] border-white shadow-2xl transition-all hover:scale-110 active:scale-95 overflow-hidden">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : currentAvatar ? (
                      <img 
                        src={currentAvatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <User className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Subtle Glow beneath the header */}
      <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FACC15]/30 to-transparent" />
    </header>
  );
}
