import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Search, 
  Plus, 
  FileText, 
  Trash2, 
  Download, 
  BookOpen, 
  Upload,
  X,
  PlusCircle,
  FileDown
} from 'lucide-react';
import { LessonPlanPDF, LibraryFile, TeachingMaterialFile, Grade } from '../types';

type PDFType = LessonPlanPDF | LibraryFile | TeachingMaterialFile;

interface GenericPDFArchiveViewProps {
  title: string;
  description: string;
  onBack: () => void;
  pdfs: PDFType[];
  onSavePDF: (pdf: PDFType) => void;
  onDeletePDF: (id: string) => void;
}

export default function GenericPDFArchiveView({ 
  title, 
  description, 
  onBack, 
  pdfs, 
  onSavePDF, 
  onDeletePDF 
}: GenericPDFArchiveViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newPdf, setNewPdf] = useState({ 
    title: '', 
    grade: 'ថ្នាក់ទី ១', 
    url: '', 
    category: '' 
  });

  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = pdf.title.toLowerCase().includes(searchTerm.toLowerCase());
    const gradeStr = `ថ្នាក់ទី ${pdf.grade}`;
    const matchesGrade = selectedGrade === 'all' || gradeStr === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleSave = () => {
    if (!newPdf.title || !newPdf.url) return;
    onSavePDF({
      id: Math.random().toString(36).substr(2, 9),
      title: newPdf.title,
      grade: parseInt(newPdf.grade.replace('ថ្នាក់ទី ', '')) as Grade,
      subject: 'ភាសាខ្មែរ',
      date: new Date().toISOString(),
      fileName: `${newPdf.title}.pdf`,
      fileData: newPdf.url,
    } as PDFType);
    setIsAddOpen(false);
    setNewPdf({ title: '', grade: 'ថ្នាក់ទី ១', url: '', category: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> ត្រឡប់ក្រោយ
          </button>
          <h2 className="text-3xl font-black text-slate-800 font-kantumruy">{title}</h2>
          <p className="text-slate-500 font-khmer">{description}</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> បញ្ចូលឯកសារថ្មី
        </button>
      </header>

      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-50 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text"
              placeholder="ស្វែងរកតាមចំណងជើង..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-khmer"
            />
          </div>
          <select 
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-khmer font-bold min-w-[200px]"
          >
            <option value="all">គ្រប់កម្រិតថ្នាក់</option>
            {[1,2,3,4,5,6].map(g => (
              <option key={g} value={`ថ្នាក់ទី ${g}`}>ថ្នាក់ទី {g}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredPdfs.map((pdf) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={pdf.id}
                className="group relative bg-white border border-slate-100 p-6 rounded-3xl hover:shadow-2xl hover:border-emerald-100 transition-all flex flex-col"
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-1 font-kantumruy">{pdf.title}</h4>
                <p className="text-slate-400 font-bold text-sm mb-4">ថ្នាក់ទី {pdf.grade}</p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                  <a 
                    href={pdf.fileData} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-emerald-600 font-black text-sm hover:underline"
                  >
                    <BookOpen className="w-4 h-4" /> មើលឯកសារ
                  </a>
                  <button 
                    onClick={() => onDeletePDF(pdf.id)}
                    className="p-2 text-rose-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredPdfs.length === 0 && (
          <div className="text-center py-20 grayscale opacity-30">
            <FileText className="w-20 h-20 mx-auto mb-4" />
            <p className="text-xl font-bold font-khmer">មិនមានឯកសារនៅឡើយទេ</p>
          </div>
        )}
      </div>

      {/* Add PDF Modal Placeholder */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setIsAddOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-3xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-slate-800 font-kantumruy">បញ្ចូលឯកសារថ្មី</h3>
                <button onClick={() => setIsAddOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">ចំណងជើងឯកសារ</label>
                  <input 
                    type="text" 
                    value={newPdf.title}
                    onChange={(e) => setNewPdf({...newPdf, title: e.target.value})}
                    placeholder="ឧ. កិច្ចតែងការភាសាខ្មែរ ទី១"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-khmer"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">កម្រិតថ្នាក់</label>
                    <select 
                      value={newPdf.grade}
                      onChange={(e) => setNewPdf({...newPdf, grade: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-khmer font-bold"
                    >
                      {[1,2,3,4,5,6].map(g => (
                        <option key={g} value={`ថ្នាក់ទី ${g}`}>ថ្នាក់ទី {g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black text-slate-400 uppercase tracking-widest pl-2">Link ឯកសារ (URL)</label>
                    <input 
                      type="text" 
                      value={newPdf.url}
                      onChange={(e) => setNewPdf({...newPdf, url: e.target.value})}
                      placeholder="https://..."
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-khmer"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setIsAddOpen(false)}
                    className="flex-grow py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    បោះបង់
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-grow py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all"
                  >
                    រក្សាទុក
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
