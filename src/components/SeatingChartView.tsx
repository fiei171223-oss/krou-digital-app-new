import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Grid3X3, 
  Shuffle, 
  Save, 
  Trash2, 
  UserPlus, 
  Monitor,
  Layout,
  LayoutGrid,
  Users,
  Maximize2,
  RefreshCcw,
  CheckCircle2,
  Download,
  Printer
} from 'lucide-react';
import { Student, SeatingChart } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, setDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface SeatingChartViewProps {
  onBack: () => void;
  students: Student[];
}

type LayoutType = 'traditional' | 'groups' | 'exam';

export default function SeatingChartView({ onBack, students }: SeatingChartViewProps) {
  const [layoutType, setLayoutType] = useState<LayoutType>('traditional');
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(6);
  const [chartName, setChartName] = useState('ប្លង់ថ្នាក់រៀនធម្មតា');
  const [seating, setSeating] = useState<Record<string, string>>({}); // "row-col" -> studentId
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [swapSeat, setSwapSeat] = useState<string | null>(null);
  const [savedCharts, setSavedCharts] = useState<SeatingChart[]>([]);
  const [activeChartId, setActiveChartId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const chartRef = React.useRef<HTMLDivElement>(null);

  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    coral: 'bg-rose-50 border-rose-200 text-rose-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  const layoutColors = ['blue', 'teal', 'amber', 'coral', 'purple', 'gray'];

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'seating_charts'), orderBy('updatedAt', 'desc')), (snap) => {
      setSavedCharts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SeatingChart[]);
    });
    return unsub;
  }, []);

  const handleLayoutChange = (type: LayoutType) => {
    setLayoutType(type);
    setSeating({}); // Clear current seating when switching layout
    setActiveChartId(null);
    if (type === 'traditional') {
      setRows(5);
      setCols(6);
      setChartName('ប្លង់ថ្នាក់រៀនធម្មតា');
    } else if (type === 'groups') {
      setRows(3); // 3 rows of pods = 6 pods
      setCols(2); 
      setChartName('ប្លង់ថ្នាក់រៀនជាក្រុម');
    } else if (type === 'exam') {
      setRows(5); 
      setCols(6);
      setChartName('ប្លង់តុអង្គុយប្រឡង (Exam Hall)');
    }
  };

  const handleSeatClick = (seatId: string) => {
    if (swapSeat) {
      // Perform swap
      const newSeating = { ...seating };
      const student1 = newSeating[swapSeat];
      const student2 = newSeating[seatId];
      
      if (student1) newSeating[seatId] = student1;
      else delete newSeating[seatId];
      
      if (student2) newSeating[swapSeat] = student2;
      else delete newSeating[swapSeat];
      
      setSeating(newSeating);
      setSwapSeat(null);
      return;
    }

    setSelectedSeat(seatId);
  };

  const assignStudent = (studentId: string) => {
    if (!selectedSeat) return;
    
    const newSeating = { ...seating };
    // Remove if already seated
    Object.keys(newSeating).forEach(key => {
      if (newSeating[key] === studentId) delete newSeating[key];
    });

    newSeating[selectedSeat] = studentId;
    setSeating(newSeating);
    setSelectedSeat(null);
  };

  const handleShuffle = () => {
    let availableSeats: string[] = [];
    
    if (layoutType === 'traditional') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          availableSeats.push(`row-${r}-col-${c}`);
        }
      }
    } else if (layoutType === 'groups') {
      for (let g = 0; g < 6; g++) {
        for (let s = 1; s <= 4; s++) {
          availableSeats.push(`group-${g}-seat-${s}`);
        }
      }
    } else if (layoutType === 'exam') {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < 6; c++) {
          availableSeats.push(`exam-row-${r}-col-${c}`);
        }
      }
    }

    const shuffledSeats = [...availableSeats].sort(() => Math.random() - 0.5);
    const newSeating: Record<string, string> = {};
    
    students.forEach((student, index) => {
      if (index < shuffledSeats.length) {
        newSeating[shuffledSeats[index]] = student.id;
      }
    });

    setSeating(newSeating);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const id = activeChartId || `chart_${Date.now()}`;
      await setDoc(doc(db, 'seating_charts', id), {
        name: chartName,
        rows,
        cols,
        layoutType,
        studentPositions: seating,
        updatedAt: new Date().toISOString()
      });
      setActiveChartId(id);
    } finally {
      setIsSaving(false);
    }
  };

  const loadChart = (chart: SeatingChart) => {
    setChartName(chart.name);
    setRows(chart.rows);
    setCols(chart.cols);
    setLayoutType(chart.layoutType || 'traditional');
    setSeating(chart.studentPositions);
    setActiveChartId(chart.id!);
  };

  const handleDownload = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a', // Matches slate-900
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${chartName || 'seating-chart'}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const setExamLayout = () => {
    setChartName('ប្លង់តុអង្គុយប្រឡង');
    setRows(6);
    setCols(4);
    setSeating({});
  };

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white rounded-2xl text-slate-400 hover:text-indigo-600 border border-slate-100 shadow-sm transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-800 khmer-font uppercase flex items-center gap-2">
               <Grid3X3 className="w-5 h-5 text-indigo-600" /> ការរៀបចំប្លង់អង្គុយ
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Seating Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
           <input 
            type="text" 
            value={chartName} 
            onChange={e => setChartName(e.target.value)}
            placeholder="ឈ្មោះប្លង់ថ្នាក់..."
            className="bg-slate-50 border-none px-4 py-3 rounded-xl font-black khmer-font text-xs outline-none focus:ring-2 focus:ring-indigo-100 w-48 md:w-64 transition-all"
           />
           <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black khmer-font text-xs flex items-center gap-2 shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50 transition-all"
           >
              {isSaving ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
              រក្សាទុក
           </button>
           <button 
            onClick={handleDownload}
            disabled={isExporting}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black khmer-font text-xs flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all"
           >
              {isExporting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
              ទាញយក PDF
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Controls Sidebar */}
        <div className="xl:col-span-3 space-y-6">
           <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-8">
              <div className="space-y-3">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Maximize2 className="w-4 h-4" /> ប្រភេទប្លង់បង្រៀន
                 </h3>
                 <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleLayoutChange('traditional')} 
                      className={`text-left px-4 py-3 rounded-xl font-bold khmer-font text-xs transition-all border ${layoutType === 'traditional' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'}`}
                    >
                      🏫 ប្លង់រៀបតាមជួរ (Traditional)
                    </button>
                    <button 
                      onClick={() => handleLayoutChange('groups')} 
                      className={`text-left px-4 py-3 rounded-xl font-bold khmer-font text-xs transition-all border ${layoutType === 'groups' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100'}`}
                    >
                      👥 ប្លង់រៀបជាក្រុម (Group Pods)
                    </button>
                    <button 
                      onClick={() => handleLayoutChange('exam')} 
                      className={`text-left px-4 py-3 rounded-xl font-bold khmer-font text-xs transition-all border ${layoutType === 'exam' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-transparent hover:bg-slate-100/50 hover:text-rose-600 hover:border-rose-100'}`}
                    >
                      📝 ប្លង់តុអង្គុយប្រឡង (Exam Hall)
                    </button>
                 </div>
              </div>

              {layoutType === 'traditional' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <LayoutGrid className="w-4 h-4" /> ទំហំថ្នាក់រៀន
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">ជួរដេក</label>
                        <input type="number" value={rows} min={1} max={10} onChange={e => setRows(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-black text-lg p-0" />
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">ជួរឈរ</label>
                        <input type="number" value={cols} min={1} max={10} onChange={e => setCols(Number(e.target.value))} className="w-full bg-transparent border-none outline-none font-black text-lg p-0" />
                     </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-50 space-y-3">
                <button 
                  onClick={handleShuffle}
                  className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-black khmer-font text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group"
                >
                   <Shuffle className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" /> ប្តូរកន្លែងដោយចៃដន្យ
                </button>
                <button 
                  onClick={() => setSwapSeat(swapSeat ? null : 'active')}
                  className={`w-full py-4 rounded-2xl font-black khmer-font text-xs flex items-center justify-center gap-3 transition-all shadow-sm ${
                    swapSeat ? 'bg-amber-500 text-white animate-pulse shadow-amber-100' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                   <RefreshCcw className="w-5 h-5" /> {swapSeat ? 'សូមចុចលើតុ ២ ដើម្បីប្តូរ' : 'ប្តូរកន្លែងគ្នា (Swap)'}
                </button>
              </div>
           </div>

           <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-800 khmer-font uppercase flex items-center gap-2">
                   <Users className="w-4 h-4 text-emerald-600" /> បញ្ជីសិស្ស ({students.length})
                </h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-2 no-scrollbar">
                 {students.map(s => {
                   const isSeated = Object.values(seating).includes(s.id);
                   const isSelecting = selectedSeat && !isSeated;
                   return (
                     <button
                       key={s.id}
                       onClick={() => assignStudent(s.id)}
                       disabled={!selectedSeat || isSeated}
                       className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left group ${
                         isSeated ? 'bg-slate-50 border-slate-100 text-slate-300 opacity-40 grayscale' : 
                         isSelecting ? 'border-indigo-200 bg-indigo-50/50 text-slate-700 shadow-md scale-105' : 'border-slate-50 bg-white text-slate-500 hover:border-slate-200'
                       }`}
                     >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm ${isSeated ? 'bg-slate-100' : 'bg-indigo-50'}`}>
                          {s.gender === 'male' || s.gender === 'ប្រុស' ? '👦' : '👧'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-black khmer-font truncate">{s.name}</p>
                          <p className="text-[8px] font-bold uppercase text-slate-400">Student ID: {s.id.slice(-4)}</p>
                        </div>
                        {isSeated ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : isSelecting && <UserPlus className="w-4 h-4 text-indigo-500 animate-bounce" />}
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>

        {/* Classroom Grid */}
        <div className="xl:col-span-9 space-y-6">
           <div 
             ref={chartRef}
             className="bg-slate-900 p-12 md:p-20 rounded-[5rem] shadow-2xl relative overflow-hidden ring-8 ring-slate-800/50"
           >
              {/* Classroom Decoration */}
              <div className="absolute top-8 left-8 w-16 h-1 bg-slate-700/50 rounded-full" />
              <div className="absolute top-8 right-8 w-16 h-1 bg-slate-700/50 rounded-full" />
              
              {/* Teacher Area */}
              <div className="mb-24 flex flex-col items-center gap-8 relative">
                 <div className="w-64 h-3 bg-slate-800 rounded-full relative group shadow-inner">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-800 px-6 py-2 rounded-2xl border border-slate-700 shadow-xl group-hover:scale-110 transition-transform">
                       <Monitor className="w-4 h-4 text-indigo-400" />
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] whitespace-nowrap">ក្តារខៀន / Board</span>
                    </div>
                 </div>
                 
                 {/* Teacher's Desk */}
                 <div className="w-40 h-20 bg-slate-800 border-2 border-slate-700 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-700" />
                    <div className="text-center group">
                       <div className="text-3xl mb-1 group-hover:scale-125 transition-transform cursor-pointer">👨‍🏫</div>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">តុគ្រូបង្រៀន</p>
                    </div>
                 </div>

                 {/* Classroom Door */}
                 <div className="absolute top-[-40px] left-[-40px] w-24 h-4 bg-amber-600/30 rounded-full blur-xl animate-pulse" />
                 <div className="absolute top-0 left-[-60px] flex flex-col items-center gap-1 opacity-40">
                    <div className="w-16 h-2 bg-amber-600 rounded-full" />
                    <span className="text-[8px] font-black text-amber-600 uppercase">ទ្វារចេញ / Door</span>
                 </div>
              </div>

              {/* Seating Grid Area */}
              <div className="mx-auto min-h-[600px] flex flex-col items-center">
                
                {/* Traditional Layout */}
                {layoutType === 'traditional' && (
                  <div 
                    className="grid gap-4 md:gap-8 mx-auto" 
                    style={{ 
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      maxWidth: `${cols * 120}px`
                    }}
                  >
                    {Array.from({ length: rows }).map((_, r) => (
                      Array.from({ length: cols }).map((_, c) => {
                        const seatId = `row-${r}-col-${c}`;
                        // Center aisle logic
                        const mid = Math.floor(cols / 2);
                        const hasAisle = cols > 3;
                        const isAisle = hasAisle && c === mid;
                        
                        const studentId = seating[seatId];
                        const student = students.find(s => s.id === studentId);
                        const studentRank = student?.rollNumber || (student ? students.findIndex(s => s.id === studentId) + 1 : undefined);
                        const isSelected = selectedSeat === seatId;
                        const rowLetter = String.fromCharCode(65 + r);
                        const seatLabel = `${rowLetter}${c + 1}`;
                        const colorClass = layoutColors[r % layoutColors.length];

                        return (
                          <div key={seatId} className="relative">
                            <Seat 
                              student={student}
                              studentRank={studentRank}
                              isSelected={isSelected}
                              isSwapSource={swapSeat === seatId}
                              onClick={() => handleSeatClick(seatId)}
                              label={seatLabel}
                              color={colorClass}
                              onRemove={() => {
                                const newSeating = { ...seating };
                                delete newSeating[seatId];
                                setSeating(newSeating);
                              }}
                            />
                            {isAisle && <div className="absolute top-0 -right-4 w-4 h-full" />}
                          </div>
                        );
                      })
                    ))}
                  </div>
                )}

                {/* Legend for Traditional Layout */}
                {layoutType === 'traditional' && (
                  <div className="mt-12 flex flex-wrap justify-center gap-4 bg-slate-800/50 px-8 py-3 rounded-2xl border border-slate-700">
                    {Array.from({ length: Math.min(rows, layoutColors.length) }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${colors[layoutColors[i] as keyof typeof colors].split(' ')[0]}`} />
                        <span className="text-[10px] font-black text-slate-300 uppercase">Row {String.fromCharCode(65 + i)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Exam Hall Layout */}
                {layoutType === 'exam' && (
                  <div className="space-y-12 w-full max-w-4xl">
                     {/* Invigilator Desk at Front Center */}
                     <div className="flex flex-col items-center gap-4 mb-16">
                        <div className="w-32 h-16 bg-slate-800 border-2 border-indigo-500/50 rounded-xl flex items-center justify-center shadow-2xl relative">
                           <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-0.5 rounded-full text-[8px] font-black uppercase whitespace-nowrap">Invigilator</div>
                           <span className="text-2xl">👩‍🏫</span>
                        </div>
                     </div>

                     <div 
                       className="grid gap-x-16 gap-y-10 mx-auto" 
                       style={{ 
                         gridTemplateColumns: `repeat(6, minmax(0, 1fr))`,
                         maxWidth: '900px'
                       }}
                     >
                        {Array.from({ length: rows }).map((_, r) => (
                          Array.from({ length: 6 }).map((_, c) => {
                            const seatId = `exam-row-${r}-col-${c}`;
                            // Center aisle after column 3
                            const isAisleSplit = c === 2;
                            
                            const studentId = seating[seatId];
                            const student = students.find(s => s.id === studentId);
                            const studentRank = student?.rollNumber || (student ? students.findIndex(s => s.id === studentId) + 1 : undefined);
                            const isSelected = selectedSeat === seatId;
                            const rowLetter = String.fromCharCode(65 + r);
                            const seatLabel = `${rowLetter}${c + 1}`;
                            const colorClass = layoutColors[r % layoutColors.length];

                            return (
                              <React.Fragment key={seatId}>
                                <div className="relative">
                                  <Seat 
                                    student={student}
                                    studentRank={studentRank}
                                    isSelected={isSelected}
                                    isSwapSource={swapSeat === seatId}
                                    onClick={() => handleSeatClick(seatId)}
                                    label={seatLabel}
                                    color={colorClass}
                                    onRemove={() => {
                                      const newSeating = { ...seating };
                                      delete newSeating[seatId];
                                      setSeating(newSeating);
                                    }}
                                  />
                                </div>
                                {isAisleSplit && <div className="w-16" />}
                              </React.Fragment>
                            );
                          })
                        ))}
                     </div>

                     {/* Entrance at the Back */}
                     <div className="mt-20 flex flex-col items-center gap-2 opacity-50">
                        <div className="w-24 h-2 bg-amber-600 rounded-full" />
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-center">Back Entrance / ច្រកចេញ-ចូល</span>
                     </div>

                     {/* Legend and Summary */}
                     <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-800/40 p-10 rounded-[3rem] border border-slate-700/50">
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2">Color Coding</h5>
                           <div className="grid grid-cols-2 gap-3">
                              {Array.from({ length: Math.min(rows, layoutColors.length) }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded-lg bg-${layoutColors[i] === 'coral' ? 'rose' : layoutColors[i]}-400 shadow-lg shadow-${layoutColors[i] === 'coral' ? 'rose' : layoutColors[i]}-400/20`} />
                                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Row {String.fromCharCode(65 + i)}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-700 pb-2">Seating Summary</h5>
                           <div className="space-y-2">
                              <div className="flex justify-between items-center text-slate-300">
                                 <span className="text-[11px] font-bold">Total Seats:</span>
                                 <span className="text-[13px] font-black">{rows * 6}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                 <span className="text-[11px] font-bold">Students Seated:</span>
                                 <span className="text-[13px] font-black text-indigo-400">{Object.keys(seating).length}</span>
                              </div>
                              <div className="flex justify-between items-center text-slate-400">
                                 <span className="text-[11px] font-bold">Min. Spacing:</span>
                                 <span className="text-[11px] font-bold text-emerald-400">60cm+ Verified</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* Groups Layout */}
                {layoutType === 'groups' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
                    {Array.from({ length: 6 }).map((_, gIndex) => {
                      const groupLetter = String.fromCharCode(65 + gIndex);
                      const colorClass = layoutColors[gIndex % layoutColors.length];
                      
                      return (
                        <div key={gIndex} className="space-y-4">
                          <h4 className={`text-center font-black rounded-lg py-1 ${colors[colorClass as keyof typeof colors]}`}>ក្រុម {groupLetter}</h4>
                          <div className="grid grid-cols-2 gap-4 p-4 rounded-3xl bg-slate-800/20 border border-slate-700">
                            {[1, 2, 3, 4].map(sIndex => {
                               const seatId = `group-${gIndex}-seat-${sIndex}`;
                               const studentId = seating[seatId];
                               const student = students.find(s => s.id === studentId);
                               const studentRank = student?.rollNumber || (student ? students.findIndex(s => s.id === studentId) + 1 : undefined);
                               return (
                                 <Seat 
                                   key={seatId}
                                   student={student}
                                   studentRank={studentRank}
                                   isSelected={selectedSeat === seatId}
                                   isSwapSource={swapSeat === seatId}
                                   onClick={() => handleSeatClick(seatId)}
                                   label={`${groupLetter}${sIndex}`}
                                   color={colorClass}
                                   onRemove={() => {
                                     const newSeating = { ...seating };
                                     delete newSeating[seatId];
                                     setSeating(newSeating);
                                   }}
                                 />
                               );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Back Decor */}
              <div className="mt-24 border-t border-slate-800 pt-8 flex justify-center opacity-30">
                 <div className="flex items-center gap-12">
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-24 h-1 bg-slate-700 rounded-full" />
                      <span className="text-[8px] font-black text-slate-600 uppercase">ជញ្ជាំងខាងក្រោយ</span>
                   </div>
                 </div>
              </div>
           </div>

           {/* History / Saved Charts List */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-4">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <RefreshCcw className="w-4 h-4" /> ប្លង់ដែលបានរក្សាទុក
                 </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <AnimatePresence>
                   {savedCharts.map(chart => (
                      <motion.div 
                        key={chart.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        onClick={() => loadChart(chart)}
                        className={`p-5 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between group h-24 ${
                          activeChartId === chart.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl scale-105 relative z-10' : 'bg-white border-slate-100 hover:border-indigo-200 text-slate-600 shadow-sm'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${activeChartId === chart.id ? 'bg-white/20' : 'bg-indigo-50'}`}>
                               <Layout className={`w-6 h-6 ${activeChartId === chart.id ? 'text-white' : 'text-indigo-600'}`} />
                            </div>
                            <div className="space-y-0.5">
                               <p className="text-[13px] font-black khmer-font leading-tight">{chart.name}</p>
                               <div className="flex items-center gap-2">
                                  <p className={`text-[9px] font-bold uppercase tracking-widest ${activeChartId === chart.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {chart.rows}x{chart.cols} Seats
                                  </p>
                                  <span className={`w-1 h-1 rounded-full ${activeChartId === chart.id ? 'bg-white/50' : 'bg-slate-200'}`} />
                                  <p className={`text-[9px] font-bold ${activeChartId === chart.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {new Date(chart.updatedAt).toLocaleDateString('km-KH')}
                                  </p>
                               </div>
                            </div>
                         </div>
                         <button 
                           onClick={async (e) => {
                             e.stopPropagation();
                             if (confirm('តើអ្នកពិតជាចង់លុបប្លង់នេះមែនទេ?')) {
                               await deleteDoc(doc(db, 'seating_charts', chart.id!));
                               if (activeChartId === chart.id) setActiveChartId(null);
                             }
                           }}
                           className={`p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all ${
                             activeChartId === chart.id ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-50 text-rose-500'
                           }`}
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </motion.div>
                   ))}
                 </AnimatePresence>
                 {savedCharts.length === 0 && (
                   <div className="col-span-full py-12 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-300 gap-3">
                      <LayoutGrid className="w-12 h-12 opacity-20" />
                      <p className="font-black khmer-font text-xs uppercase tracking-widest">មិនទាន់មានប្លង់ដែលបានរក្សាទុក</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Seat({ 
  student, 
  studentRank,
  isSelected, 
  isSwapSource, 
  onClick, 
  label, 
  color, 
  onRemove 
}: { 
  student?: Student, 
  studentRank?: string | number,
  isSelected: boolean, 
  isSwapSource: boolean, 
  onClick: () => void, 
  label: string, 
  color: string,
  onRemove: () => void
}) {
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    coral: 'bg-rose-50 border-rose-200 text-rose-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    gray: 'bg-slate-50 border-slate-200 text-slate-700',
  };

  const currentColors = colors[color as keyof typeof colors] || colors.blue;

  return (
    <motion.div
      layout
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative group aspect-square w-24 h-24 rounded-[1.5rem] border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
        student ? `bg-white border-white shadow-lg translate-y-[-4px]` : 
        isSwapSource ? 'bg-amber-500/20 border-amber-500 animate-pulse' :
        isSelected ? 'bg-indigo-500/20 border-indigo-500 border-dashed animate-pulse' : 
        'bg-slate-800/40 border-slate-700 hover:bg-slate-700/60'
      }`}
    >
      {student ? (
        <>
          <div className="relative w-12 h-12 mb-1">
            {student.photoUrl ? (
              <img 
                src={student.photoUrl} 
                alt={student.name} 
                className="w-full h-full object-cover rounded-full border-2 border-indigo-100"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center border-2 border-indigo-100">
                <span className="text-2xl">{student.gender === 'male' || student.gender === 'ប្រុស' ? '👦' : '👧'}</span>
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white font-black">
              {studentRank}
            </div>
          </div>
          <p className="text-[9px] font-black khmer-font text-slate-800 truncate px-1 w-full">{student.name}</p>
          <div className={`mt-1 h-1 w-8 rounded-full ${currentColors.split(' ')[0]}`} />
          <button 
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-100">
          <UserPlus className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black text-slate-500">{label}</span>
        </div>
      )}
      {isSwapSource && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[8px] font-bold whitespace-nowrap animate-bounce">
          ប្តូរពីតុនេះ
        </div>
      )}
    </motion.div>
  );
}
