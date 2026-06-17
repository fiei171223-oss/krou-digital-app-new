import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Trash2, 
  X,
  Plus, 
  Save, 
  User,
  Clock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Student } from '../types';

interface ClassroomManagementViewProps {
  onBack: () => void;
  students: Student[];
}

interface CleaningShift {
  day: string;
  team: string;
  leader: string;
  members: string[];
}

export default function ClassroomManagementView({ onBack, students }: ClassroomManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'cleaning' | 'rules'>('cleaning');
  const [cleaningShifts, setCleaningShifts] = useState<CleaningShift[]>([
    { day: 'ចន្ទ', team: 'ក្រុមទី ១', leader: 'សុខ សៅ', members: ['សុខ សៅ', 'មាស ស្រីមុំ', 'ណុប សុភ័ក្រ'] },
    { day: 'អង្គារ', team: 'ក្រុមទី ២', leader: 'ចាន់ ធារ៉ា', members: ['ចាន់ ធារ៉ា', 'អ៊ុំ បុប្ផា', 'ស៊ឹម សុភា'] },
    { day: 'ពុធ', team: 'ក្រុមទី ៣', leader: 'កែវ ផល្លា', members: ['កែវ ផល្លា', 'ស៊ុន ធីតាមុំ', 'សាន សុខ'] },
    { day: 'ព្រហស្បតិ៍', team: 'ក្រុមទី ៤', leader: 'ឌី ចាន់ដារ៉ា', members: ['ឌី ចាន់ដារ៉ា', 'ម៉ៅ វតី', 'ឃុន វិបុល'] },
    { day: 'សុក្រ', team: 'ក្រុមទី ៥', leader: 'សឹង្ហ គន្ធា', members: ['សឹង្ហ គន្ធា', 'លឹម គឹមហួយ', 'នួន ចន្ធូ'] },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubCleaning = onSnapshot(doc(db, 'classroom_config', 'cleaning'), (doc) => {
      if (doc.exists()) {
        setCleaningShifts(doc.data().shifts || []);
      }
      setLoading(false);
    });

    return () => {
      unsubCleaning();
    };
  }, []);

  const saveCleaning = async () => {
    await setDoc(doc(db, 'classroom_config', 'cleaning'), {
      shifts: cleaningShifts,
      updatedAt: new Date().toISOString()
    });
    alert('រក្សាទុកវេនសម្អាតបានជោគជ័យ!');
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

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('cleaning')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'cleaning' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            វេនសម្អាត
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'rules' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            វិន័យថ្នាក់
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">គ្រប់គ្រងបរិស្ថាន និងវិន័យធ្ន្នាក់</h2>
        <p className="text-slate-500 font-medium khmer-font">វេនសម្អាត និងវិន័យក្នុងសាលារៀន</p>
      </div>

      {activeTab === 'cleaning' ? (
        <div className="space-y-8">
           <div className="flex justify-end">
              <button onClick={saveCleaning} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black khmer-font flex items-center gap-2 shadow-lg hover:bg-emerald-700 transition-all">
                <Save className="w-5 h-5" /> រក្សាទុកវេនសម្អាត
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {cleaningShifts.map((shift, idx) => (
             <motion.div 
               key={idx}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6 relative overflow-hidden group"
             >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                   <Sparkles className="w-16 h-16 text-emerald-600" />
                </div>

                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center text-emerald-600">
                      <span className="text-[10px] uppercase font-black">ថ្ងៃ</span>
                      <span className="text-2xl font-black khmer-font leading-none">{shift.day}</span>
                   </div>
                   <div>
                      <h4 className="text-xl font-black text-slate-800 khmer-font">{shift.team}</h4>
                      <div className="flex items-center gap-2 text-emerald-600 mt-1">
                         <User className="w-3.5 h-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">ប្រធាន៖ {shift.leader}</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">សមាជិកក្រុម / Members</p>
                   <div className="grid grid-cols-1 gap-2">
                      {shift.members.map((member, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                           <span className="text-sm font-bold text-slate-700 khmer-font">{member}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </motion.div>
           ))}
           </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
           <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 space-y-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
              
              <div className="text-center space-y-4 relative">
                 <h3 className="text-4xl font-black text-slate-900 khmer-font">បទបញ្ជាផ្ទៃក្នុង និងវិន័យថ្នាក់រៀន</h3>
                 <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-xs">Classroom Rules & Regulations</p>
                 <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 gap-6 relative">
                 {[
                   { id: 1, text: 'គោរពទង់ជាតិ និងគោរពលោកគ្រូ អ្នកគ្រូ' },
                   { id: 2, text: 'ចូលរៀនឱ្យទាន់ពេលវេលា' },
                   { id: 3, text: 'រក្សាអនាម័យខ្លួនប្រាណ និងបរិស្ថានថ្នាក់រៀន' },
                   { id: 4, text: 'ស្តាប់ការពន្យល់ និងចូលរួមសកម្មភាពមេរៀន' },
                   { id: 5, text: 'មិនបង្កការរំខាន ឬប្រើប្រាស់ពាក្យអសុរោះ' },
                   { id: 6, text: 'ស្លៀកពាក់ឯកសណ្ឋានសាលាឱ្យបានត្រឹមត្រូវ' }
                 ].map(rule => (
                   <div key={rule.id} className="flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         {rule.id}
                      </div>
                      <div className="flex-grow p-5 bg-slate-50 rounded-2xl border border-slate-100 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all font-black khmer-font text-lg text-slate-700">
                         {rule.text}
                      </div>
                   </div>
                 ))}
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-3 text-slate-400">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-widest">Update: ២០២៤-២០២៥</span>
                 </div>
                 <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black khmer-font flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg scale-90 md:scale-100">
                    <Printer className="w-5 h-5" /> បោះពុម្ភបទបញ្ជាផ្ទៃក្នុង
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
