import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Users, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Shuffle, 
  Settings, 
  LayoutGrid,
  CheckCircle2,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { ChecklistItem, Student } from '../types';

interface TeacherToolboxViewProps {
  onBack: () => void;
}

export default function TeacherToolboxView({ onBack }: TeacherToolboxViewProps) {
  const [activeTab, setActiveTab] = useState<'checklist' | 'groups'>('checklist');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [newTask, setNewTask] = useState('');
  
  // Group Gen State
  const [groupSize, setGroupSize] = useState(4);
  const [generatedGroups, setGeneratedGroups] = useState<Student[][]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const unsubCheck = onSnapshot(query(collection(db, 'checklist'), orderBy('completed', 'asc')), snap => {
      setChecklist(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChecklistItem[]);
    });
    const unsubStudents = onSnapshot(collection(db, 'students'), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    return () => { unsubCheck(); unsubStudents(); };
  }, []);

  const addTask = async () => {
    if (!newTask) return;
    await addDoc(collection(db, 'checklist'), {
      task: newTask,
      completed: false,
      category: 'teaching'
    });
    setNewTask('');
  };

  const generateGroups = () => {
    if (students.length === 0) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const shuffled = [...students].sort(() => Math.random() - 0.5);
      const groups: Student[][] = [];
      
      for (let i = 0; i < shuffled.length; i += groupSize) {
        groups.push(shuffled.slice(i, i + groupSize));
      }
      
      setGeneratedGroups(groups);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium border border-slate-200 shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
          ត្រឡប់ក្រោយ
        </button>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
           <button 
             onClick={() => setActiveTab('checklist')}
             className={`px-6 py-2 rounded-xl khmer-font font-black text-sm transition-all ${activeTab === 'checklist' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             Check-list ការងារ
           </button>
           <button 
             onClick={() => setActiveTab('groups')}
             className={`px-6 py-2 rounded-xl khmer-font font-black text-sm transition-all ${activeTab === 'groups' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
           >
             បែងចែកក្រុម
           </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'checklist' ? (
          <motion.div 
            key="checklist"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
             <div className="text-center space-y-2 mb-10">
                <h2 className="text-3xl font-black text-slate-800 khmer-font flex items-center justify-center gap-3">
                  <CheckSquare className="w-8 h-8 text-emerald-500" />
                  បញ្ជីកិច្ចការគ្រូបង្រៀន (To-do List)
                </h2>
                <p className="text-slate-500 font-medium khmer-font">កត់ត្រា និងតាមដានកិច្ចការរដ្ឋបាល បង្រៀន និងហិរញ្ញវត្ថុ</p>
             </div>

             <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex gap-4">
                   <input 
                     type="text" 
                     value={newTask}
                     onChange={(e) => setNewTask(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && addTask()}
                     placeholder="បន្ថែមភារកិច្ចថ្មី..."
                     className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold khmer-font outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
                   />
                   <button 
                     onClick={addTask}
                     className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-600 transition-colors shadow-lg"
                   >
                     <Plus className="w-6 h-6" />
                   </button>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                  {checklist.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors group ${item.completed ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => item.id && updateDoc(doc(db, 'checklist', item.id), { completed: !item.completed })}
                          className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${item.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' : 'border-slate-200'}`}
                        >
                          {item.completed && <CheckCircle2 className="w-5 h-5" />}
                        </button>
                        <span className={`text-lg font-bold khmer-font ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.task}</span>
                      </div>
                      <button 
                        onClick={() => item.id && deleteDoc(doc(db, 'checklist', item.id))}
                        className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))}
                  {checklist.length === 0 && (
                    <div className="p-20 text-center text-slate-300 font-bold khmer-font italic">មិនទាន់មានភារកិច្ចនៅឡើយ...</div>
                  )}
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div 
            key="groups"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
             <div className="text-center space-y-2 mb-10">
                <h2 className="text-3xl font-black text-slate-800 khmer-font flex items-center justify-center gap-3">
                  <LayoutGrid className="w-8 h-8 text-amber-500" />
                  ជំនួយការបែងចែកក្រុម (Group Generator)
                </h2>
                <p className="text-slate-500 font-medium khmer-font">បែងចែកសិស្សក្នុងថ្នាក់ជាក្រុមដោយស្វ័យប្រវត្ត និងចៃដន្យ</p>
             </div>

             <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 max-w-4xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 border-b border-slate-50 pb-10">
                   <div className="space-y-3 text-center md:text-left">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">កំណត់ចំនួនសិស្សក្នុង ១ ក្រុម</label>
                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                         <button onClick={() => setGroupSize(Math.max(2, groupSize - 1))} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 font-black text-xl text-slate-600 hover:bg-slate-100 transition-colors">-</button>
                         <span className="text-2xl font-black text-indigo-600 min-w-[3ch] text-center">{groupSize}</span>
                         <button onClick={() => setGroupSize(groupSize + 1)} className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 font-black text-xl text-slate-600 hover:bg-slate-100 transition-colors">+</button>
                      </div>
                   </div>
                   
                   <div className="flex flex-col items-center gap-1">
                      <button 
                        onClick={generateGroups}
                        disabled={isGenerating || students.length === 0}
                        className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black khmer-font text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-3 disabled:opacity-50"
                      >
                        {isGenerating ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Shuffle className="w-6 h-6" />}
                        ចាប់ផ្ដើមបែងចែក
                      </button>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Total: {students.length} Students</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {generatedGroups.map((group, idx) => (
                     <motion.div 
                       key={idx}
                       initial={{ scale: 0.9, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ delay: idx * 0.1 }}
                       className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4"
                     >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                           <h4 className="font-black text-indigo-600 khmer-font">ក្រុមទី {idx + 1}</h4>
                           <span className="text-[10px] font-black bg-white px-3 py-1 rounded-full text-slate-400 border border-slate-100">{group.length} នាក់</span>
                        </div>
                        <ul className="space-y-2">
                           {group.map((s, sIdx) => (
                             <li key={s.id} className="flex items-center gap-3">
                               <div className="w-6 h-6 bg-white rounded-full border border-slate-100 text-[10px] font-black flex items-center justify-center text-slate-400">{sIdx + 1}</div>
                               <span className="text-sm font-bold text-slate-700 khmer-font">{s.name}</span>
                             </li>
                           ))}
                        </ul>
                     </motion.div>
                   ))}
                </div>

                {generatedGroups.length === 0 && !isGenerating && (
                  <div className="py-20 text-center space-y-4">
                     <div className="w-32 h-32 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto opacity-50">
                        <Users className="w-16 h-16 text-slate-200" />
                     </div>
                     <p className="text-slate-300 khmer-font font-bold">ចុចប៊ូតុងខាងលើដើម្បីបែងចែកក្រុម</p>
                  </div>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
