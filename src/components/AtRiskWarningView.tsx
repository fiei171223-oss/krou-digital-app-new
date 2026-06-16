import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  AlertTriangle, 
  TrendingDown, 
  UserX, 
  Search,
  CheckCircle,
  FileText,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, where, limit } from 'firebase/firestore';
import { Student, AttendanceRecord, ScoreRecord, DailyLog } from '../types';

interface AtRiskWarningViewProps {
  onBack: () => void;
}

export default function AtRiskWarningView({ onBack }: AtRiskWarningViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    // For large datasets, we would filter by date, but for this demo/app we load recent ones
    const unsubAttendance = onSnapshot(query(collection(db, 'attendance'), orderBy('date', 'desc'), limit(500)), snap => {
      setAttendance(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[]);
    });
    const unsubScores = onSnapshot(query(collection(db, 'scores'), orderBy('createdAt', 'desc')), snap => {
      setScores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScoreRecord[]);
    });
    const unsubLogs = onSnapshot(query(collection(db, 'daily_logs'), orderBy('date', 'desc'), limit(200)), snap => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyLog[]);
    });

    return () => { unsubStudents(); unsubAttendance(); unsubScores(); unsubLogs(); };
  }, []);

  const atRiskStudents = useMemo(() => {
    return students.map(student => {
      const issues: string[] = [];
      let severity: 'high' | 'medium' | 'low' = 'low';

      // 1. Absence Check (3+ consecutive absences)
      const studentAttendance = attendance
        .filter(a => a.studentId === student.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      let consecutiveAbsences = 0;
      for (const record of studentAttendance) {
        if (record.status === 'absent') {
          consecutiveAbsences++;
          if (consecutiveAbsences >= 3) break;
        } else {
          break; // Stop checking if we hit a non-absent day
        }
      }
      if (consecutiveAbsences >= 3) {
        issues.push(`អវត្តមានជាប់ៗគ្នា ${consecutiveAbsences} ថ្ងៃ (គ្មានច្បាប់)`);
        severity = 'high';
      }

      // 2. Score Drop Check (Compare last 2 scores)
      const studentScores = scores
        .filter(s => s.studentId === student.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      if (studentScores.length >= 2) {
        const latest = studentScores[0].average || 0;
        const previous = studentScores[1].average || 0;
        if (previous > 0 && (previous - latest) / previous > 0.2) {
          issues.push(`ពិន្ទុធ្លាក់ចុះខ្លាំងពី ${previous.toFixed(1)} មក ${latest.toFixed(1)} (-${Math.round((previous - latest) / previous * 100)}%)`);
          if (severity !== 'high') severity = 'medium';
        }
      }

      // 3. Behavioral Check (Negative notes in logs)
      const studentLogs = logs.filter(l => l.studentId === student.id);
      const negativeLogs = studentLogs.filter(l => 
        l.behaviorNote?.toLowerCase().includes('ខ្សោយ') || 
        l.behaviorNote?.toLowerCase().includes('មិន') ||
        l.behaviorNote?.toLowerCase().includes('រំខាន')
      );
      if (negativeLogs.length >= 2) {
        issues.push(`មានកំណត់ត្រាអវិជ្ជមានផ្នែកអាកប្បកិរិយា ${negativeLogs.length} ដង`);
        if (severity !== 'high') severity = 'medium';
      }

      return { student, issues, severity };
    }).filter(item => item.issues.length > 0);
  }, [students, attendance, scores, logs]);

  const filteredAtRisk = atRiskStudents.filter(item => 
    item.student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="ស្វែងរកឈ្មោះសិស្ស..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">ប្រព័ន្ធផ្ដល់សញ្ញាគ្រោះថ្នាក់ជាមុន (Early Warning System)</h2>
        <p className="text-slate-500 font-medium khmer-font">វិភាគដោយស្វ័យប្រវត្តិនូវហានិភ័យនៃការបោះបង់ការសិក្សារបស់សិស្ស</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-800 khmer-font flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" /> របៀបដែលប្រព័ន្ធគណនាហានិភ័យ (Algorithm Logic)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-rose-600 khmer-font mb-2">១. ការអវត្តមាន</h4>
            <p className="text-xs text-slate-500 khmer-font leading-relaxed">ប្រសិនបើសិស្សម្នាក់មានអវត្តមានជាប់ៗគ្នាលើសពី ៣ ថ្ងៃ (ដោយគ្មានច្បាប់) ប្រព័ន្ធនឹងចាត់ទុកជាហានិភ័យខ្ពស់។</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-amber-600 khmer-font mb-2">២. លទ្ធផលសិក្សា</h4>
            <p className="text-xs text-slate-500 khmer-font leading-relaxed">ប្រសិនបើសិស្សម្នាក់មានពិន្ទុធ្លាក់ចុះលើសពី ២០% បើធៀបនឹងខែមុន (ក្នុងរយៈពេល ២ ខែចុងក្រោយ)។</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-indigo-600 khmer-font mb-2">៣. អាកប្បកិរិយា</h4>
            <p className="text-xs text-slate-500 khmer-font leading-relaxed">ប្រសិនបើមានកំណត់ត្រាអវិជ្ជមានផ្នែកសីលធម៌ ឬការសិក្សាលើសពី ២ ដង ក្នុងសៀវភៅតាមដានប្រចាំថ្ងៃ។</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-3 bg-rose-500 rounded-2xl text-white">
            <UserX className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-rose-600 khmer-font">សិស្សមានហានិភ័យខ្ពស់</p>
            <p className="text-3xl font-black text-rose-700">{atRiskStudents.filter(s => s.severity === 'high').length}</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-3 bg-amber-500 rounded-2xl text-white">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-600 khmer-font">សិស្សមានហានិភ័យមធ្យម</p>
            <p className="text-3xl font-black text-amber-700">{atRiskStudents.filter(s => s.severity === 'medium').length}</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center gap-4">
          <div className="p-3 bg-emerald-500 rounded-2xl text-white">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-600 khmer-font">សិស្សមានសុវត្ថិភាព</p>
            <p className="text-3xl font-black text-emerald-700">{students.length - atRiskStudents.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> បញ្ជីសិស្សដែលត្រូវយកចិត្តទុកដាក់ខ្ពស់
          </h3>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredAtRisk.length > 0 ? filteredAtRisk.map((item, idx) => (
            <motion.div 
              key={item.student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    {item.student.photoUrl ? (
                      <img src={item.student.photoUrl} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${item.student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                        {item.student.name.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg ${item.severity === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}>
                      <AlertTriangle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-800 khmer-font leading-none mb-1">{item.student.name}</h4>
                    <p className="text-sm text-slate-500 khmer-font font-medium">ថ្នាក់ទី {item.student.grade} • {item.student.gender === 'male' ? 'ប្រុស' : 'ស្រី'}</p>
                  </div>
                </div>

                <div className="flex-grow max-w-xl">
                   <div className="space-y-2">
                      {item.issues.map((issue, i) => (
                        <div key={i} className="flex gap-2 items-center text-sm font-bold text-rose-600 bg-rose-50 px-4 py-2 rounded-xl">
                          <TrendingDown className="w-4 h-4 flex-shrink-0" />
                          <span className="khmer-font">{issue}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex gap-3">
                   <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-black khmer-font text-sm hover:bg-indigo-700 transition-all flex items-center gap-2">
                       <Clock className="w-4 h-4" /> ណាត់ជួបមាតាបិតា
                   </button>
                   <button className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors">
                       <ArrowRight className="w-6 h-6" />
                   </button>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-32 space-y-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-700 khmer-font">សិស្សទាំងអស់មានសុវត្ថិភាព!</p>
                <p className="text-slate-400 khmer-font">មិនមានសិស្សដែលមានសញ្ញាហានិភ័យនៅពេលនេះទេ</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
