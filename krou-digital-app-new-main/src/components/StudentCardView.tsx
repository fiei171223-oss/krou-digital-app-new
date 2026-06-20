import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  IdCard, 
  Download, 
  Printer, 
  UserCircle2, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Image as ImageIcon,
  QrCode,
  Layout,
  Award
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Student } from '../types';
import html2canvas from 'html2canvas';

interface StudentCardViewProps {
  onBack: () => void;
}

export default function StudentCardView({ onBack }: StudentCardViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [savedCards, setSavedCards] = useState<string[]>([]);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'students'), orderBy('name', 'asc')), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    return unsub;
  }, []);

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleDownload = async (id: string) => {
    const element = cardRefs.current[id];
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 3, useCORS: true, backgroundColor: null });
    const dataUrl = canvas.toDataURL('image/png');
    setGeneratedResult(dataUrl);
    if (!savedCards.includes(dataUrl)) {
      setSavedCards(prev => [dataUrl, ...prev]);
    }
    const link = document.createElement('a');
    link.download = `ID_CARD_${id}.png`;
    link.href = dataUrl;
    link.click();
  };

  const downloadBatch = async () => {
    // Basic batch download for simplicity (first few cards)
    const selected = selectedStudents.slice(0, 5);
    for (const id of selected) {
      await handleDownload(id);
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

        <div className="flex gap-4">
           <button 
             onClick={() => setSelectedStudents(students.map(s => s.id!))}
             className="bg-slate-100 text-slate-600 px-6 py-2.5 rounded-xl font-bold khmer-font text-sm hover:bg-slate-200"
           >
             ជ្រើសរើសទាំងអស់
           </button>
           <button 
             onClick={downloadBatch}
             disabled={selectedStudents.length === 0}
             className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg disabled:opacity-50"
           >
             <Printer className="w-5 h-5" /> បោះពុម្ពកាតដែលបានរើស
           </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">ប្រព័ន្ធបង្កើតកាតសម្គាល់ខ្លួនសិស្ស</h2>
        <p className="text-slate-500 font-medium khmer-font">Digital Student ID Card Generator Professional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-1 bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 h-auto flex flex-col">
            <div className="mb-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
               <p className="text-xs font-black text-emerald-700 font-khmer">សេចក្តីណែនាំ៖</p>
               <p className="text-[10px] font-medium text-emerald-600 font-khmer leading-relaxed mt-1">
                 អ្នកអាចទាញយកកាតជាលក្ខណៈបុគ្គល (PNG) ឬជាបាច់។ រាល់កាតដែលបានបង្កើតនឹងបង្ហាញនៅផ្នែក <b>"លទ្ឋផលរូបភាពដែលបានបង្កើត"</b> និង <b>"បញ្ជីកាតដែលបានរក្សាទុក"</b> នៅខាងក្រោមគេបង្អស់។
               </p>
            </div>
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               <UserCircle2 className="w-4 h-4" /> បញ្ជីឈ្មោះសិស្ស
            </h3>
            <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {students.map(s => (
                 <label key={s.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100 group">
                    <input 
                      type="checkbox" 
                      checked={selectedStudents.includes(s.id!)}
                      onChange={() => toggleStudent(s.id!)}
                      className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                       <p className="text-sm font-black text-slate-700 khmer-font group-hover:text-indigo-600 transition-colors">{s.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Grade {s.grade}</p>
                    </div>
                 </label>
               ))}
            </div>
         </div>

         <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
               <AnimatePresence>
                  {selectedStudents.length === 0 ? (
                    <div className="col-span-full h-96 flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300">
                       <Layout className="w-20 h-20 mb-4 opacity-20" />
                       <p className="font-bold khmer-font text-xl">សូមជ្រើសរើសសិស្សដើម្បីបង្ហាញកាត</p>
                    </div>
                  ) : (
                    selectedStudents.map(id => {
                      const student = students.find(s => s.id === id);
                      if (!student) return null;
                      return (
                        <motion.div 
                          key={id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="group relative"
                        >
                           {/* ID Card Front */}
                           <div 
                             ref={el => { if(el) cardRefs.current[id] = el }}
                             className="w-full aspect-[2/3] bg-white rounded-[2rem] shadow-2xl relative overflow-hidden border border-slate-100 print:shadow-none"
                           >
                              {/* Design Elements */}
                              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
                              <div className="absolute top-28 left-0 w-full h-8 bg-white skew-y-3 -translate-y-4"></div>
                              
                              <div className="relative z-10 p-6 flex flex-col items-center h-full">
                                 {/* Header */}
                                 <div className="flex flex-col items-center space-y-1 mb-8">
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center p-2 mb-1">
                                       <ShieldCheck className="w-full h-full text-white" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-white khmer-font uppercase tracking-widest text-center">សាលាបឋមសិក្សា...</h4>
                                    <p className="text-[7px] font-bold text-indigo-100 uppercase tracking-widest">Digital Education School</p>
                                 </div>

                                 {/* Photo */}
                                 <div className="w-32 h-32 bg-white rounded-3xl p-1 shadow-2xl mb-6 relative">
                                    <div className="w-full h-full bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-slate-100 group-hover:border-indigo-200 transition-colors">
                                       {student.photoUrl ? (
                                         <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                       ) : (
                                         <UserCircle2 className="w-16 h-16 text-slate-200" />
                                       )}
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
                                       <Award className="w-5 h-5" />
                                    </div>
                                 </div>

                                 {/* Info */}
                                 <div className="text-center space-y-2 flex-1">
                                    <div>
                                       <p className="text-xs font-bold text-slate-400 khmer-font mb-1">ឈ្មោះសិស្ស / Student Name</p>
                                       <h3 className="text-lg font-black text-slate-800 khmer-font leading-tight">{student.name}</h3>
                                       <p className="text-xs font-black text-indigo-600 uppercase tracking-wider">{student.nameLatin || 'STUDENT NAME'}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                       <div className="text-left">
                                          <p className="text-[8px] font-black text-slate-300 uppercase">Grade</p>
                                          <p className="font-black text-slate-600 tracking-tighter">ថ្នាក់ទី {student.grade}</p>
                                       </div>
                                       <div className="text-right">
                                          <p className="text-[8px] font-black text-slate-300 uppercase">ID No</p>
                                          <p className="font-black text-slate-600 tracking-tighter">ID-2024-{student.id?.slice(-4).toUpperCase()}</p>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Footer */}
                                 <div className="w-full pt-4 flex items-center justify-between border-t border-slate-50">
                                    <QrCode className="w-8 h-8 text-slate-800" />
                                    <div className="text-right">
                                       <p className="text-[6px] font-black text-slate-400 uppercase">Academic Year</p>
                                       <p className="text-[10px] font-black text-slate-800 tracking-tighter">2024 - 2025</p>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           {/* Preview Actions */}
                           <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleDownload(id)}
                                className="p-3 bg-white text-indigo-600 rounded-2xl shadow-2xl hover:bg-indigo-50 transition-all border border-indigo-100"
                              >
                                 <Download className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => toggleStudent(id)}
                                className="p-3 bg-white text-rose-600 rounded-2xl shadow-2xl hover:bg-rose-50 transition-all border border-rose-100"
                              >
                                 <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </motion.div>
                      );
                    })
                  )}
               </AnimatePresence>
            </div>

            {/* Generated Result Section */}
            {generatedResult && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                      <ImageIcon className="w-6 h-6" />
                   </div>
                   <h3 id="generated-result" className="text-2xl font-black text-slate-800 khmer-font">លទ្ធផលរូបភាពដែលបានបង្កើត</h3>
                </div>
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border-4 border-emerald-50 border-dashed inline-block">
                   <img src={generatedResult} alt="Generated Card" className="max-w-md w-full rounded-2xl shadow-2xl" />
                   <div className="mt-6 flex gap-4">
                      <a href={generatedResult} download="id_card_result.png" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black khmer-font flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all">
                        <Download className="w-5 h-5" /> ទាញយក PNG
                      </a>
                   </div>
                </div>
              </div>
            )}

            {/* Saved Cards Gallery */}
            {savedCards.length > 0 && (
              <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                      <IdCard className="w-6 h-6" />
                   </div>
                   <h3 id="saved-cards-gallery" className="text-2xl font-black text-slate-800 khmer-font">បញ្ជីកាតដែលបានរក្សាទុក</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {savedCards.map((card, idx) => (
                     <div key={idx} className="group relative bg-white p-3 rounded-3xl shadow-lg border border-slate-100 hover:scale-105 transition-all">
                        <img src={card} alt={`Saved Card ${idx}`} className="w-full h-auto rounded-2xl" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                           <a href={card} download={`Card_${idx}.png`} className="p-2 bg-white text-emerald-600 rounded-xl shadow-lg">
                              <Download className="w-5 h-5" />
                           </a>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
