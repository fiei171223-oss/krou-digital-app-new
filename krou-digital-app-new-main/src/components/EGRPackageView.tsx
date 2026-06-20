import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  BookOpen, 
  Layers, 
  Gamepad2, 
  ClipboardCheck, 
  Download, 
  Search,
  CheckCircle2,
  Image as ImageIcon,
  Type,
  Mic,
  Timer,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface EGRPackageViewProps {
  onBack: () => void;
}

export default function EGRPackageView({ onBack }: EGRPackageViewProps) {
  const [activeTab, setActiveTab] = useState<'skills' | 'resources' | 'games' | 'assessment'>('skills');

  const basicSkills = [
    { title: 'ការស្គាល់តួអក្សរ', description: 'ព្យញ្ជនៈ ៣៣ តួ និងការសរសេរតាមលំដាប់លំដោយ', icon: <Type className="w-6 h-6" /> },
    { title: 'ការផ្សំប្រកបស្រៈ', description: 'ការផ្សំព្យញ្ជនៈជាមួយស្រៈនិស្ស័យ និងស្រៈពេញតួ', icon: <Layers className="w-6 h-6" /> },
    { title: 'ការអានពាក្យ', description: 'ការអានពាក្យមានន័យ និងពាក្យគន្លឹះក្នុងមេរៀន', icon: <BookOpen className="w-6 h-6" /> }
  ];

  const leveledBooks = [
    { id: 1, title: 'ផ្ទះរបស់ខ្ញុំ', level: 1, pages: 8, cover: '🏠' },
    { id: 2, title: 'សត្វចិញ្ចឹម', level: 1, pages: 10, cover: '🐶' },
    { id: 3, title: 'ទៅផ្សារជាមួយម៉ាក់', level: 2, pages: 12, cover: '🧺' },
    { id: 4, title: 'មិត្តភក្តិល្អ', level: 2, pages: 12, cover: '🤝' },
  ];

  const generateFlashcardPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text('FLASHCARDS - ប័ណ្ណពាក្យ', 105, 30, { align: 'center' });
    
    const words = ['សាលា', 'គ្រូ', 'មិត្ត', 'រៀន', 'អាន', 'សរសេរ'];
    
    words.forEach((word, index) => {
      if (index > 0 && index % 4 === 0) doc.addPage();
      const x = 20 + (index % 2) * 90;
      const y = 50 + (Math.floor(index / 2) % 2) * 100;
      doc.rect(x, y, 80, 80);
      doc.text(word, x + 40, y + 45, { align: 'center' });
    });

    doc.save('EGR_Flashcards.pdf');
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

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'skills'} onClick={() => setActiveTab('skills')} label="បំណិនមូលដ្ឋាន" icon={<Type className="w-4 h-4" />} />
          <TabButton active={activeTab === 'resources'} onClick={() => setActiveTab('resources')} label="ធនធានបង្រៀន" icon={<Layers className="w-4 h-4" />} />
          <TabButton active={activeTab === 'games'} onClick={() => setActiveTab('games')} label="សកម្មភាពអន្តរកម្ម" icon={<Gamepad2 className="w-4 h-4" />} />
          <TabButton active={activeTab === 'assessment'} onClick={() => setActiveTab('assessment')} label="ការវាយតម្លៃ" icon={<ClipboardCheck className="w-4 h-4" />} />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">កញ្ចប់សម្ភារៈអំណានថ្នាក់ដំបូង (EGR)</h2>
        <p className="text-slate-500 font-medium khmer-font">ឧបករណ៍ជំនួយការបង្រៀន និងរៀនសម្រាប់កុមារបឋមសិក្សា</p>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'skills' && (
          <motion.div 
            key="skills"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {basicSkills.map((skill, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6 group hover:shadow-2xl transition-all">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                  {skill.icon}
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-800 khmer-font">{skill.title}</h3>
                  <p className="text-slate-400 text-sm font-medium khmer-font">{skill.description}</p>
                </div>
                <button className="w-full bg-slate-50 text-indigo-600 py-3 rounded-xl font-black khmer-font text-xs hover:bg-indigo-600 hover:text-white transition-all">
                  មើលមេរៀន
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'resources' && (
          <motion.div 
            key="resources"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
               <h3 className="text-xl font-black text-slate-800 khmer-font">សៀវភៅរឿងតាមកម្រិត (Leveled Books)</h3>
               <button onClick={generateFlashcardPDF} className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl font-black khmer-font text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                 <Download className="w-4 h-4" /> ទាញយកប័ណ្ណពាក្យ
               </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {leveledBooks.map(book => (
                 <motion.div 
                   key={book.id}
                   whileHover={{ y: -10 }}
                   className="bg-white rounded-[2.5rem] border border-slate-100 p-6 shadow-lg shadow-slate-100 flex flex-col items-center text-center gap-4 cursor-pointer group"
                 >
                   <div className="w-full aspect-[3/4] bg-slate-50 rounded-2xl flex items-center justify-center text-6xl group-hover:bg-indigo-50 transition-colors">
                     {book.cover}
                   </div>
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Level {book.level}</p>
                     <h4 className="font-black text-slate-700 khmer-font">{book.title}</h4>
                     <p className="text-[10px] text-slate-400 font-bold">{book.pages} ទំព័រ</p>
                   </div>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'games' && (
          <motion.div 
            key="games"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <GameCard 
              title="ល្បែងផ្គុំពាក្យ (Word Puzzle)"
              description="ផ្គូផ្គងព្យញ្ជនៈ និងស្រៈដើម្បីបង្កើតជាពាក្យត្រឹមត្រូវ"
              icon={<Gamepad2 className="w-10 h-10" />}
              color="from-indigo-500 to-blue-600"
            />
            <GameCard 
              title="បំពេញតួអក្សរ (Missing Letter)"
              description="ជ្រើសរើសតួអក្សរដែលបាត់ដើម្បីបំពេញពាក្យឱ្យមានន័យ"
              icon={<Type className="w-10 h-10" />}
              color="from-rose-500 to-pink-600"
            />
          </motion.div>
        )}

        {activeTab === 'assessment' && (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                  <Timer className="w-6 h-6 text-indigo-600" /> ល្បឿនអាន
                </h3>
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black">START TEST</span>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center">
                 <p className="text-slate-400 khmer-font font-bold">ឧបករណ៍វាស់ស្ទង់ចំនួនពាក្យដែលអានបានក្នុងមួយនាទី (WPM)</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                 <div className="p-4 bg-emerald-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-emerald-600 uppercase">ល្អណាស់</p>
                    <p className="text-xl font-black text-emerald-700">{'>'} ៤៥</p>
                 </div>
                 <div className="p-4 bg-amber-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-amber-600 uppercase">មធ្យម</p>
                    <p className="text-xl font-black text-amber-700">២៥-៤០</p>
                 </div>
                 <div className="p-4 bg-rose-50 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-rose-600 uppercase">ខ្សោយ</p>
                    <p className="text-xl font-black text-rose-700">{'<'} ២០</p>
                 </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
              <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-emerald-600" /> ការយល់ន័យ
              </h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-sm font-black text-slate-600 khmer-font">កម្រងសំណួរខ្លីៗ (Reading Quizzes)</p>
                 </div>
                 <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-sm font-black text-slate-600 khmer-font">សង្ខេបរឿងឡើងវិញ (Retelling)</p>
                 </div>
                 <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <p className="text-sm font-black text-slate-600 khmer-font">ការផ្គូផ្គងរូបភាព និងអត្ថន័យ</p>
                 </div>
              </div>
              <button className="w-full bg-slate-800 text-white py-4 rounded-2xl font-black khmer-font text-sm shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                 <FileText className="w-4 h-4" /> ទាញយករបាយការណ៍សរុប (PDF)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-xl font-black khmer-font text-xs flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}
    >
      {icon} {label}
    </button>
  );
}

function GameCard({ title, description, icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center gap-6 group hover:shadow-2xl transition-all"
    >
       <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-[2.5rem] flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
          {icon}
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-800 khmer-font">{title}</h4>
          <p className="text-xs text-slate-400 khmer-font font-bold leading-relaxed">{description}</p>
       </div>
       <button className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black khmer-font text-xs group-hover:bg-indigo-600 group-hover:text-white transition-all">
          ចាប់ផ្តើមលេង
       </button>
    </motion.div>
  );
}
