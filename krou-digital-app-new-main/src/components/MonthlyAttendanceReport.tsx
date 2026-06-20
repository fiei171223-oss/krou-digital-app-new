import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  UserX,
  Users,
  Search,
  Filter
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, getDocs, where, orderBy } from 'firebase/firestore';
import { Student, AttendanceRecord, Grade } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firebase';

interface MonthlyAttendanceReportProps {
  onBack: () => void;
}

export default function MonthlyAttendanceReport({ onBack }: MonthlyAttendanceReportProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [activeGrade, setActiveGrade] = useState<Grade | 'all'>(6); // Default to Grade 6 as per prompt
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all students for the selected grade
  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as Student[]);
    }, (error) => handleFirestoreError(error, OperationType.GET, 'students'));
    return () => unsubscribe();
  }, []);

  // Fetch attendance for the selected month
  useEffect(() => {
    const fetchAttendance = async () => {
      const startOfMonth = `${selectedMonth}-01`;
      const endOfMonth = `${selectedMonth}-31`;
      const q = query(
        collection(db, 'attendance'),
        where('date', '>=', startOfMonth),
        where('date', '<=', endOfMonth)
      );

      try {
        const snapshot = await getDocs(q);
        setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any })) as AttendanceRecord[]);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'attendance');
      }
    };
    fetchAttendance();
  }, [selectedMonth]);

  const filteredStudents = students.filter(s => {
    const matchesGrade = activeGrade === 'all' || s.grade === activeGrade;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const [year, month] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayNames = ['អា', 'ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'];
  const khmerMonths = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ិកា', 'ធ្នូ'
  ];

  // Statistics calculation helpers
  const totalStudents = filteredStudents.length;
  const femaleStudents = filteredStudents.filter(s => s.gender === 'female' || s.gender === 'ស្រី').length;
  const schoolDays = 24; // Default as requested
  const totalAbsentCount = attendance.filter(r => 
    filteredStudents.some(s => s.id === r.studentId) && 
    (r.status === 'absent' || r.status === 'permission')
  ).length;

  return (
    <div className="space-y-8 min-h-screen pb-20 font-khmer">
      {/* Search & Actions Bar (Hidden when printing) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-all font-medium border border-slate-200 shadow-sm self-start"
        >
          <ArrowLeft className="w-4 h-4" /> ត្រឡប់ក្រោយ
        </button>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="ស្វែងរកឈ្មោះសិស្ស..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[1, 2, 3, 4, 5, 6].map((g) => (
              <button
                key={g}
                onClick={() => setActiveGrade(g as Grade)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeGrade === g ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
              >
                {g}
              </button>
            ))}
          </div>

          <input 
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm font-bold"
          />

          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
          >
            <Printer className="w-5 h-5" /> បោះពុម្ពបញ្ជីអាវត្តមាន (Excel Style)
          </button>
        </div>
      </div>

      {/* The Printable Report Container */}
      <div className="bg-white p-4 md:p-12 md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-x-auto print:p-0 print:shadow-none print:border-none print:m-0">
        <div id="attendance-excel-report" className="min-w-[1250px] mx-auto bg-white p-10 font-khmer style-excel-report">
          {/* Page Orientation Note for UI only */}
          <div className="mb-4 text-xs text-slate-400 text-right print:hidden flex items-center justify-end gap-2">
            <LayoutIcon className="w-4 h-4" /> សម្រាប់បោះពុម្ពលើក្រដាស A4 Landscape
          </div>

          {/* Report Header */}
          <div className="grid grid-cols-3 mb-12 items-start">
            {/* Left Info */}
            <div className="text-left text-[11pt] font-khmer space-y-2">
              <p className="font-bold">សាលាបឋមសិក្សា៖ ...................................................</p>
              <p className="font-bold">ថ្នាក់ទី៖ <span className="font-moul">{activeGrade} (ក)</span></p>
              <p className="font-bold">ឆ្នាំសិក្សា៖ ២០២៣-២០២៤</p>
              <p className="font-bold">លេខរៀងទំព័រ៖ ០១ / ០១</p>
            </div>

            {/* Center Header */}
            <div className="text-center space-y-4">
              <div className="space-y-1">
                <h3 className="text-[14pt] font-black font-moul text-slate-800 uppercase tracking-widest text-[#000000]">ព្រះរាជាណាចក្រកម្ពុជា</h3>
                <h4 className="text-[13pt] font-black font-moul text-slate-800 uppercase text-[#000000]">ជាតិ សាសនា ព្រះមហាក្សត្រ</h4>
                <div className="flex justify-center -mt-1">
                  <div className="w-32 h-[1.5px] bg-slate-800 relative">
                    <div className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-16 h-[1px] bg-slate-800"></div>
                  </div>
                </div>
              </div>

              <h2 className="text-[20pt] font-black font-moul text-[#FF0000] mt-10 uppercase leading-none tracking-tighter">
                បញ្ជីអវត្តមានប្រចាំខែ {khmerMonths[month - 1]}
              </h2>
            </div>

            {/* Right Date Placeholder */}
            <div className="text-right text-[11pt] font-bold text-slate-700">
               <p className="italic text-[9pt] text-slate-400 font-medium mb-1">Generated: {new Date().toLocaleString('km-KH')}</p>
            </div>
          </div>

          {/* The Data Table */}
          <table className="w-full border-collapse border-[2.5px] border-[#0066CC] text-[10pt] font-khmer leading-tight">
            <thead>
              {/* Row 1: Headers */}
              <tr className="bg-slate-50 font-bold h-12">
                <th rowSpan={2} className="border-[2px] border-[#0066CC] p-1 w-10 text-center bg-slate-100">ល.រ</th>
                <th rowSpan={2} className="border-[2px] border-[#0066CC] p-1 w-24 text-center bg-slate-100">អត្តលេខ</th>
                <th rowSpan={2} className="border-[2px] border-[#0066CC] p-1 w-64 text-left px-4 bg-slate-100">គោត្តនាម និងនាម</th>
                <th rowSpan={2} className="border-[2px] border-[#0066CC] p-1 w-12 text-center bg-slate-100">ភេទ <br/><span className="text-[8pt]">(ប/ស)</span></th>
                <th colSpan={daysInMonth} className="border-[2px] border-[#0066CC] p-2 text-center bg-slate-50 tracking-widest uppercase">
                  កាលបរិច្ឆេទនៃថ្ងៃសិក្សា (១ - {daysInMonth})
                </th>
                <th colSpan={3} className="border-[2px] border-[#0066CC] p-1 text-center bg-[#FFE6E6] text-rose-700">សរុបអវត្តមាន</th>
              </tr>
              {/* Row 2: Days Grid */}
              <tr className="bg-slate-50 font-bold h-20">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = new Date(year, month - 1, i + 1);
                  const dayName = dayNames[d.getDay()];
                  return (
                    <th key={i} className="border-[2px] border-[#0066CC] p-0 w-[30px] relative bg-white">
                      <div className="absolute inset-0 flex items-center justify-center -rotate-90 text-[9pt] font-black whitespace-nowrap text-slate-700">
                        {dayName}
                      </div>
                      <div className="absolute bottom-1 left-0 right-0 text-[8pt] text-center text-slate-500 font-bold">
                        {i + 1}
                      </div>
                    </th>
                  );
                })}
                <th className="border-[2px] border-[#0066CC] p-0 w-12 relative bg-[#FFE6E6]">
                  <div className="absolute inset-0 flex items-center justify-center -rotate-90 text-[9pt] font-black whitespace-nowrap text-rose-700">មានច្បាប់</div>
                </th>
                <th className="border-[2px] border-[#0066CC] p-0 w-12 relative bg-[#FFE6E6]">
                  <div className="absolute inset-0 flex items-center justify-center -rotate-90 text-[9pt] font-black whitespace-nowrap text-rose-700">ឥតច្បាប់</div>
                </th>
                <th className="border-[2px] border-[#0066CC] p-0 w-12 relative bg-[#FFE6E6]">
                  <div className="absolute inset-0 flex items-center justify-center -rotate-90 text-[9pt] font-black whitespace-nowrap text-rose-700 uppercase">សរុប</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map((student, index) => {
                let pCount = 0;
                let uCount = 0;
                
                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors h-10 group">
                    <td className="border-[2px] border-[#0066CC] text-center font-bold text-slate-600 bg-slate-50/50">{index + 1}</td>
                    <td className="border-[2px] border-[#0066CC] text-center text-[9pt] text-[#000000]">{student.id.slice(-8)}</td>
                    <td className="border-[2px] border-[#0066CC] px-4 font-bold text-slate-800 text-[11pt] tracking-tight">{student.name}</td>
                    <td className="border-[2px] border-[#0066CC] text-center font-black text-slate-700">{student.gender === 'male' || student.gender === 'ប្រុស' ? 'ប' : 'ស'}</td>
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = (i + 1).toString().padStart(2, '0');
                      const dateStr = `${selectedMonth}-${day}`;
                      const record = attendance.find(r => r.studentId === student.id && r.date === dateStr);
                      
                      let display = '';
                      if (record?.status === 'absent') {
                        uCount++;
                        display = 'អ';
                      } else if (record?.status === 'permission') {
                        pCount++;
                        display = 'ច';
                      }

                      const isWeekend = [0, 6].includes(new Date(year, month - 1, i + 1).getDay());

                      return (
                        <td key={i} className={`border-[2px] border-[#0066CC] text-center font-black text-[11pt] ${isWeekend ? 'bg-slate-50' : 'bg-white'} ${display === 'អ' ? 'text-red-600' : display === 'ច' ? 'text-amber-600' : ''}`}>
                          {display}
                        </td>
                      );
                    })}
                    <td className="border-[2px] border-[#0066CC] text-center bg-[#FFF2F2] font-black text-amber-700 text-[11pt]">{pCount || ''}</td>
                    <td className="border-[2px] border-[#0066CC] text-center bg-[#FFF2F2] font-black text-rose-700 text-[11pt]">{uCount || ''}</td>
                    <td className="border-[2px] border-[#0066CC] text-center bg-[#FFE6E6] font-black text-slate-900 text-[11pt]">{pCount + uCount || ''}</td>
                  </tr>
                );
              }) : (
                Array.from({ length: 15 }).map((_, i) => (
                  <tr key={i} className="h-10">
                    <td className="border-[2px] border-[#0066CC] text-center font-bold text-slate-600 bg-slate-50/50">{i + 1}</td>
                    <td className="border-[2px] border-[#0066CC]"></td>
                    <td className="border-[2px] border-[#0066CC]"></td>
                    <td className="border-[2px] border-[#0066CC]"></td>
                    {Array.from({ length: daysInMonth }).map((_, j) => (
                      <td key={j} className="border-[2px] border-[#0066CC]"></td>
                    ))}
                    <td className="border-[2px] border-[#0066CC] bg-[#FFF2F2]"></td>
                    <td className="border-[2px] border-[#0066CC] bg-[#FFF2F2]"></td>
                    <td className="border-[2px] border-[#0066CC] bg-[#FFE6E6]"></td>
                  </tr>
                ))
              )}
              
              {/* Statistics/Total row with specific light pink shading */}
              <tr className="bg-[#FFE6E6] font-black h-12 text-[11pt]">
                <td colSpan={4} className="border-[2px] border-[#0066CC] text-center px-4 uppercase tracking-wider text-slate-800">សរុបអវត្តមានរួមប្រចាំថ្ងៃ</td>
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = (i + 1).toString().padStart(2, '0');
                  const dateStr = `${selectedMonth}-${day}`;
                  const totalAbsentByDay = attendance.filter(r => r.date === dateStr && (r.status === 'absent' || r.status === 'permission')).length;
                  return (
                    <td key={i} className="border-[2px] border-[#0066CC] text-center text-red-700">{totalAbsentByDay || ''}</td>
                  );
                })}
                <td className="border-[2px] border-[#0066CC] text-center text-red-700">
                  {attendance.filter(r => r.status === 'permission' && filteredStudents.some(s => s.id === r.studentId)).length || ''}
                </td>
                <td className="border-[2px] border-[#0066CC] text-center text-red-700">
                  {attendance.filter(r => r.status === 'absent' && filteredStudents.some(s => s.id === r.studentId)).length || ''}
                </td>
                <td className="border-[2px] border-[#0066CC] text-center text-red-700 bg-red-200">
                  {totalAbsentCount || ''}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Footer Statistics & Signatures Section */}
          <div className="mt-14 grid grid-cols-2 gap-32 px-4 h-[350px]">
            {/* Statistics Table */}
            <div className="space-y-12">
              <div className="inline-block border-[2px] border-[#0066CC] min-w-[350px] shadow-sm">
                <div className="bg-[#FFE6E6] border-b-[2px] border-[#0066CC] p-2 text-center font-black text-rose-700 uppercase text-[11pt] tracking-widest">
                  តារាងសរុបស្ថិតិប្រចាំខែ
                </div>
                <div className="grid grid-cols-2 text-[10pt] font-bold">
                  <div className="border-r-[2px] border-b-[2px] border-[#0066CC] p-3 bg-slate-50 text-slate-800">សិស្សសរុបរួម៖</div>
                  <div className="border-b-[2px] border-[#0066CC] p-3 text-center font-black">{totalStudents || '៦០'} នាក់ (ស្រី {femaleStudents || '២៩'} នាក់)</div>
                  
                  <div className="border-r-[2px] border-b-[2px] border-[#0066CC] p-3 bg-slate-50 text-slate-800">ចំនួនថ្ងៃសិក្សាសរុប៖</div>
                  <div className="border-b-[2px] border-[#0066CC] p-3 text-center font-black">២៤ ថ្ងៃ</div>
                  
                  <div className="border-r-[2px] border-b-[2px] border-[#0066CC] p-3 bg-slate-50 text-slate-800">មធ្យមភាគសិស្សមកជៀន៖</div>
                  <div className="border-b-[2px] border-[#0066CC] p-3 text-center font-black text-emerald-600">៩៦.៥ %</div>
                  
                  <div className="border-r-[2px] border-[#0066CC] p-3 bg-slate-50 text-slate-800 uppercase">ភាគរយអវត្តមានសរុប៖</div>
                  <div className="p-3 text-center font-black text-red-600">៣.៥ %</div>
                </div>
              </div>

              {/* Director Signature Area */}
              <div className="text-center space-y-24 w-full max-w-[300px]">
                <div className="space-y-2">
                  <p className="font-bold text-slate-600 text-[11pt]">បានឃើញ និងឯកភាព</p>
                  <p className="font-moul text-[12pt] uppercase underline underline-offset-8">នាយកសាលា</p>
                </div>
                <div className="space-y-2">
                  <p className="font-moul text-[11pt] opacity-30 tracking-widest">................................................................</p>
                  <p className="text-[10pt] font-black text-slate-500">ឈ្មោះ៖ .............................................</p>
                </div>
              </div>
            </div>

            {/* Teacher Signature Area */}
            <div className="flex flex-col items-center text-center space-y-24">
                <div className="space-y-3">
                  <p className="font-bold text-slate-600 text-[11pt]">ធ្វើនៅ ........................., ថ្ងៃទី ......... ខែ ........... ឆ្នាំ ២០២៤</p>
                  <p className="font-moul text-[12pt] uppercase underline underline-offset-8 font-black">គ្រូបន្ទុកថ្នាក់</p>
                </div>
                <div className="space-y-4">
                  <p className="font-moul text-[11pt] opacity-30 tracking-widest">................................................................</p>
                  <div className="pt-2">
                    <p className="text-[12pt] font-black text-slate-800">ឈ្មោះ៖ ....................................................</p>
                  </div>
                </div>
            </div>
          </div>
          
          {/* Footer Branding Placeholder */}
          <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between items-center text-[9pt] text-slate-400 font-medium italic print:hidden">
            <span className="flex items-center gap-2"><LayoutIcon className="w-4 h-4" /> ប្រព័ន្ធគ្រប់គ្រងសាលារៀនឌីជីថល (Digital Teacher)</span>
            <span>ជំនួយការដ៏ឈ្លាសវៃ ដើម្បីលើកកម្ពស់គុណភាពអប់រំ</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
          }
          #attendance-excel-report, #attendance-excel-report * {
            visibility: visible;
          }
          #attendance-excel-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 !important;
            margin: 0 !important;
            transform: scale(0.75);
            transform-origin: top left;
          }
          @page {
            size: A4 landscape;
            margin: 5mm;
          }
        }
        .font-moul { font-family: 'Khmer OS Muol Light', serif; }
        .font-khmer { font-family: 'Inter', 'Khmer OS Battambang', sans-serif; }
      `}} />
    </div>
  );
}

function LayoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="9" x2="9" y1="21" y2="9" />
    </svg>
  );
}
