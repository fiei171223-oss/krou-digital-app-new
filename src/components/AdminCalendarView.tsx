import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  MapPin, 
  Info,
  Trash2,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Bookmark,
  CheckSquare,
  LayoutList
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, updateDoc } from 'firebase/firestore';
import { TeacherSchedule, AdminTask } from '../types';

interface AdminCalendarViewProps {
  onBack: () => void;
}

interface SchoolEvent {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  type: 'academic' | 'holiday' | 'event' | 'meeting';
}

export default function AdminCalendarView({ onBack }: AdminCalendarViewProps) {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'events' | 'schedule' | 'tasks'>('events');

  const schedule: TeacherSchedule[] = [
    { day: 'Monday', periods: [{ time: '7:00 - 8:00', subject: 'ភាសាខ្មែរ', grade: 1 }, { time: '8:00 - 9:00', subject: 'គណិតវិទ្យា', grade: 1 }] },
    { day: 'Tuesday', periods: [{ time: '7:00 - 8:00', subject: 'វិទ្យាសាស្ត្រ', grade: 1 }, { time: '8:00 - 9:00', subject: 'សិក្សាសង្គម', grade: 1 }] },
  ];

  useEffect(() => {
    const unsubEvents = onSnapshot(query(collection(db, 'events'), orderBy('date', 'asc')), snap => {
      setEvents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SchoolEvent[]);
    });
    const unsubTasks = onSnapshot(query(collection(db, 'tasks'), orderBy('date', 'desc')), snap => {
      setTasks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AdminTask[]);
    });
    return () => { unsubEvents(); unsubTasks(); };
  }, []);

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      date: formData.get('date'),
      time: formData.get('time'),
      location: formData.get('location'),
      description: formData.get('description'),
      type: formData.get('type'),
    };
    await addDoc(collection(db, 'events'), data);
    setShowAddModal(false);
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

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
           <button onClick={() => setActiveTab('events')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'events' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>ព្រឹត្តិការណ៍</button>
           <button onClick={() => setActiveTab('schedule')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>កាលវិភាគ</button>
           <button onClick={() => setActiveTab('tasks')} className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'tasks' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Check-list</button>
        </div>

        <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
           <Plus className="w-5 h-5" /> បន្ថែម{activeTab === 'tasks' ? 'កិច្ចការ' : 'កម្មវិធី'}
        </button>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">
          {activeTab === 'events' ? 'ប្រតិទិនរដ្ឋបាល និងព្រឹត្តិការណ៍សាលា' : 
           activeTab === 'schedule' ? 'កាលវិភាគបង្រៀនប្រចាំសប្តាហ៍' : 'បញ្ជី Check-list ការងារប្រចាំថ្ងៃ'}
        </h2>
        <p className="text-slate-500 font-medium khmer-font">
          {activeTab === 'events' ? 'គ្រប់គ្រងកាលវិភាគសិក្សា និងកម្មវិធីបុណ្យផ្សេងៗ' : 
           activeTab === 'schedule' ? 'កាលវិភាគបង្រៀន និងកិច្ចសន្យាបុគ្គលគ្រូ' : 'បញ្ជីការងារដែលត្រូវធ្វើរាល់ថ្ងៃ (Admin Tasks)'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            {activeTab === 'events' && (
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 h-fit">
                <h3 className="text-xl font-black text-slate-800 khmer-font mb-6 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6 text-indigo-500" /> កម្មវិធីសិក្សា និងបុណ្យជាតិ
                </h3>
                <div className="space-y-4">
                   {events.length === 0 ? (
                     <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                        <p className="text-slate-400 font-bold khmer-font">មិនទាន់មានកម្មវិធីគ្រោងទុកនៅឡើយ</p>
                     </div>
                   ) : (
                     events.map(event => (
                       <div key={event.id} className="flex gap-4 p-5 bg-white rounded-3xl border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all group relative">
                          <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 ${
                            event.type === 'holiday' ? 'bg-rose-50 text-rose-600' :
                            event.type === 'meeting' ? 'bg-indigo-50 text-indigo-600' :
                            event.type === 'academic' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                             <span className="text-[10px] font-black uppercase">{new Date(event.date).toLocaleString('en-US', { month: 'short' })}</span>
                             <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                          </div>
                          <div className="flex-1 space-y-1">
                             <h4 className="font-black text-slate-800 khmer-font">{event.title}</h4>
                             <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                             </div>
                          </div>
                          <button onClick={async () => { if(confirm('លុបកម្មវិធីនេះ?')) await deleteDoc(doc(db, 'events', event.id!)) }} className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-50 rounded-lg transition-all self-center">
                             <Trash2 className="w-5 h-5" />
                          </button>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                 <h3 className="text-xl font-black text-slate-800 khmer-font mb-6 flex items-center gap-2">
                   <Clock3 className="w-6 h-6 text-indigo-500" /> កាលវិភាគបង្រៀន
                 </h3>
                 <div className="space-y-6">
                    {schedule.map(day => (
                      <div key={day.day} className="space-y-3">
                         <h4 className="font-bold text-[#002B5B] uppercase tracking-wider text-xs px-2 border-l-4 border-indigo-500 bg-indigo-50/50 py-1">{day.day}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {day.periods.map((p, i) => (
                              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-indigo-300 transition-all">
                                 <div>
                                    <p className="text-xs font-black text-slate-400 uppercase mb-1">{p.time}</p>
                                    <p className="font-black text-slate-800 khmer-font">{p.subject}</p>
                                 </div>
                                 <div className="bg-indigo-50 px-3 py-1 rounded-lg text-[10px] font-black text-indigo-600">ថ្នាក់ទី {p.grade}</div>
                              </div>
                            ))}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 khmer-font mb-6 flex items-center gap-2">
                  <CheckSquare className="w-6 h-6 text-indigo-500" /> បញ្ជីការងារប្រចាំថ្ងៃ
                </h3>
                <div className="space-y-3">
                   {tasks.length === 0 ? (
                     <div className="text-center py-10 text-slate-400 font-bold khmer-font">ពុំមានកិច្ចការទេ</div>
                   ) : (
                     tasks.map(task => (
                       <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group transition-all">
                          <div className="flex items-center gap-4">
                             <button 
                               onClick={() => updateDoc(doc(db, 'tasks', task.id!), { isDone: !task.isDone })}
                               className={`p-1 rounded-lg border-2 transition-all ${task.isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 text-transparent'}`}
                             >
                               <CheckCircle2 className="w-5 h-5" />
                             </button>
                             <span className={`font-bold khmer-font ${task.isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{task.title}</span>
                          </div>
                          <button onClick={() => deleteDoc(doc(db, 'tasks', task.id!))} className="opacity-0 group-hover:opacity-100 text-rose-400 p-2"><Trash2 className="w-5 h-5" /></button>
                       </div>
                     ))
                   )}
                </div>
              </div>
            )}
         </div>

         <div className="space-y-8">
            <div className="bg-indigo-600 p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden">
               <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
               <h3 className="text-xl font-black khmer-font mb-4 flex items-center gap-2">
                 <Bell className="w-6 h-6 text-amber-300" /> សេចក្ដីជូនដំណឹងរហ័ស
               </h3>
               <p className="text-indigo-100 text-sm khmer-font mb-6 leading-relaxed">
                 រាល់កម្មវិធីដែលបានបញ្ចូលនឹងត្រូវបានបង្ហាញលើ Dashboard របស់គ្រូបង្រៀន និង App របស់មាតាបិតាដោយស្វ័យប្រវត្តិ។
               </p>
               <div className="flex gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">Total Events</p>
                     <p className="text-2xl font-black">{events.length}</p>
                  </div>
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                     <p className="text-[10px] font-black uppercase text-indigo-300 mb-1">This Month</p>
                     <p className="text-2xl font-black">{events.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length}</p>
                  </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
               <h3 className="text-lg font-black text-slate-800 khmer-font mb-4">កំណត់ចំណាំរដ្ឋបាល</h3>
               <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                     <AlertCircle className="w-5 h-5 text-amber-600 mt-1" />
                     <p className="text-xs font-bold text-amber-800 khmer-font leading-relaxed">សូមកុំភ្លេចពិនិត្យមើលកាលបរិច្ឆេទប្រឡងឆមាសទី ២ ដើម្បីបញ្ចូលក្នុងកម្មវិធីសាលា។</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10">
              <form onSubmit={handleAddEvent} className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800 khmer-font">បន្ថែមព្រឹត្តិការណ៍</h3>
                    <button type="button" onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><Plus className="w-6 h-6 rotate-45 text-slate-400" /></button>
                 </div>

                 <div className="space-y-4">
                    <InputField label="ឈ្មោះកម្មវិធី" name="title" required />
                    <div className="grid grid-cols-2 gap-4">
                       <InputField label="កាលបរិច្ឆេទ" name="date" type="date" required />
                       <InputField label="ម៉ោង" name="time" type="time" required />
                    </div>
                    <InputField label="ទីកន្លែង" name="location" placeholder="ឧ: ទីធ្លាសាលា, បន្ទប់ប្រជុំ..." />
                    
                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest khmer-font">ប្រភេទកម្មវិធី</label>
                       <select name="type" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold khmer-font outline-none">
                          <option value="academic">ការសិក្សា</option>
                          <option value="holiday">ថ្ងៃឈប់សម្រាក</option>
                          <option value="event">ពិធីបុណ្យផ្សេងៗ</option>
                          <option value="meeting">ការប្រជុំ</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest khmer-font">ការពិពណ៌នា</label>
                       <textarea name="description" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold khmer-font outline-none h-24" placeholder="ព័ត៌មានបន្ថែមអំពីកម្មវិធី..."></textarea>
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black khmer-font text-xl shadow-xl hover:bg-indigo-700 transition-all">
                    រក្សាទុកកម្មវិធី
                 </button>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function InputField({ label, name, type = "text", placeholder, required = false }: any) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest khmer-font">{label}</label>
      <input 
        name={name} 
        type={type} 
        required={required}
        placeholder={placeholder}
        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700" 
      />
    </div>
  );
}
