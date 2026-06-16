import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Users, 
  Layout, 
  Sparkles, 
  Trash2, 
  X,
  Plus, 
  Save, 
  Printer, 
  Calendar,
  Grid,
  RefreshCw,
  User,
  Clock
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, collection, getDocs } from 'firebase/firestore';
import { Student, Grade } from '../types';

interface ClassroomManagementViewProps {
  onBack: () => void;
  students: Student[];
}

interface SeatingSeat {
  studentId: string | null;
  seatId: number;
}

interface CleaningShift {
  day: string;
  team: string;
  leader: string;
  members: string[];
}

export default function ClassroomManagementView({ onBack, students }: ClassroomManagementViewProps) {
  const [activeTab, setActiveTab] = useState<'seating' | 'cleaning' | 'rules'>('seating');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(4);
  const [seating, setSeating] = useState<SeatingSeat[]>([]);
  const [cleaningShifts, setCleaningShifts] = useState<CleaningShift[]>([
    { day: 'ចន្ទ', team: 'ក្រុមទី ១', leader: 'សុខ សៅ', members: ['សុខ សៅ', 'មាស ស្រីមុំ', 'ណុប សុភ័ក្រ'] },
    { day: 'អង្គារ', team: 'ក្រុមទី ២', leader: 'ចាន់ ធារ៉ា', members: ['ចាន់ ធារ៉ា', 'អ៊ុំ បុប្ផា', 'ស៊ឹម សុភា'] },
    { day: 'ពុធ', team: 'ក្រុមទី ៣', leader: 'កែវ ផល្លា', members: ['កែវ ផល្លា', 'ស៊ុន ធីតាមុំ', 'សាន សុខ'] },
    { day: 'ព្រហស្បតិ៍', team: 'ក្រុមទី ៤', leader: 'ឌី ចាន់ដារ៉ា', members: ['ឌី ចាន់ដារ៉ា', 'ម៉ៅ វតី', 'ឃុន វិបុល'] },
    { day: 'សុក្រ', team: 'ក្រុមទី ៥', leader: 'សឹង្ហ គន្ធា', members: ['សឹង្ហ គន្ធា', 'លឹម គឹមហួយ', 'នួន ចន្ធូ'] },
  ]);
  const [loading, setLoading] = useState(true);
  const [selectedSeatIdx, setSelectedSeatIdx] = useState<number | null>(null);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'normal' | 'exam'>('normal');

  useEffect(() => {
    const unsubSeating = onSnapshot(doc(db, 'classroom_config', layoutMode === 'normal' ? 'seating' : 'seating_exam'), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setRows(data.rows || 5);
        setCols(data.cols || 4);
        setSeating(data.layout || []);
      } else {
        // Init empty
        const initial = Array.from({ length: rows * cols }, (_, i) => ({
          seatId: i,
          studentId: null
        }));
        setSeating(initial);
      }
      setLoading(false);
    });

    const unsubCleaning = onSnapshot(doc(db, 'classroom_config', 'cleaning'), (doc) => {
      if (doc.exists()) {
        setCleaningShifts(doc.data().shifts || []);
      }
    });

    return () => {
      unsubSeating();
      unsubCleaning();
    };
  }, [layoutMode]);

  const saveSeating = async () => {
    await setDoc(doc(db, 'classroom_config', layoutMode === 'normal' ? 'seating' : 'seating_exam'), {
      rows,
      cols,
      layout: seating,
      updatedAt: new Date().toISOString()
    });
    alert('រក្សាទុកប្លង់តុបានជោគជ័យ!');
  };

  const saveCleaning = async () => {
    await setDoc(doc(db, 'classroom_config', 'cleaning'), {
      shifts: cleaningShifts,
      updatedAt: new Date().toISOString()
    });
    alert('រក្សាទុកវេនសម្អាតបានជោគជ័យ!');
  };

  const handleSeatClick = (idx: number) => {
    setSelectedSeatIdx(idx);
    setShowStudentPicker(true);
  };

  const assignStudentToSeat = (studentId: string | null) => {
    if (selectedSeatIdx === null) return;
    
    const newSeating = [...seating];
    
    // If student was already in another seat, clear it
    if (studentId) {
      const existingIdx = newSeating.findIndex(s => s.studentId === studentId);
      if (existingIdx !== -1) newSeating[existingIdx].studentId = null;
    }

    newSeating[selectedSeatIdx].studentId = studentId;
    setSeating(newSeating);
    setShowStudentPicker(false);
    setSelectedSeatIdx(null);
  };

  const autoGenerateSeating = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newSeating = Array.from({ length: rows * cols }, (_, i) => ({
      seatId: i,
      studentId: shuffled[i]?.id || null
    }));
    setSeating(newSeating);
  };

  const resetGrid = () => {
    const initial = Array.from({ length: rows * cols }, (_, i) => ({
      seatId: i,
      studentId: null
    }));
    setSeating(initial);
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
            onClick={() => setActiveTab('seating')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'seating' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            ប្លង់តុសិស្ស
          </button>
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
        <p className="text-slate-500 font-medium khmer-font">ប្លង់តុ វេនសម្អាត និងវិន័យក្នុងសាលារៀន</p>
      </div>

      {activeTab === 'seating' ? (
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
             <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-3">
                   <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Layout className="w-8 h-8 text-indigo-600" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-800 khmer-font">រៀបចំប្លង់តុអង្គុយសិស្ស</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Seating Arrangement Grid</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button 
                        onClick={() => setLayoutMode('normal')}
                        className={`px-4 py-1.5 rounded-lg font-black khmer-font text-[10px] transition-all ${layoutMode === 'normal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                         ប្លង់ធម្មតា
                      </button>
                      <button 
                        onClick={() => setLayoutMode('exam')}
                        className={`px-4 py-1.5 rounded-lg font-black khmer-font text-[10px] transition-all ${layoutMode === 'exam' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                      >
                         ប្លង់ប្រឡង
                      </button>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Rows:</span>
                      <input type="number" value={rows} onChange={e => setRows(Number(e.target.value))} className="w-12 px-2 py-1 border rounded-lg font-bold text-xs" />
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Cols:</span>
                      <input type="number" value={cols} onChange={e => setCols(Number(e.target.value))} className="w-12 px-2 py-1 border rounded-lg font-bold text-xs" />
                   </div>
                   <button onClick={resetGrid} className="p-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all" title="Reset Grid">
                      <RefreshCw className="w-4 h-4" />
                   </button>
                </div>
             </div>

             <div className="bg-slate-900 mx-auto w-full max-w-4xl h-12 rounded-t-3xl flex items-center justify-center mb-8">
                <span className="text-white font-black khmer-font text-sm uppercase tracking-[0.2em]">ក្ដារខៀន / Board</span>
             </div>

             <div 
               className="grid gap-4 mx-auto max-w-4xl"
               style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
             >
                {seating.map((seat, idx) => {
                  const student = students.find(s => s.id === seat.studentId);
                  return (
                    <motion.div 
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleSeatClick(idx)}
                      className={`aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center p-2 relative cursor-pointer transition-all ${
                        student ? 'bg-white border-indigo-200 shadow-lg shadow-indigo-100/50' : 'bg-slate-50 border-dashed border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {student ? (
                        <>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black mb-1 ${student.gender === 'female' || student.gender === 'ស្រី' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                             {student.name.charAt(0)}
                          </div>
                          <span className="text-[10px] font-black khmer-font text-center leading-tight truncate w-full px-1">{student.name}</span>
                          <span className="absolute top-1 right-1 text-[8px] font-bold text-slate-300">#{idx + 1}</span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                           <Plus className="w-5 h-5 text-slate-300" />
                           <span className="text-[8px] font-bold text-slate-300 uppercase">Available</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
             </div>

             <div className="mt-12 flex flex-col md:flex-row justify-center gap-4">
                <button 
                  onClick={saveSeating}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-[2rem] font-black khmer-font shadow-xl shadow-indigo-100 flex items-center gap-3 hover:bg-indigo-700 transition-all"
                >
                   <Save className="w-6 h-6" /> រក្សាទុកប្លង់តុថ្នាក់រៀន
                </button>
                <button 
                  onClick={autoGenerateSeating}
                  className="bg-amber-100 text-amber-600 px-8 py-4 rounded-[2rem] font-black khmer-font flex items-center gap-3 hover:bg-amber-200 transition-all"
                >
                   <RefreshCw className="w-6 h-6" /> ផ្លាស់ប្តូរដោយចៃដន្យ
                </button>
             </div>
          </div>
        </div>
      ) : activeTab === 'cleaning' ? (
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
      <AnimatePresence>
        {showStudentPicker && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStudentPicker(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-800 khmer-font">ជ្រើសរើសសិស្សដាក់ក្នុងតុ</h3>
                <button onClick={() => setShowStudentPicker(false)} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    onClick={() => assignStudentToSeat(null)}
                    className="p-4 rounded-2xl bg-rose-50 text-rose-600 font-black khmer-font text-sm flex items-center justify-center border-2 border-transparent hover:border-rose-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> ទុកតុកៅអីនេះទំនេរ
                  </button>
                  <div className="h-4" />
                  {students.map(s => {
                    const isAssigned = seating.some(seat => seat.studentId === s.id);
                    return (
                      <button
                        key={s.id}
                        disabled={isAssigned}
                        onClick={() => assignStudentToSeat(s.id)}
                        className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${
                          isAssigned ? 'bg-slate-50 border-transparent opacity-50 grayscale cursor-not-allowed' : 'bg-white border-slate-100 hover:border-indigo-600 hover:bg-indigo-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${s.gender === 'female' || s.gender === 'ស្រី' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                            {s.name.charAt(0)}
                          </div>
                          <span className="font-black text-slate-700 khmer-font text-sm">{s.name}</span>
                        </div>
                        {isAssigned && <span className="text-[9px] font-black khmer-font text-slate-400">មានកន្លែងហើយ</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
