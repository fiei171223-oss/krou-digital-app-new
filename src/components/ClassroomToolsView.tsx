import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Wrench, 
  Users, 
  Layout, 
  Timer, 
  Shuffle, 
  Grid3X3, 
  BookOpen, 
  UserCircle2, 
  Award, 
  ShieldCheck,
  Star,
  Plus,
  Trash2,
  RefreshCw,
  RotateCw,
  Save,
  Printer,
  MessageCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Student } from '../types';

interface ClassroomToolsViewProps {
  onBack: () => void;
}

export default function ClassroomToolsView({ onBack }: ClassroomToolsViewProps) {
  const [activeTool, setActiveTool] = useState<'picker' | 'timer' | 'groups' | 'seating' | 'commission' | 'questions'>('picker');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'students'), orderBy('name', 'asc')), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-8 min-h-screen pb-20 font-khmer">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium border border-slate-200 shadow-sm self-start"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
          ត្រឡប់ក្រោយ
        </button>

        <div className="bg-white p-1 rounded-2xl border border-slate-200 flex flex-wrap gap-1 shadow-sm overflow-hidden">
          <ToolTab active={activeTool === 'picker'} onClick={() => setActiveTool('picker')} icon={<Users className="w-4 h-4" />} label="រើសសិស្ស" />
          <ToolTab active={activeTool === 'timer'} onClick={() => setActiveTool('timer')} icon={<Timer className="w-4 h-4" />} label="នាឡិកា" />
          <ToolTab active={activeTool === 'groups'} onClick={() => setActiveTool('groups')} icon={<Shuffle className="w-4 h-4" />} label="ក្រុម" />
          <ToolTab active={activeTool === 'seating'} onClick={() => setActiveTool('seating')} icon={<Layout className="w-4 h-4" />} label="ប្លង់តុ" />
          <ToolTab active={activeTool === 'commission'} onClick={() => setActiveTool('commission')} icon={<ShieldCheck className="w-4 h-4" />} label="គណៈកម្មការ" />
          <ToolTab active={activeTool === 'questions'} onClick={() => setActiveTool('questions')} icon={<MessageCircle className="w-4 h-4" />} label="បច្ចេកទេសសួរ" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 font-kantumruy uppercase tracking-tight">ប្រអប់ឧបករណ៍ជំនួយការបង្រៀន</h2>
        <p className="text-slate-500 font-medium font-khmer">បច្ចេកវិទ្យាជំនួយការគ្រប់គ្រងថ្នាក់រៀន</p>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <AnimatePresence mode="wait">
          {activeTool === 'picker' && <RandomPicker key="picker" students={students} />}
          {activeTool === 'timer' && <ClassTimer key="timer" />}
          {activeTool === 'groups' && <GroupGenerator key="groups" students={students} />}
          {activeTool === 'seating' && <SeatingChart key="seating" students={students} />}
          {activeTool === 'commission' && <ChildrenCommission key="commission" students={students} />}
          {activeTool === 'questions' && <QuestioningTechniques key="questions" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ToolTab({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
        active ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      {icon}
      <span className="font-khmer">{label}</span>
    </button>
  );
}

function RandomPicker({ students }: { students: Student[] }) {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const pickRandom = () => {
    if (students.length === 0 || isSpinning) return;
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudent(students[Math.floor(Math.random() * students.length)]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 text-center">
      <div className="flex flex-col items-center justify-center space-y-10 min-h-[400px]">
        <AnimatePresence mode="wait">
          {selectedStudent ? (
            <motion.div key={selectedStudent.id} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="space-y-6">
              <div className="w-56 h-56 bg-indigo-600 rounded-[3.5rem] shadow-2xl shadow-indigo-200 flex items-center justify-center text-8xl font-black text-white relative">
                 <div className="absolute -inset-6 bg-indigo-600/10 rounded-[4rem] animate-pulse"></div>
                 {selectedStudent.name.charAt(0)}
              </div>
              <h3 className="text-5xl font-black text-slate-800 font-khmer">{selectedStudent.name}</h3>
              <p className="text-indigo-500 font-black text-xs uppercase tracking-[0.3em]">Student Selected</p>
            </motion.div>
          ) : (
            <div className="w-56 h-56 bg-slate-50 rounded-[3.5rem] flex items-center justify-center text-slate-200 text-8xl font-black border-4 border-dashed border-slate-100">?</div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={pickRandom}
          disabled={isSpinning || students.length === 0}
          className="bg-slate-900 text-white px-12 py-5 rounded-[2.5rem] font-black text-xl font-khmer shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-4"
        >
          {isSpinning ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Users className="w-6 h-6" />}
          ចាប់ផ្តើមជ្រើសរើសចៃដន្យ
        </button>
      </div>
    </motion.div>
  );
}

function ClassTimer() {
  const [time, setTime] = useState(300);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isActive && time > 0) interval = setInterval(() => setTime(t => t - 1), 1000);
    else if (time === 0) setIsActive(false);
    return () => clearInterval(interval);
  }, [isActive, time]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-950 p-16 rounded-[4rem] shadow-2xl text-center relative overflow-hidden border-[8px] border-slate-900">
       <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none"></div>
       <div className="relative z-10 space-y-12">
          <div className="text-[10rem] md:text-[14rem] font-black text-white leading-none tracking-tighter tabular-nums drop-shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            {formatTime(time)}
          </div>
          <div className="flex justify-center gap-6">
             <button onClick={() => setIsActive(!isActive)} className={`px-12 py-6 rounded-3xl font-black text-2xl font-khmer transition-all shadow-xl ${isActive ? 'bg-rose-500 text-white shadow-rose-900/40' : 'bg-emerald-500 text-white shadow-emerald-900/40'}`}>
                {isActive ? 'ផ្អាក' : 'ចាប់ផ្ដើម'}
             </button>
             <button onClick={() => { setTime(300); setIsActive(false); }} className="px-12 py-6 bg-white/10 text-white rounded-3xl font-black text-2xl font-khmer hover:bg-white/20 border border-white/10">
                កំណត់ឡើងវិញ
             </button>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
             {[1, 2, 5, 10, 15, 20, 30].map(m => (
               <button key={m} onClick={() => { setTime(m * 60); setIsActive(false); }} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-black hover:bg-indigo-600 transition-all text-sm">
                  {m}m
               </button>
             ))}
          </div>
       </div>
    </motion.div>
  );
}

function GroupGenerator({ students }: { students: Student[] }) {
  const [groupCount, setGroupCount] = useState(4);
  const [groups, setGroups] = useState<string[][]>([]);

  const generateGroups = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newGroups = Array.from({ length: groupCount }, () => [] as string[]);
    shuffled.forEach((s, idx) => newGroups[idx % groupCount].push(s.name));
    setGroups(newGroups);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
      <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-3xl font-black text-slate-800 font-khmer">បែងចែកក្រុមស្វ័យប្រវត្ត</h3>
          <p className="text-slate-400 font-bold font-khmer">Smart Group Engine v1.0</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
             <button onClick={() => setGroupCount(Math.max(2, groupCount-1))} className="w-12 h-12 bg-white rounded-xl shadow-sm font-black text-xl">-</button>
             <span className="w-12 text-center text-2xl font-black">{groupCount}</span>
             <button onClick={() => setGroupCount(Math.min(10, groupCount+1))} className="w-12 h-12 bg-white rounded-xl shadow-sm font-black text-xl">+</button>
          </div>
          <button onClick={generateGroups} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black font-khmer text-lg shadow-xl shadow-slate-200">បង្កើតក្រុមឥឡូវនេះ</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {groups.map((group, idx) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 font-black text-slate-100 text-4xl group-hover:text-indigo-50 transition-colors">#{idx + 1}</div>
            <h4 className="text-xl font-black text-indigo-600 font-khmer border-b border-slate-50 pb-4 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" /> ក្រុមទី {idx + 1}
            </h4>
            <div className="space-y-3">
              {group.map((name, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 hover:bg-white transition-all cursor-default">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center font-black text-xs text-indigo-500 shadow-sm">{name.charAt(0)}</div>
                  <span className="font-bold text-slate-700 font-khmer text-sm">{name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function SeatingChart({ students }: { students: Student[] }) {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(4);
  const [seating, setSeating] = useState<Record<string, string>>({});

  const generateSeating = () => {
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const newSeating: Record<string, string> = {};
    shuffled.forEach((s, i) => {
      newSeating[`${Math.floor(i / columns)}-${i % columns}`] = s.name;
    });
    setSeating(newSeating);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 border-b border-slate-50 pb-10">
        <div className="space-y-2">
          <h3 className="text-4xl font-black text-slate-800 font-khmer tracking-tight">ប្លង់តុអង្គុយសិស្ស</h3>
          <p className="text-slate-400 font-bold font-khmer flex items-center gap-2">
            <Layout className="w-4 h-4" /> រៀបចំទីតាំងអង្គុយតាមជួរឈរ និងជួរដេក
          </p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
           <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-khmer">ជួរឈរ:</span>
              <input type="number" value={columns} onChange={(e) => setColumns(Number(e.target.value))} className="w-10 bg-transparent font-black text-slate-800 outline-none text-xl" />
           </div>
           <button onClick={generateSeating} className="bg-indigo-600 text-white px-10 py-4 rounded-[1.5rem] font-black font-khmer flex items-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
              <RefreshCw className="w-5 h-5" /> រៀបថ្មី
           </button>
           <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg"><Printer className="w-6 h-6" /></button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-16 bg-slate-50/50 rounded-[3.5rem] border border-slate-100 border-dashed relative">
         <div className="w-72 h-10 bg-slate-800 rounded-full mb-24 flex items-center justify-center shadow-2xl border-4 border-slate-700">
            <span className="text-[9px] text-white font-black uppercase tracking-[0.6em]">តុគ្រូបង្រៀន / ក្ដារខៀន</span>
         </div>
         
         <div className="grid gap-16" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: rows * columns }).map((_, i) => {
              const r = Math.floor(i / columns);
              const c = i % columns;
              const name = seating[`${r}-${c}`];
              return (
                <div key={i} className={`w-36 h-28 rounded-3xl border-4 flex flex-col items-center justify-center gap-3 transition-all relative ${
                  name ? 'bg-white border-indigo-100 shadow-2xl scale-110' : 'bg-slate-100/50 border-slate-100 border-dashed scale-100'
                }`}>
                   {name ? (
                     <>
                       <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-xs text-white shadow-xl shadow-indigo-100">
                         {name.charAt(0)}
                       </div>
                       <span className="text-xs font-black font-khmer text-slate-800">{name}</span>
                       <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-xl border-2 border-white"><ShieldCheck className="w-4 h-4" /></div>
                     </>
                   ) : (
                     <div className="w-6 h-6 rounded-full border-2 border-slate-200"></div>
                   )}
                </div>
              );
            })}
         </div>
      </div>
    </motion.div>
  );
}

function ChildrenCommission({ students }: { students: Student[] }) {
  const roles = [
    { id: 'leader', title: 'ប្រធានថ្នាក់', icon: <Award className="w-6 h-6 text-amber-500" />, color: 'from-amber-500 to-orange-600' },
    { id: 'deputy1', title: 'អនុប្រធានសិក្សា', icon: <BookOpen className="w-6 h-6 text-indigo-500" />, color: 'from-indigo-500 to-blue-600' },
    { id: 'deputy2', title: 'អនុប្រធានវិន័យ', icon: <ShieldCheck className="w-6 h-6 text-rose-500" />, color: 'from-rose-500 to-pink-600' },
    { id: 'health', title: 'គណៈកម្មការសុខភាព', icon: <Plus className="w-6 h-6 text-emerald-500" />, color: 'from-emerald-500 to-teal-600' },
    { id: 'art', title: 'គណៈកម្មការសិល្បៈ', icon: <Star className="w-6 h-6 text-purple-500" />, color: 'from-purple-500 to-fuchsia-600' },
  ];
  const [assignment, setAssignment] = useState<Record<string, string>>({});

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100">
      <div className="flex items-center justify-between mb-12">
        <h3 className="text-3xl font-black text-slate-800 font-khmer">រចនាសម្ព័ន្ធគណៈកម្មការកុមារ</h3>
        <button className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black font-khmer flex items-center gap-3">
           <Save className="w-6 h-6" /> លទ្ធផលផ្លូវការ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {roles.map(role => (
          <div key={role.id} className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 space-y-6 relative group hover:bg-white hover:shadow-2xl transition-all">
            <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${role.color} p-4 text-white shadow-xl shadow-slate-200`}>
               {role.icon}
            </div>
            <div>
               <h4 className="text-lg font-black text-slate-800 font-khmer mb-2">{role.title}</h4>
               <p className="text-xs font-bold text-slate-400 font-khmer">ជ្រើសរើសតំណាងសិស្សសមស្រប</p>
            </div>
            <select 
              value={assignment[role.id] || ''}
              onChange={(e) => setAssignment({...assignment, [role.id]: e.target.value})}
              className="w-full px-5 py-4 bg-white rounded-2xl border border-slate-100 outline-none font-black font-khmer text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- ប៉ះដើម្បីរើស --</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function QuestioningTechniques() {
  const techniques = [
    { title: 'សំណួរបកស្រាយ (Elaborative)', desc: 'ហេតុអ្វីអ្នកគិតថា...? តើអ្នកអាចពន្យល់បន្ថែមបានទេ?', color: 'bg-emerald-500' },
    { title: 'សំណួរបើក (Open-ended)', desc: 'តើមានអ្វីកើតឡើងប្រសិនបើ...? តើអ្នកមានយោបល់យ៉ាងណាដែរ?', color: 'bg-indigo-500' },
    { title: 'សំណួរត្រិះរិះ (Critical Thinking)', desc: 'តើតួអង្គនេះមានចរិតយ៉ាងណា? តើវាខុសគ្នាពី... យ៉ាងដូចម្តេច?', color: 'bg-rose-500' },
    { title: 'សំណួរភ្ជាប់ជីវភាព (Real-life Connection)', desc: 'តើអ្នកធ្លាប់ជួបរឿងនេះក្នុងជីវិតពិតទេ? អ្នកនឹងធ្វើដូចម្តេចបើ...?', color: 'bg-amber-500' },
  ];

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
      <div className="bg-white p-12 rounded-[4rem] shadow-2xl border border-slate-100 text-center">
         <h3 className="text-3xl font-black text-slate-800 font-khmer mb-4">បច្ចេកទេសសួរសំណួរជំរុញការគិត</h3>
         <p className="text-slate-400 font-bold font-khmer mb-10">សំណួរគំរូសម្រាប់លោកគ្រូ អ្នកគ្រូប្រើប្រាស់ក្នុងថ្នាក់</p>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            {techniques.map(t => (
              <div key={t.title} className="p-8 rounded-[3rem] bg-slate-50 border border-slate-100 hover:shadow-xl hover:bg-white transition-all group">
                 <div className={`w-12 h-12 rounded-2xl ${t.color} text-white mb-4 flex items-center justify-center font-black shadow-lg shadow-slate-200`}>?</div>
                 <h4 className="text-xl font-black text-slate-800 font-khmer mb-2">{t.title}</h4>
                 <p className="text-slate-600 font-bold font-khmer leading-relaxed">{t.desc}</p>
              </div>
            ))}
         </div>
      </div>
    </motion.div>
  );
}
