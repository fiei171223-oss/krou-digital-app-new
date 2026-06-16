import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Award, 
  Download, 
  User, 
  Calendar, 
  Fingerprint,
  Palette,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Student } from '../types';
import html2canvas from 'html2canvas';

interface DigitalCertificateViewProps {
  onBack: () => void;
  students: Student[];
}

const AWARD_TYPES = [
  { id: 'reading', label: 'សិស្សពូកែអាន', icon: '📖' },
  { id: 'discipline', label: 'សិស្សមានវិន័យល្អ', icon: '🏛️' },
  { id: 'helpful', label: 'សិស្សពូកែជួយមិត្តភក្តិ', icon: '🤝' },
  { id: 'math', label: 'សិស្សពូកែគណិតវិទ្យា', icon: '➕' },
  { id: 'creative', label: 'សិស្សមានភាពច្នៃប្រឌិត', icon: '🎨' }
];

const TEMPLATES = [
  { id: 'classic', name: 'បុរាណ', bg: 'bg-amber-50', border: 'border-amber-300', accent: 'text-amber-600', decoration: '🏵️' },
  { id: 'modern', name: 'ទំនើប', bg: 'bg-indigo-50', border: 'border-indigo-300', accent: 'text-indigo-600', decoration: '💎' },
  { id: 'fun', name: 'កុមារភាព', bg: 'bg-emerald-50', border: 'border-emerald-300', accent: 'text-emerald-600', decoration: '🎈' },
  { id: 'star', name: 'ផ្កាយសំណាង', bg: 'bg-yellow-50', border: 'border-yellow-400', accent: 'text-yellow-600', decoration: '⭐' }
];

export default function DigitalCertificateView({ onBack, students }: DigitalCertificateViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [awardType, setAwardType] = useState(AWARD_TYPES[0].label);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [signature, setSignature] = useState('');
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 3, // Higher quality
        useCORS: true,
        backgroundColor: null
      });
      const link = document.createElement('a');
      link.download = `ប័ណ្ណសរសើរ_${selectedStudent?.name || 'សិស្ស'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    } finally {
      setIsGenerating(false);
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
        <div className="flex items-center gap-3 bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm">
           <Award className="w-6 h-6 text-amber-500 animate-bounce" />
           <h2 className="text-xl font-black text-slate-800 khmer-font uppercase">ប័ណ្ណសរសើរឌីជីថល</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
        {/* Settings Panel */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
           <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <User className="w-4 h-4" /> ព័ត៌មានសិស្ស
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">ឈ្មោះសិស្ស</label>
                    <select 
                      value={selectedStudentId} 
                      onChange={e => setSelectedStudentId(e.target.value)}
                      className="w-full p-4 bg-white border-2 border-slate-100 focus:border-indigo-600 rounded-2xl outline-none font-black khmer-font text-sm transition-all shadow-sm"
                    >
                       <option value="">-- ជ្រើសរើសសិស្ស --</option>
                       {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.gender})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">ប្រភេទពានរង្វាន់</label>
                    <div className="grid grid-cols-2 gap-2">
                       {AWARD_TYPES.map(type => (
                         <button
                           key={type.id}
                           onClick={() => setAwardType(type.label)}
                           className={`p-3 rounded-xl border-2 transition-all text-[11px] font-black khmer-font text-left flex items-center gap-2 ${
                             awardType === type.label ? 'border-indigo-600 bg-white text-indigo-700 shadow-md' : 'border-white bg-white/50 text-slate-400 opacity-60 hover:opacity-100'
                           }`}
                         >
                            <span className="text-lg">{type.icon}</span> {type.label}
                         </button>
                       ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> កាលបរិច្ឆេទ
                   </label>
                   <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-black text-xs shadow-inner" 
                   />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Fingerprint className="w-4 h-4" /> ហត្ថលេខាគ្រូ
                   </label>
                   <input 
                    type="text" 
                    placeholder="ឈ្មោះលោកគ្រូ/អ្នកគ្រូ"
                    value={signature} 
                    onChange={e => setSignature(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-black khmer-font text-xs shadow-inner" 
                   />
                 </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <Palette className="w-4 h-4" /> រចនាប័ទ្មប័ណ្ណសរសើរ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                   {TEMPLATES.map(t => (
                     <button
                       key={t.id}
                       onClick={() => setTemplate(t)}
                       className={`p-3 rounded-2xl border-2 transition-all font-black khmer-font text-[10px] relative overflow-hidden ${
                         template.id === t.id ? 'border-slate-800 bg-slate-800 text-white shadow-lg' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                       }`}
                     >
                        <div className={`absolute top-0 left-0 w-1 h-full ${t.bg.replace('bg-', 'bg-')}`} />
                        {t.name}
                     </button>
                   ))}
                </div>
              </div>
           </div>

           <button 
             onClick={downloadCertificate}
             disabled={!selectedStudentId || isGenerating}
             className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black khmer-font text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-3 group"
           >
              {isGenerating ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Download className="group-hover:translate-y-1 transition-transform" />}
              ទាញយកប័ណ្ណសរសើរ (PNG)
           </button>
        </div>

        {/* Certificate Preview */}
        <div className="sticky top-8 space-y-6">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Certificate Preview</span>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
           </div>

           <div className="group">
             <div 
              ref={certificateRef}
              className={`aspect-[1.414/1] w-full ${template.bg} border-[16px] ${template.border} rounded-sm shadow-2xl relative overflow-hidden p-12 flex flex-col items-center justify-between text-center transition-all duration-700`}
             >
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                
                {/* Corner Ornaments */}
                <div className={`absolute top-4 left-4 text-4xl opacity-40`}>{template.decoration}</div>
                <div className={`absolute top-4 right-4 text-4xl opacity-40`}>{template.decoration}</div>
                <div className={`absolute bottom-4 left-4 text-4xl opacity-40`}>{template.decoration}</div>
                <div className={`absolute bottom-4 right-4 text-4xl opacity-40`}>{template.decoration}</div>

                <div className="space-y-1 relative z-10">
                   <h1 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">ព្រះរាជាណាចក្រកម្ពុជា</h1>
                   <h2 className="text-[8px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
                </div>

                <div className="space-y-4">
                   <div className="relative group">
                     <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
                     <div className="w-24 h-24 mx-auto bg-white rounded-full p-2 shadow-xl flex items-center justify-center border-4 border-white overflow-hidden relative z-10 transition-transform group-hover:scale-110">
                        <Award className={`w-14 h-14 ${template.accent}`} />
                     </div>
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-4xl font-black text-slate-800 khmer-font uppercase tracking-tight">ប័ណ្ណសរសើរ</h3>
                      <div className={`h-1 mx-auto w-32 rounded-full ${template.bg.replace('bg-', 'bg-').replace('-50', '-300')}`} />
                   </div>
                </div>

                <div className="space-y-3">
                   <p className="text-sm font-bold text-slate-500 khmer-font italic">ប័ណ្ណសរសើរនេះត្រូវបានផ្តល់ជូនចំពោះ</p>
                   <div className="relative inline-block px-12 py-2">
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-100 rounded-full" />
                      <h4 className={`text-5xl font-black ${template.accent} khmer-font whitespace-nowrap`}>
                        {selectedStudent?.name || '..........'}
                      </h4>
                   </div>
                </div>

                <div className="max-w-md mx-auto px-6 py-4 bg-white/40 rounded-3xl backdrop-blur-sm border border-white/50">
                   <p className="text-lg font-black text-slate-700 khmer-font leading-relaxed">
                      ដែលបានសម្រេចជោគជ័យ និងជា <span className={template.accent}>"{awardType}"</span> ក្នុងថ្នាក់រៀនឌីជីថល សម្រាប់ឆ្នាំសិក្សា ២០២៥-២០២៦។
                   </p>
                </div>

                <div className="w-full flex justify-between items-end px-12 pb-4">
                   <div className="text-left space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">កាលបរិច្ឆេទ</p>
                      <p className="text-sm font-black text-slate-800 underline decoration-slate-200 decoration-dotted underline-offset-4">
                        {new Date(date).toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                   </div>
                   <div className="text-center relative">
                      <div className="h-1 bg-slate-200 w-48 mb-3" />
                      <p className={`text-xl font-black ${template.accent} khmer-font italic pointer-events-none drop-shadow-sm`} style={{ fontFamily: 'Dancing Script, cursive' }}>{signature || '..............'}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">គ្រូទទួលបន្ទុកថ្នាក់</p>
                   </div>
                </div>

                {/* Aesthetic Stickers */}
                <div className="absolute top-1/4 -left-10 opacity-10 rotate-12 scale-150">
                   <Sparkles className="w-40 h-40" />
                </div>
                <div className="absolute bottom-1/4 -right-10 opacity-10 -rotate-12 scale-150">
                   <ImageIcon className="w-40 h-40" />
                </div>
             </div>
           </div>
           
           <div className="bg-amber-50 p-6 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
              <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-500">
                 <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-black text-amber-900 khmer-font underline decoration-amber-200">គន្លឹះបច្ចេកទេស</p>
                 <p className="text-[11px] text-amber-700 font-medium khmer-font leading-relaxed">
                    លោកគ្រូអាចទាញយកប័ណ្ណសរសើរនេះជាប្រភេទរូបភាព (PNG) ដើម្បីផ្ញើទៅកាន់មាតាបិតាសិស្សតាមរយៈ Telegram ឬ Facebook បានយ៉ាងឆាប់រហ័ស។
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
