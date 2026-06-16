import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Send, 
  Image as ImageIcon, 
  Users, 
  MessageSquare, 
  Trash2, 
  Bell,
  Camera,
  Search,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { CommunicationNotice, Student } from '../types';

interface ParentCommunicationViewProps {
  onBack: () => void;
}

export default function ParentCommunicationView({ onBack }: ParentCommunicationViewProps) {
  const [notices, setNotices] = useState<CommunicationNotice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState<Partial<CommunicationNotice>>({
    title: '',
    message: '',
    photoUrl: '',
    recipients: ['all']
  });

  useEffect(() => {
    const unsubNotices = onSnapshot(query(collection(db, 'communication'), orderBy('date', 'desc')), snap => {
      setNotices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CommunicationNotice[]);
    });
    const unsubStudents = onSnapshot(collection(db, 'students'), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    return () => { unsubNotices(); unsubStudents(); };
  }, []);

  const handlePost = async () => {
    if (!newNotice.title || !newNotice.message) return;
    try {
      await addDoc(collection(db, 'communication'), {
        ...newNotice,
        date: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewNotice({ title: '', message: '', photoUrl: '', recipients: ['all'] });
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNotice({ ...newNotice, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium border border-slate-200 shadow-sm self-start"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
          ត្រឡប់ក្រោយ
        </button>

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-pink-600 text-white px-6 py-2 rounded-xl hover:bg-pink-700 transition-all shadow-lg font-black khmer-font"
        >
          <Bell className="w-5 h-5" />
          ផ្ញើសេចក្តីជូនដំណឹងថ្មី
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font flex items-center justify-center gap-3">
          <MessageSquare className="w-8 h-8 text-pink-500" />
          ទំនាក់ទំនងមាតាបិតា
        </h2>
        <p className="text-slate-500 font-medium khmer-font">ផ្ញើសារ សេចក្តីជូនដំណឹង និងរូបភាពសកម្មភាពសិស្សទៅកាន់អាណាព្យាបាល</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recipient Groups */}
        <div className="lg:col-span-4 space-y-4">
           <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100">
             <h3 className="text-lg font-black text-slate-800 khmer-font mb-4 flex items-center gap-2">
               <Users className="w-5 h-5 text-indigo-500" /> ក្រុមអាណាព្យាបាល
             </h3>
             <div className="space-y-2">
               {['all', 'grade-1', 'grade-2', 'grade-3', 'grade-4', 'grade-5', 'grade-6'].map(group => (
                 <button key={group} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <span className="font-bold text-slate-600 khmer-font">
                      {group === 'all' ? 'អាណាព្យាបាលទាំងអស់' : `ថ្នាក់ទី ${group.split('-')[1]}`}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                 </button>
               ))}
             </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
              <h4 className="text-lg font-black khmer-font mb-2">Smart Sync</h4>
              <p className="text-sm opacity-80 leading-relaxed khmer-font">សេចក្តីជូនដំណឹងទាំងនេះនឹងផ្ញើជាលក្ខណៈ Board ទៅកាន់ Group Telegram របស់អាណាព្យាបាលដោយស្វ័យប្រវត្ត។</p>
           </div>
        </div>

        {/* Notices Timeline */}
        <div className="lg:col-span-8 space-y-6">
           {notices.length > 0 ? notices.map((notice, idx) => (
             <motion.div 
               key={notice.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden"
             >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center">
                        <Bell className="w-6 h-6 text-pink-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-800 khmer-font">{notice.title}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Sent on {new Date(notice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => notice.id && deleteDoc(doc(db, 'communication', notice.id))} className="text-slate-200 hover:text-rose-500 transition-colors p-2">
                       <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-slate-600 khmer-font leading-relaxed mb-6 whitespace-pre-wrap">{notice.message}</p>
                  
                  {notice.photoUrl && (
                    <div className="rounded-3xl overflow-hidden mb-6 border border-slate-100 shadow-inner">
                      <img src={notice.photoUrl} alt="Class activity" className="w-full h-auto max-h-[400px] object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex -space-x-3">
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">A</div>
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-pink-500 flex items-center justify-center text-[10px] text-white font-bold">B</div>
                       <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold">+</div>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-500 text-xs font-black khmer-font">
                       <CheckCircle2 className="w-4 h-4" /> លោកគ្រូអ្នកគ្រូមើលឃើញ ២០ នាក់
                    </div>
                  </div>
                </div>
             </motion.div>
           )) : (
             <div className="text-center py-40 space-y-4">
                <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <p className="text-slate-400 khmer-font font-bold text-lg">មិនទាន់មានសេចក្តីជូនដំណឹងទេ</p>
             </div>
           )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl relative my-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
              <Trash2 className="w-8 h-8 rotate-45 text-slate-300" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 khmer-font mb-6">ផ្ញើសេចក្តីជូនដំណឹងថ្មី</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase khmer-font">ចំណងជើង</label>
                <input 
                  type="text" 
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                  placeholder="ឧ. ការឈប់សម្រាកបុណ្យអុំទូក"
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none khmer-font font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase khmer-font">ខ្លឹមសារសារ</label>
                <textarea 
                  rows={4}
                  value={newNotice.message}
                  onChange={(e) => setNewNotice({...newNotice, message: e.target.value})}
                  placeholder="សរសេរសារជូនដំណឹងនៅទីនេះ..."
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-pink-500 focus:outline-none khmer-font leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase khmer-font">ជ្រើសរើសក្រុមទទួល</label>
                  <select 
                     multiple
                     value={newNotice.recipients}
                     onChange={(e) => {
                       const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                       setNewNotice({...newNotice, recipients: options});
                     }}
                     className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 khmer-font font-bold focus:ring-2 focus:ring-pink-500 outline-none h-32"
                  >
                    <option value="all">អាណាព្យាបាលទាំងអស់</option>
                    {[1,2,3,4,5,6].map(g => <option key={g} value={`grade-${g}`}>ថ្នាក់ទី {g}</option>)}
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium">* ប្រើ CTRL ដើម្បីជ្រើសរើសច្រើន</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase khmer-font">ភ្ជាប់រូបភាព (សកម្មភាព)</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-pink-300 transition-all bg-slate-50 overflow-hidden">
                       {newNotice.photoUrl ? (
                         <img src={newNotice.photoUrl} className="w-full h-full object-cover" />
                       ) : (
                         <>
                           <Camera className="w-8 h-8 text-slate-300 group-hover:text-pink-400 transition-colors" />
                           <span className="text-xs font-bold text-slate-400 khmer-font">ស្វែងរករូបភាព</span>
                         </>
                       )}
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handlePost}
                className="w-full bg-pink-600 text-white py-5 rounded-[2rem] font-black khmer-font text-lg hover:bg-pink-700 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                <Send className="w-6 h-6" />
                ផ្ញើសេចក្តីជូនដំណឹង
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
