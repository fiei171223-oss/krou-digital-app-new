import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  X, 
  Award, 
  Calendar, 
  User, 
  PenTool, 
  Star, 
  Sparkles,
  Heart,
  Trophy,
  BookOpen
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Student } from '../types';

interface CertificateGeneratorProps {
  students: Student[];
  onClose: () => void;
}

export default function CertificateGenerator({ students, onClose }: CertificateGeneratorProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [awardType, setAwardType] = useState<string>('សិស្សពូកែអាន');
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('km-KH'));
  const [teacherName, setTeacherName] = useState<string>('');
  const certificateRef = useRef<HTMLDivElement>(null);

  const awardOptions = [
    { label: 'សិស្សពូកែអាន (Excellent Reader)', value: 'សិស្សពូកែអាន', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'សិស្សមានវិន័យល្អ (Good Discipline)', value: 'សិស្សមានវិន័យល្អ', icon: <Heart className="text-rose-500 w-5 h-5" /> },
    { label: 'សិស្សពូកែជួយមិត្តភក្តិ (Helpful Student)', value: 'សិស្សពូកែជួយមិត្តភក្តិ', icon: <Star className="text-amber-500 w-5 h-5" /> },
    { label: 'សិស្សពូកែរៀន (Honor Roll)', value: 'សិស្សពូកែរៀន', icon: <Trophy className="text-indigo-500 w-5 h-5" /> },
    { label: 'សិស្សស្អាត (Cleanliness)', value: 'សិស្សស្អាត', icon: <Sparkles className="text-emerald-500 w-5 h-5" /> }
  ];

  const handleDownloadImage = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      backgroundColor: null,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `Certificate_${selectedStudent || 'Student'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      backgroundColor: null,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Certificate_${selectedStudent || 'Student'}.pdf`);
  };

  const currentStudentName = students.find(s => s.id === selectedStudent)?.name || '................................';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/60"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[95vh]"
      >
        {/* Settings Panel */}
        <div className="w-full md:w-80 bg-slate-50 p-8 border-r border-slate-100 flex flex-col gap-8 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800 khmer-font">ប័ណ្ណសរសើរ</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-all">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> ជ្រើសរើសសិស្ស
              </label>
              <select 
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black khmer-font text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- បញ្ជីឈ្មោះសិស្ស --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (ថ្នាក់ទី {s.grade})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Award className="w-3 h-3" /> ប្រភេទពានរង្វាន់
              </label>
              <div className="grid grid-cols-1 gap-2">
                {awardOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setAwardType(opt.value)}
                    className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                      awardType === opt.value ? 'bg-indigo-50 border-indigo-600 text-indigo-600' : 'bg-white border-transparent text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {opt.icon}
                    <span className="text-xs font-black khmer-font">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> កាលបរិច្ឆេទ
              </label>
              <input 
                type="text"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black khmer-font text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <PenTool className="w-3 h-3" /> ឈ្មោះគ្រូ (ហត្ថលេខា)
              </label>
              <input 
                type="text"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                placeholder="ឈ្មោះលោកគ្រូ/អ្នកគ្រូ"
                className="w-full p-4 bg-white border border-slate-200 rounded-2xl font-black khmer-font text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-3">
             <button 
               onClick={handleDownloadImage}
               className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-black khmer-font text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
             >
                <Download className="w-4 h-4" /> ទាញយកជារូបភាព (PNG)
             </button>
             <button 
               onClick={handleDownloadPDF}
               className="w-full bg-slate-800 text-white p-4 rounded-2xl font-black khmer-font text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900 transition-all"
             >
                <Download className="w-4 h-4" /> ទាញយកជា PDF
             </button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="flex-1 bg-slate-200 p-8 flex items-center justify-center overflow-auto">
          <div 
            ref={certificateRef}
            className="w-[842px] h-[595px] bg-white shadow-2xl relative flex items-center justify-center p-12 overflow-hidden shrink-0"
            style={{ 
              backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
              backgroundColor: '#fff'
            }}
          >
            {/* Border Decorative */}
            <div className="absolute inset-4 border-[12px] border-double border-amber-400 rounded-sm"></div>
            <div className="absolute inset-10 border-2 border-indigo-200"></div>

            {/* Corner Assets */}
            <div className="absolute top-0 left-0 w-32 h-32 p-4">
              <div className="w-full h-full border-t-8 border-l-8 border-amber-500"></div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 p-4">
              <div className="w-full h-full border-t-8 border-r-8 border-amber-500"></div>
            </div>
            <div className="absolute bottom-0 left-0 w-32 h-32 p-4">
              <div className="w-full h-full border-b-8 border-l-8 border-amber-500"></div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 p-4">
              <div className="w-full h-full border-b-8 border-r-8 border-amber-500"></div>
            </div>

            {/* Content */}
            <div className="relative text-center w-full z-10 space-y-8">
              <div className="space-y-2">
                <h1 className="text-6xl font-black text-amber-500 khmer-font tracking-widest drop-shadow-sm">ប័ណ្ណសរសើរ</h1>
                <p className="text-xl font-bold text-slate-400 khmer-font uppercase tracking-[0.4em]">Certificate of Honor</p>
              </div>

              <div className="space-y-4">
                <p className="text-2xl font-black text-slate-800 khmer-font">ព្រះរាជាណាចក្រកម្ពុជា</p>
                <p className="text-xl font-bold text-slate-700 khmer-font">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
                <div className="w-32 h-0.5 bg-slate-300 mx-auto"></div>
              </div>

              <div className="space-y-12">
                <p className="text-3xl font-black text-slate-600 khmer-font">មហាកិត្តិយសសូមប្រគល់ជូន</p>
                
                <div className="relative inline-block px-12">
                   <h2 className="text-6xl font-black text-indigo-600 khmer-font italic underline underline-offset-8">
                     {currentStudentName}
                   </h2>
                </div>

                <div className="space-y-6">
                   <p className="text-2xl font-bold text-slate-600 khmer-font">ដែលបានខិតខំប្រឹងប្រែង និងទទួលបានជ័យលាភីជា</p>
                   <div className="flex items-center justify-center gap-4">
                      <Trophy className="w-8 h-8 text-amber-500" />
                      <span className="text-4xl font-black text-amber-600 khmer-font bg-amber-50 px-8 py-2 rounded-2xl border-2 border-amber-200">
                        {awardType}
                      </span>
                      <Trophy className="w-8 h-8 text-amber-500" />
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mt-20 pt-12">
                 <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-400 khmer-font">ចេញនៅថ្ងៃទី</p>
                    <p className="text-xl font-black text-slate-700 khmer-font">{date}</p>
                 </div>
                 <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-400 khmer-font">ហត្ថលេខាគ្រូបន្ទុកថ្នាក់</p>
                    <div className="h-16 flex items-center justify-center">
                       {teacherName && (
                         <span className="text-2xl font-black text-indigo-600 khmer-font rotate-[-5deg]">
                           {teacherName}
                         </span>
                       )}
                    </div>
                 </div>
              </div>
            </div>

            {/* Background Decorative Circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-slate-100 rounded-full -z-10"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-slate-50 rounded-full -z-10"></div>
            <Award className="absolute top-10 right-10 w-48 h-48 text-amber-50 opacity-[0.03] -rotate-12" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
