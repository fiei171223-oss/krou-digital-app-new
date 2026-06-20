import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Bell, 
  User, 
  ChevronRight,
  Monitor
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { ScheduleEntry } from '../types';

interface TeachingScheduleViewProps {
  onBack: () => void;
}

const DAYS = [
  { id: 'Monday', name: 'ចន្ទ', en: 'Monday' },
  { id: 'Tuesday', name: 'អង្គារ', en: 'Tuesday' },
  { id: 'Wednesday', name: 'ពុធ', en: 'Wednesday' },
  { id: 'Thursday', name: 'ព្រហស្បតិ៍', en: 'Thursday' },
  { id: 'Friday', name: 'សុក្រ', en: 'Friday' },
  { id: 'Saturday', name: 'សៅរ៍', en: 'Saturday' }
];

const TIMES = [
  "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", 
  "10:00 - 10:30 (សម្រាក)", "10:30 - 11:30",
  "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"
];

export default function TeachingScheduleView({ onBack }: TeachingScheduleViewProps) {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<ScheduleEntry>>({
    day: 'Monday',
    time: '07:00 - 08:00',
    subject: '',
    grade: ''
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'schedule'), snap => {
      setSchedule(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScheduleEntry[]);
    });
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!newEntry.subject || !newEntry.grade) return;
    try {
      await addDoc(collection(db, 'schedule'), newEntry);
      setShowAddModal(false);
      setNewEntry({ day: 'Monday', time: '07:00 - 08:00', subject: '', grade: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const getEntry = (day: string, time: string) => 
    schedule.find(s => s.day === day && s.time === time);

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
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-black khmer-font"
        >
          <Plus className="w-5 h-5" />
          បន្ថែមម៉ោងបង្រៀន
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font flex items-center justify-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-500" />
          កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍
        </h2>
        <p className="text-slate-500 font-medium khmer-font">គ្រប់គ្រងម៉ោងសិក្សា និងកំណត់ Reminder លោតសញ្ញាប្រាប់មុនពេលចូលបង្រៀន</p>
      </div>

      {/* Reminder Banner */}
      <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
           <div className="p-3 bg-amber-500 rounded-2xl text-white animate-bounce-slow">
             <Bell className="w-6 h-6" />
           </div>
           <div>
             <h4 className="font-black text-amber-700 khmer-font text-lg">Smart Reminder</h4>
             <p className="text-amber-600/80 text-sm khmer-font">ប្រព័ន្ធនឹងផ្ដល់ការជូនដំណឹង ៥ នាទីមុនពេលចាប់ផ្ដើមម៉ោងថ្មី</p>
           </div>
         </div>
         <div className="hidden sm:block">
            <span className="text-xs font-black text-amber-500 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full border border-amber-100">ON STANDBY</span>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-left border-r border-slate-100 w-40">
                   <div className="flex items-center gap-2 text-slate-400">
                     <Clock className="w-4 h-4" />
                     <span className="text-xs font-black uppercase tracking-wider">Time / Day</span>
                   </div>
                </th>
                {DAYS.map(day => (
                  <th key={day.id} className="p-6 text-center border-r border-slate-100 min-w-[150px]">
                    <span className="block text-xl font-black text-slate-800 khmer-font">{day.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase select-none">{day.en}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIMES.map((time, idx) => (
                <tr key={idx} className={`${time.includes('សម្រាក') ? 'bg-amber-50/30 font-medium' : 'hover:bg-slate-50/30'}`}>
                  <td className="p-6 border-r border-b border-slate-100">
                    <span className="text-sm font-black text-slate-500">{time}</span>
                  </td>
                  {DAYS.map(day => {
                    const entry = getEntry(day.id, time);
                    return (
                      <td key={`${day.id}-${time}`} className="p-4 border-r border-b border-slate-100 relative group">
                        {entry ? (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl relative"
                          >
                            <h4 className="text-indigo-700 font-black khmer-font leading-tight mb-1">{entry.subject}</h4>
                            <p className="text-indigo-400 text-[10px] font-bold uppercase">{entry.grade}</p>
                            <button 
                              onClick={async () => { if(entry.id) await deleteDoc(doc(db, 'schedule', entry.id)) }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ) : time.includes('សម្រាក') ? (
                          <div className="flex items-center justify-center">
                            <Monitor className="w-5 h-5 text-amber-200" />
                          </div>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
              <Plus className="w-8 h-8 rotate-45 text-slate-400" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 khmer-font mb-6">បន្ថែមម៉ោងសិក្សា</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase khmer-font">ថ្ងៃ</label>
                    <select 
                      value={newEntry.day}
                      onChange={(e) => setNewEntry({...newEntry, day: e.target.value as any})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-bold khmer-font"
                    >
                      {DAYS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase khmer-font">ម៉ោង</label>
                    <select 
                      value={newEntry.time}
                      onChange={(e) => setNewEntry({...newEntry, time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-bold"
                    >
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="block text-xs font-black text-slate-400 uppercase khmer-font">មុខវិជ្ជា</label>
                 <input 
                   type="text" 
                   value={newEntry.subject} 
                   onChange={(e) => setNewEntry({...newEntry, subject: e.target.value})}
                   placeholder="ឧ. ភាសាខ្មែរ"
                   className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-bold khmer-font"
                 />
              </div>
              <div className="space-y-2">
                 <label className="block text-xs font-black text-slate-400 uppercase khmer-font">កម្រិតថ្នាក់</label>
                 <input 
                   type="text" 
                   value={newEntry.grade} 
                   onChange={(e) => setNewEntry({...newEntry, grade: e.target.value})}
                   placeholder="ឧ. ថ្នាក់ទី ៦-ក"
                   className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-slate-100 font-bold khmer-font"
                 />
              </div>
              <button 
                onClick={handleAdd}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font text-lg hover:bg-indigo-700 transition-all shadow-lg"
              >
                រក្សាកាលវិភាគ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
