import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Printer, 
  FileText, 
  Search, 
  Layout, 
  Table as TableIcon, 
  ScrollText, 
  ClipboardList, 
  Calendar as CalendarIcon,
  Download,
  CheckCircle2,
  BookOpen,
  ShieldCheck,
  Users
} from 'lucide-react';

interface SchoolArchiveViewProps {
  onBack: () => void;
}

const DOCUMENT_CATEGORIES = [
  { id: 'classroom_mgmt', name: 'ការគ្រប់គ្រងថ្នាក់រៀន', icon: <Layout className="w-6 h-6" />, color: 'bg-[#4242f5]' },
  { id: 'attendance_discipline', name: 'វត្តមាន និងវិន័យ', icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-[#e91e63]' },
  { id: 'academic_records', name: 'លទ្ធផលការសិក្សា', icon: <ClipboardList className="w-6 h-6" />, color: 'bg-[#2929e0]' },
  { id: 'admin_stats', name: 'រដ្ឋបាល និងស្ថិតិ', icon: <FileText className="w-6 h-6" />, color: 'bg-[#009688]' },
  { id: 'student_support', name: 'សិស្សគោលដៅ និងជំនួយ', icon: <Users className="w-6 h-6" />, color: 'bg-[#ff9800]' },
];

const DOCUMENTS = [
  // Category 1: ការគ្រប់គ្រងថ្នាក់រៀន (Items: 1, 2, 3, 11, 43, 44, 45)
  { id: 1, title: '១. តារាងប្លង់តុសិស្ស', cat: 'classroom_mgmt', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'លេខតុ', 'ជួរឈរ', 'ជួរដេក', 'ផ្សេងៗ'] },
  { id: 2, title: '២. កាលវិភាគថ្នាក់(ព្រឹក, រសៀល)', cat: 'classroom_mgmt', orientation: 'landscape', headers: ['ថ្ងៃ/ម៉ោង', '៧:០០-៨:០០', '៨:០០-៩:០០', '៩:០០-១០:០០', '១០:០០-១១:០០', '២:០០-៣:០០', '៣:០០-៥:០០'] },
  { id: 3, title: '៣. គោលការណ៍ថ្នាក់រៀន', cat: 'classroom_mgmt', orientation: 'portrait' },
  { id: 11, title: '១១. ប្រតិទិន្នសម្រាប់គ្រូ', cat: 'classroom_mgmt', orientation: 'landscape' },
  { id: 43, title: '៤៣. តារាងវេនសម្អាតប្រចាំសប្ដាហ៍', cat: 'classroom_mgmt', orientation: 'landscape' },
  { id: 44, title: '៤៤. បញ្ជីសារពើភ័ណ្ឌ', cat: 'classroom_mgmt', orientation: 'portrait', headers: ['ល.រ', 'ឈ្មោះសម្ភារៈ', 'ចំនួនសរុប', 'ស្ថានភាពល្អ', 'ស្ថានភាពខូច', 'ផ្សេងៗ'] },
  { id: 45, title: '៤៥. បញ្ជីរាយនាមសិស្សខ្ចីសៀវភៅសិក្សាគោល', cat: 'classroom_mgmt', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'កម្រងសៀវភៅ', 'ថ្ងៃខ្ចី', 'ថ្ងៃសង', 'ហត្ថលេខា'] },

  // Category 2: វត្តមាន និងវិន័យ (Items: 4, 6, 29, 47)
  { id: 4, title: '៤. បញ្ជីពិន្ទុបំណិនជីវិត', cat: 'attendance_discipline', orientation: 'landscape' },
  { id: 6, title: '៦. បញ្ជីអវត្តមានប្រចាំខែ', cat: 'attendance_discipline', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'មានច្បាប់', 'ឥតច្បាប់', 'សរុប', 'ផ្សេងៗ'] },
  { id: 29, title: '២៩. ចំនួនសរុបអវត្តមានប្រចាំឆ្នាំ', cat: 'attendance_discipline', orientation: 'landscape' },
  { id: 47, title: '៤៧. លិខិតសុំច្បាប់', cat: 'attendance_discipline', orientation: 'portrait' },

  // Category 3: លទ្ធផលការសិក្សា (Items: 5, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32)
  { id: 5, title: '៥. របាយការណ៍ប្រចាំខែ', cat: 'academic_records', orientation: 'portrait' },
  { id: 7, title: '៧. តារាងសម្រង់ពិន្ទុប្រចាំខែ', cat: 'academic_records', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'អំណាន', 'សំណេរ', 'គណិត', 'វិទ្យាសាស្ត្រ', 'សីលធម៌', 'សរុប', 'មធ្យម'] },
  { id: 8, title: '៨. តារាងចំណាត់ថ្នាក់ប្រចាំខែ', cat: 'academic_records', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'មធ្យមភាគ', 'ចំណាត់ថ្នាក់', 'និទ្ទេស', 'ផ្សេងៗ'] },
  { id: 9, title: '៩. តារាងកិត្តិយសប្រចាំខែ', cat: 'academic_records', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'មធ្យមភាគ', 'ចំណាត់ថ្នាក់', 'សរសើរលើកទឹកចិត្ត'] },
  { id: 10, title: '១០. លទ្ធផលនៃការសិក្សាប្រចាំខែ', cat: 'academic_records', orientation: 'portrait' },
  { id: 12, title: '១២. ចំណាត់ថ្នាក់ប្រចាំខែ', cat: 'academic_records', orientation: 'landscape' },
  { id: 13, title: '១៣. តារាងស្រង់ពិន្ទុប្រចាំឆមាសនិងឆ្នាំ', cat: 'academic_records', orientation: 'landscape' },
  { id: 14, title: '១៤. តារាងស្រង់ពិន្ទុប្រឡងឆមាសទី១', cat: 'academic_records', orientation: 'landscape' },
  { id: 15, title: '១៥. ចំណាត់ថ្នាក់ប្រឡងឆមាសទី១', cat: 'academic_records', orientation: 'landscape' },
  { id: 16, title: '១៦. តារាងកិត្តិយសប្រចាំឆមាសទី១', cat: 'academic_records', orientation: 'landscape' },
  { id: 17, title: '១៧. ចំណាត់ថ្នាក់ប្រចាំឆមាសទី១', cat: 'academic_records', orientation: 'landscape' },
  { id: 18, title: '១៨. លទ្ធផលការសិក្សាប្រចាំឆមាសទី១', cat: 'academic_records', orientation: 'portrait' },
  { id: 19, title: '១៩. តារាងស្រង់ពិន្ទុប្រឡងឆមាសទី២', cat: 'academic_records', orientation: 'landscape' },
  { id: 20, title: '២០. ចំណាត់ថ្នាក់ប្រឡងឆមាសទី២', cat: 'academic_records', orientation: 'landscape' },
  { id: 21, title: '២១. តារាងកិត្តិយសប្រចាំឆមាសទី២', cat: 'academic_records', orientation: 'landscape' },
  { id: 22, title: '២២. ចំណាត់ថ្នាក់ប្រចាំឆមាសទី២', cat: 'academic_records', orientation: 'landscape' },
  { id: 23, title: '២៣. លទ្ធផលការសិក្សាប្រចាំឆមាសទី២', cat: 'academic_records', orientation: 'portrait' },
  { id: 24, title: '២៤. ចំណាត់ថ្នាក់ប្រចាំឆ្នាំសិក្សា', cat: 'academic_records', orientation: 'landscape' },
  { id: 25, title: '២៥. ចំណាត់ថ្នាក់ប្រចាំឆ្នាំសិក្សា', cat: 'academic_records', orientation: 'landscape' },
  { id: 26, title: '២៦. តារាងកិត្តិយសប្រចាំឆ្នាំសិក្សា', cat: 'academic_records', orientation: 'landscape' },
  { id: 27, title: '២៧. លទ្ធផលនៃការសិក្សាប្រចាំឆ្នាំ', cat: 'academic_records', orientation: 'portrait' },
  { id: 28, title: '២៨. ព្រឹត្តិបត្រពិន្ទុប្រចាំឆ្នាំ', cat: 'academic_records', orientation: 'portrait' },
  { id: 30, title: '៣០. តារាងសម្រង់ពិន្ទុតាមមុខវិជ្ជា ប្រចាំឆមាសទី១', cat: 'academic_records', orientation: 'landscape' },
  { id: 31, title: '៣១. តារាងសម្រង់ពិន្ទុតាមមុខវិជ្ជា ប្រចាំឆមាសទី២', cat: 'academic_records', orientation: 'landscape' },
  { id: 32, title: '៣២. តារាងសម្រង់ពិន្ទុសិស្សតាមមុខវិជ្ជា សម្រាប់សាលា', cat: 'academic_records', orientation: 'landscape' },

  // Category 4: រដ្ឋបាល និងស្ថិតិ (Items: 33, 34, 35, 36, 37, 46)
  { id: 33, title: '៣៣. សាលាកបត្រឯកត្តជន', cat: 'admin_stats', orientation: 'portrait' },
  { id: 34, title: '៣៤. លិខិតផ្ទេរការសិក្សា', cat: 'admin_stats', orientation: 'portrait' },
  { id: 35, title: '៣៥. លិខិតបញ្ជាក់ការសិក្សា', cat: 'admin_stats', orientation: 'portrait' },
  { id: 36, title: '៣៦. បញ្ជីរាយនាមសិស្សថ្នាក់ទី(១ដល់៦)សុំចូលរៀនថ្នាក់ទី៧', cat: 'admin_stats', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'ថ្ងៃខែឆ្នាំកំណើត', 'សាលាបច្ចុប្បន្ន', 'មធ្យមភាគ', 'ផ្សេងៗ'] },
  { id: 37, title: '៣៧. បញ្ជីរាយនាមសិស្សឡើងថ្នាក់', cat: 'admin_stats', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'ថ្នាក់ចាស់', 'ថ្នាក់ថ្មី', 'ចំណាត់ថ្នាក់', 'ផ្សេងៗ'] },
  { id: 46, title: '៤៦. សេចក្ដីជូនដំណឹង', cat: 'admin_stats', orientation: 'portrait' },

  // Category 5: សិស្សគោលដៅ និងជំនួយ (Items: 38, 39, 40, 41, 42, 48)
  { id: 38, title: '៣៨. បញ្ជីឈ្មោះសិស្សអាហាររូបករណ៍ក្រីក្រ', cat: 'student_support', orientation: 'landscape' },
  { id: 39, title: '៣៩. បញ្ជីរាយនាមសិស្សក្រីក្រ', cat: 'student_support', orientation: 'landscape' },
  { id: 40, title: '៤០. បញ្ជីរាយនាមសិស្សអាហាររូបករណ៍', cat: 'student_support', orientation: 'landscape' },
  { id: 41, title: '៤១. បញ្ជីរាយនាមសិស្សកំព្រា', cat: 'student_support', orientation: 'landscape' },
  { id: 42, title: '៤២. បញ្ជីរាយនាមសិស្សពិការ', cat: 'student_support', orientation: 'landscape' },
  { id: 48, title: '៤៨. បញ្ជីរាយនាមសិស្សត្រូវរៀនបំប៉នបន្ថែម', cat: 'student_support', orientation: 'landscape', headers: ['ល.រ', 'ឈ្មោះសិស្ស', 'ភេទ', 'មុខវិជ្ជាបំប៉ន', 'ម៉ោងរៀន', 'កាលបរិច្ឆេទ', 'ផ្សេងៗ'] },
];

export default function SchoolArchiveView({ onBack }: SchoolArchiveViewProps) {
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content');
    if (!printContent) return;
    
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); 
  };

  const filteredDocs = DOCUMENTS.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const Dashboard = () => (
    <div className="flex flex-col min-h-screen">
      {/* Premium Header - Vibrant Blue Gradient */}
      <div className="bg-gradient-to-r from-[#4242f5] to-[#2929e0] p-6 md:p-12 text-center shadow-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
            <div className="flex items-center gap-5">
                {/* Logo Placeholder with Orange Book Icon */}
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-lg border border-white/20 transform -rotate-6 group-hover:rotate-0 transition-transform">
                    <BookOpen className="w-8 h-8 text-[#FFCA28]" />
                </div>
                <h1 className="khmer-muol text-2xl md:text-5xl text-[#FFCA28] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] tracking-wide">
                    ប្រព័ន្ធបង្កើតកិច្ចតែងការ Digital
                </h1>
            </div>
            <div className="w-40 h-1.5 bg-gradient-to-r from-transparent via-[#FFCA28] to-transparent rounded-full opacity-60 mb-2"></div>
            {/* Welcome Section in Kantumruy Pro */}
            <h2 className="font-kantumruy-pro leading-relaxed text-white text-xl md:text-3xl font-black opacity-95 drop-shadow-lg scale-105">
                សូមស្វាគមន៍មកកាន់ប្រព័ន្ធ Digital
            </h2>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12 w-full">
        {/* Functional Search Bar */}
        <div className="max-w-2xl mx-auto relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text" 
            placeholder="ស្វែងរកប្រធានបទ ឬលេខកូដឯកសារ..."
            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-indigo-50 rounded-[2.5rem] text-sm md:text-base outline-none focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all khmer-battambang font-bold shadow-xl placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Grid - 5 Visual Cards as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pb-24">
          {DOCUMENT_CATEGORIES.map(cat => {
            const docs = filteredDocs.filter(d => d.cat === cat.id);
            if (searchTerm && docs.length === 0) return null;

            return (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-3 group"
              >
                <div className={`p-8 ${cat.color} text-white flex items-center gap-5 px-10 relative overflow-hidden`}>
                  {/* Decorative Background Icon */}
                  <div className="absolute -right-4 -bottom-4 opacity-10 transform rotate-12 scale-150">
                    {cat.icon}
                  </div>
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner border border-white/30">
                    {cat.icon}
                  </div>
                  <h3 className="font-kantumruy-pro font-black text-base md:text-lg uppercase tracking-tight leading-tight">{cat.name}</h3>
                </div>
                <div className="flex-1 p-6 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar bg-slate-50/10">
                  {docs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className="w-full text-left p-4 rounded-[1.5rem] text-[12px] md:text-[13px] font-bold text-slate-700 hover:bg-[#4242f5] hover:text-white transition-all flex items-center gap-5 bg-white border border-slate-100 group/btn shadow-sm active:scale-95 khmer-battambang"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover/btn:bg-white/20 flex items-center justify-center text-[10px] md:text-[11px] flex-shrink-0 font-black shadow-inner border border-slate-200/50">
                        {doc.id}
                      </div>
                      <span className="flex-1 leading-relaxed opacity-90 group-hover/btn:opacity-100">{doc.title.split('. ')[1]}</span>
                    </button>
                  ))}
                  {docs.length === 0 && (
                    <div className="py-12 text-center text-slate-400 font-bold italic text-sm">ពុំមានទិន្នន័យស្របតាមលក្ខខណ្ឌស្វែងរក</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const Preview = () => {
    const selectedDoc = DOCUMENTS.find(d => d.id === selectedDocId)!;
    return (
        <div className="flex flex-col items-center p-4 md:p-10 pt-20">
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <button 
                    onClick={() => setSelectedDocId(null)}
                    className="flex items-center gap-2 text-[#1a237e] hover:bg-slate-50 px-4 py-2 rounded-2xl transition-colors font-bold khmer-battambang"
                >
                    <ChevronLeft className="w-5 h-5" /> ត្រឡប់មកកាន់ផ្ទាំងគ្រប់គ្រង
                </button>
                <div className="text-center hidden md:block">
                    <h2 className="khmer-muol text-indigo-900">{selectedDoc.title}</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-kantumruy-pro">A4 Paper - {selectedDoc.orientation.toUpperCase()}</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 bg-[#1a237e] text-white px-6 py-2.5 rounded-2xl font-black khmer-battambang shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Printer className="w-4 h-4" /> បោះពុម្ព (Print)
                </button>
            </div>

            <div 
                id="printable-content"
                className={`bg-white shadow-[0_0_80px_rgba(0,0,0,0.15)] border border-slate-200 mt-10 origin-top scale-[0.9] md:scale-100 ${
                    selectedDoc.orientation === 'portrait' ? 'w-[794px] min-h-[1123px]' : 'w-[1123px] min-h-[794px]'
                }`}
                style={{ padding: '60px' }}
            >
                <DocumentTemplate id={selectedDocId!} />
            </div>
        </div>
    )
  }

  return (
    <div className="bg-[#f5f5f5] min-h-screen relative font-battambang selection:bg-indigo-100 selection:text-indigo-900">
      <div className="fixed top-0 left-0 bg-white border-b border-slate-100 w-full p-4 md:px-10 flex justify-between items-center z-40 backdrop-blur-md bg-white/70">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-2xl transition-colors font-bold font-kantumruy-pro text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> DASHBOARD
        </button>
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black">P</div>
            <span className="font-kantumruy-pro font-black text-[#1a237e] text-sm hidden sm:inline">PRO SYSTEM</span>
        </div>
      </div>

      <div className="pt-24">
        {selectedDocId ? <Preview /> : <Dashboard />}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@100;300;400;700;900&family=Battambang:wght@400;700;900&display=swap');
        
        .khmer-muol { font-family: "Khmer OS Muol Light", serif; }
        .khmer-battambang { font-family: "Khmer OS Battambang", sans-serif; }
        .font-kantumruy-pro { font-family: "Kantumruy Pro", sans-serif; }

        @media print {
          @page {
            size: ${selectedDocId && DOCUMENTS.find(d => d.id === selectedDocId)?.orientation === 'portrait' ? 'A4 portrait' : 'A4 landscape'};
            margin: 0;
          }
          body {
            background: white !important;
          }
          #printable-content {
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 40px !important;
            transform: scale(1) !important;
          }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
}

function DocumentTemplate({ id }: { id: number }) {
  const currentDoc = DOCUMENTS.find(d => d.id === id)!;
  
  // Common Header for most documents
  const Header = ({ title }: { title: string }) => (
    <div className="text-center space-y-2 mb-10">
      <p className="khmer-muol text-lg">ព្រះរាជាណាចក្រកម្ពុជា</p>
      <p className="khmer-muol text-lg">ជាតិ សាសនា ព្រះមហាក្សត្រ</p>
      <div className="flex justify-center py-2">
        <div className="w-24 border-b-2 border-slate-800"></div>
      </div>
      <div className="flex justify-between items-center text-sm font-bold khmer-battambang px-8 pt-4">
        <div className="text-left">
          <p>មន្ទីរអប់រំ យុវជន និងកីឡាខេត្ត........</p>
          <p>ការិយាល័យអប់រំ យុវជន និងកីឡាស្រុក........</p>
          <p>សាលាបឋមសិក្សា៖ ................................</p>
        </div>
        <div className="text-right">
          <p>លេខ៖ ............... ស.ប</p>
        </div>
      </div>
      <h3 className="khmer-muol text-2xl pt-10 uppercase">{title}</h3>
    </div>
  );

  const Footer = () => (
    <div className="mt-20 flex justify-between khmer-battambang px-10">
      <div className="text-center">
        <p>បានឃើញ និងឯកភាព</p>
        <p className="font-bold">នាយកសាលា</p>
        <div className="h-24"></div>
        <p>.......................................</p>
      </div>
      <div className="text-center">
        <p>ថ្ងៃ................ខែ..........ឆ្នាំ..............</p>
        <p className="font-bold">គ្រូបង្រៀន</p>
        <div className="h-24"></div>
        <p>.......................................</p>
      </div>
    </div>
  );

  // Template: Classroom Rules (ID 3)
  if (id === 3) {
    return (
      <div className="khmer-battambang border-8 border-indigo-100 p-12 min-h-[1000px]">
        <Header title="គោលការណ៍ថ្នាក់រៀន" />
        <div className="grid grid-cols-1 gap-6 mt-10">
           {[
             '១. ត្រូវគោរពទង់ជាតិ និងបទបញ្ជាផ្ទៃក្នុងសាលា។',
             '២. ត្រូវមកសាលារៀនឱ្យបានទៀងទាត់ និងទាន់ពេលវេលា។',
             '៣. ត្រូវមានសីលធម៌ល្អ សុភាពរាបសារ និងចេះជួយគ្នាទៅវិញទៅមក។',
             '៤. ត្រូវថែរក្សាអនាម័យខ្លួនប្រាណ និងបរិស្ថានថ្នាក់រៀន។',
             '៥. ត្រូវយកចិត្តទុកដាក់ស្ដាប់ការពន្យល់របស់គ្រូ និងធ្វើកិច្ចការផ្ទះ។',
             '៦. មិនត្រូវប្រើប្រាស់ពាក្យអសុរស ឬបង្កជម្លោះក្នុងថ្នាក់ឡើយ។',
             '៧. មិនត្រូវនាំយកគ្រឿងញៀន ឬរបស់បង្កគ្រោះថ្នាក់ចូលក្នុងសាលា។'
           ].map((rule, index) => (
             <div key={index} className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-xl font-bold leading-relaxed">{rule}</p>
             </div>
           ))}
        </div>
        <Footer />
      </div>
    );
  }

  // Template: Dynamic Table (For all table-based docs)
  if (currentDoc.headers) {
    return (
      <div className="khmer-battambang">
        <Header title={currentDoc.title.split('. ')[1]} />
        <table className="w-full border-collapse border-2 border-slate-800 text-[10px]">
          <thead>
            <tr className="bg-slate-100">
              {currentDoc.headers.map((header, i) => (
                <th key={i} className="border-2 border-slate-800 p-2 text-center uppercase font-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 25 }).map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                {currentDoc.headers?.map((_, j) => (
                  <td key={j} className="border-2 border-slate-800 p-2 text-center min-h-[30px]">
                    {j === 0 ? i + 1 : j === 1 ? '......................' : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-xs font-bold flex justify-end gap-20 px-4">
           <p>សរុបសិស្ស៖ ............. នាក់</p>
           <p>ស្រី៖ ............. នាក់</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Template: Teacher Calendar (ID 11)
  if (id === 11) {
    return (
      <div className="khmer-battambang">
        <Header title="ប្រតិទិនសម្រាប់គ្រូ" />
        <table className="w-full border-collapse border-2 border-slate-800 text-[10px]">
          <thead>
            <tr className="bg-indigo-50">
              <th className="border-2 border-slate-800 p-2 text-center w-24">កាលបរិច្ឆេទ</th>
              <th className="border-2 border-slate-800 p-2 text-center w-20">ម៉ោងសិក្សា</th>
              <th className="border-2 border-slate-800 p-2 text-center w-32">មុខវិជ្ជា</th>
              <th className="border-2 border-slate-800 p-2 text-center">មេរៀន / ចំណងជើង</th>
              <th className="border-2 border-slate-800 p-2 text-center">ចំណុចសំខាន់ៗ / វត្ថបំណង</th>
              <th className="border-2 border-slate-800 p-2 text-center w-32">សម្ភារៈឧបទេស</th>
              <th className="border-2 border-slate-800 p-2 text-center w-24">ការវាយតម្លៃ</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 15 }).map((_, i) => (
              <tr key={i}>
                <td className="border-2 border-slate-800 p-4"></td>
                <td className="border-2 border-slate-800 p-4"></td>
                <td className="border-2 border-slate-800 p-4"></td>
                <td className="border-2 border-slate-800 p-4"></td>
                <td className="border-2 border-slate-800 p-4"></td>
                <td className="border-2 border-slate-800 p-4"></td>
                <td className="border-2 border-slate-800 p-4"></td>
              </tr>
            ))}
          </tbody>
        </table>
        <Footer />
      </div>
    );
  }

  // Template: Formal Certificate / Letter (ID 34, 35, 46, 47)
  if (id === 34 || id === 35 || id === 46 || id === 47) {
    const isNotice = id === 46;
    const isRequest = id === 47;
    return (
      <div className={`khmer-battambang border-8 border-double border-slate-800 p-10 min-h-[1000px] relative ${isNotice ? 'bg-amber-50/10' : ''}`}>
        <Header title={
          id === 34 ? "លិខិតផ្ទេរការសិក្សា" : 
          id === 35 ? "លិខិតបញ្ជាក់ការសិក្សា" : 
          id === 46 ? "សេចក្ដីជូនដំណឹង" : "លិខិតសុំច្បាប់"
        } />
        <div className="space-y-8 text-lg mt-10 px-10 leading-[3rem]">
          {isNotice ? (
            <div className="space-y-6">
              <p className="font-bold underline text-center">កម្មវត្ថុ៖ ..........................................................................................................................</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; សូមជម្រាបជូនដល់មាតាបិតា ឬអាណាព្យាបាលសិស្សទាំងអស់មេត្តាជ្រាបថា៖ .........................................................................................................................................</p>
              <p>................................................................................................................................................................................</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; អាស្រ័យហេតុនេះ សូមមាតាបិតា ឬអាណាព្យាបាលសិស្សទាំងអស់មេត្តាជ្រាប និងយោគយល់ដោយក្ដីអនុគ្រោះ។</p>
            </div>
          ) : isRequest ? (
            <div className="space-y-6">
              <p className="khmer-muol">សូមគោរពជូន៖ លោក/លោកស្រី នាយកសាលាបឋមសិក្សា .......................................................</p>
              <p>តបតាមកម្មវត្ថុខាងលើ ខ្ញុំបាទ/នាងខ្ញុំ ឈ្មោះ .................................................................................................</p>
              <p>ជាអាណាព្យាបាលសិស្សឈ្មោះ ................................................................. រៀននៅថ្នាក់ទី .........................</p>
              <p>សូមអនុញ្ញាតច្បាប់ឈប់កូនចំនួន ............... ថ្ងៃ ចាប់ពីថ្ងៃទី ....... ខែ ....... ឆ្នាំ ....... ដល់ថ្ងៃទី ....... ខែ ....... ឆ្នាំ .......</p>
              <p>មូលហេតុ៖ .............................................................................................................................................</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; សង្ឃឹមថាលោកនាយកនឹងអនុញ្ញាតដោយក្ដីអនុគ្រោះ។</p>
            </div>
          ) : (
            <>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; នាយកសាលាបឋមសិក្សា៖ ..................................................................................................</p>
              <p className="khmer-muol">បញ្ជាក់ថា៖</p>
              <p>សិស្សឈ្មោះ៖ ..................................................................... ភេទ៖ ........................ សញ្ជាតិ៖ ........................</p>
              <p>កើតថ្ងៃទី៖ ............ ខែ ............ ឆ្នាំ ............ នៅភូមិ៖ ........................ ឃុំ/សង្កាត់៖ ........................................</p>
              <p>ស្រុក/ខណ្ឌ៖ ........................................ ខេត្ត/រាជធានី៖ ..................................................................................</p>
              <p>ជាសិស្សរៀននៅថ្នាក់ទី៖ ............ ក្នុងឆ្នាំសិក្សា ២០......... - ២០......... នៃសាលាបឋមសិក្សា៖ ................................</p>
              <p>មានបំណងសុំផ្ទេរទៅរៀននៅសាលាបឋមសិក្សា៖ ................................................................................................</p>
              <p>មូលហេតុ៖ ......................................................................................................................................................</p>
              <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; លិខិតបញ្ជាក់នេះ ចេញជូនសាមីខ្លួនដើម្បីយកទៅប្រើប្រាស់តាមលទ្ធភាពដែលអាចធ្វើទៅបាន។</p>
            </>
          )}
        </div>
        <Footer />
      </div>
    );
  }

  // Template: Individual Card (ID 33)
  if (id === 33) {
    return (
      <div className="khmer-battambang p-10 min-h-[1000px]">
        <Header title="សាលាកបត្រឯកត្តជន" />
        <div className="grid grid-cols-2 gap-10 mt-10 border-2 border-slate-800 p-8">
           <div className="space-y-4">
              <div className="w-32 h-40 border-2 border-slate-800 flex items-center justify-center text-xs italic">រូបថត 4x6</div>
              <p>ឈ្មោះសិស្ស៖ .................................................</p>
              <p>ភេទ៖ ................ ថ្ងៃខែឆ្នាំកំណើត៖ ................</p>
              <p>ទីកន្លែងកំណើត៖ .............................................</p>
           </div>
           <div className="space-y-4">
              <p>ឈ្មោះឪពុក៖ .................................................</p>
              <p>មុខរបរ៖ .......................................................</p>
              <p>ឈ្មោះម្ដាយ៖ .................................................</p>
              <p>មុខរបរ៖ .......................................................</p>
              <p>អាសយដ្ឋានបច្ចុប្បន្ន៖ .......................................</p>
           </div>
        </div>
        <div className="mt-10">
           <p className="khmer-muol mb-4">ប្រវត្តិនៃការសិក្សា៖</p>
           <table className="w-full border-collapse border-2 border-slate-800">
              <thead>
                 <tr className="bg-slate-50">
                    <th className="border-2 border-slate-800 p-2">ឆ្នាំសិក្សា</th>
                    <th className="border-2 border-slate-800 p-2">ថ្នាក់ទី</th>
                    <th className="border-2 border-slate-800 p-2">លទ្ធផល</th>
                    <th className="border-2 border-slate-800 p-2">ផ្សេងៗ</th>
                 </tr>
              </thead>
              <tbody>
                 {[1,2,3,4,5,6].map(i => (
                    <tr key={i}>
                       <td className="border-2 border-slate-800 p-4"></td>
                       <td className="border-2 border-slate-800 p-4 text-center">{i}</td>
                       <td className="border-2 border-slate-800 p-4"></td>
                       <td className="border-2 border-slate-800 p-4"></td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
        <Footer />
      </div>
    );
  }

  // Default fallback for other IDs
  return (
    <div className="khmer-battambang flex flex-col items-center justify-center p-20 text-slate-300 border-4 border-dashed border-slate-100 rounded-[3rem]">
       <FileText className="w-40 h-40 mb-6 opacity-20" />
       <p className="text-2xl font-black khmer-font opacity-20">ទម្រង់ឯកសារ "{DOCUMENTS.find(d => d.id === id)?.title}"</p>
       <p className="khmer-font opacity-20 mt-2">ត្រូវបានរៀបចំរួចរាល់សម្រាប់ការបោះពុម្ព</p>
       <div className="w-full mt-10">
          <Header title={DOCUMENTS.find(d => d.id === id)?.title.split('. ')[1] || ""} />
          <div className="w-full h-80 border-2 border-slate-800 flex items-center justify-center italic text-slate-400">
             (ទិន្នន័យតារាងសម្រាប់បោះពុម្ព)
          </div>
          <Footer />
       </div>
    </div>
  );
}
