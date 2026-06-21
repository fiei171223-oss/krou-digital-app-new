import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { 
  ChevronLeft, 
  Calendar as CalendarIcon, 
  UserCheck, 
  UserX, 
  Clock, 
  CheckCircle2,
  HelpCircle,
  Download,
  QrCode,
  Scan
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, setDoc, doc, getDocs, where, orderBy } from 'firebase/firestore';
import { Student, AttendanceRecord } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AttendanceViewProps {
  onBack: () => void;
}

export default function AttendanceView({ onBack }: AttendanceViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<{ name: string; time: string; status: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Fetch all students
  useEffect(() => {
    const path = 'students';
    const q = query(collection(db, path), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsubscribe();
  }, []);

  // Fetch attendance for the selected date
  useEffect(() => {
    const fetchAttendance = async () => {
      const path = 'attendance';
      try {
        const q = query(
          collection(db, path), 
          where('date', '==', selectedDate)
        );
        const snapshot = await getDocs(q);
        const records: Record<string, AttendanceRecord> = {};
        snapshot.forEach(doc => {
          const data = doc.data() as AttendanceRecord;
          records[data.studentId] = { ...data, id: doc.id };
        });
        setAttendance(records);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, path);
      }
    };
    fetchAttendance();
  }, [selectedDate]);

  const handleStatusChange = async (student: Student, status: AttendanceRecord['status']) => {
    const recordId = `${selectedDate}_${student.id}`;
    const newRecord: AttendanceRecord = {
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      date: selectedDate,
      status: status,
      timestamp: Date.now()
    };

    const path = 'attendance';
    try {
      await setDoc(doc(db, path, recordId), newRecord);
      setAttendance(prev => ({ ...prev, [student.id]: newRecord }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const exportToExcel = () => {
    const data = students.map(student => {
      const record = attendance[student.id];
      const statusLabel = {
        present: 'វត្តមាន',
        absent: 'អវត្តមាន',
        late: 'យឺត',
        permission: 'ច្បាប់'
      }[record?.status || ''] || 'មិនទាន់កត់ត្រា';

      return {
        'ឈ្មោះសិស្ស': student.name,
        'ឈ្មោះឡាតាំង': student.nameLatin,
        'ភេទ': student.gender === 'male' ? 'ប្រុស' : 'ស្រី',
        'ថ្នាក់': student.grade,
        'កាលបរិច្ឆេទ': selectedDate,
        'ស្ថានភាព': statusLabel,
        'ម៉ោង': record?.timestamp ? new Date(record.timestamp).toLocaleTimeString() : '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    XLSX.writeFile(workbook, `Attendance_Report_${selectedDate}.xlsx`);
  };

  useEffect(() => {
    if (isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scannerRef.current.render(
        async (decodedText) => {
          // Find student by ID or Latin Name (encoded in QR)
          const student = students.find(s => s.id === decodedText || s.nameLatin === decodedText);
          if (student) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString();
            
            setLastScanned({
              name: student.name,
              time: timeStr,
              status: 'present'
            });

            await handleStatusChange(student, 'present');
            
            // Play a sound if possible or visual feedback
          }
        },
        (error) => {
          // Quietly ignore scan errors
        }
      );
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [isScanning, students]);

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

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={exportToExcel}
            className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold border border-emerald-100 hover:bg-emerald-100 transition-all"
          >
            <Download className="w-4 h-4" /> របាយការណ៍ Excel
          </button>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 font-kantumruy leading-relaxed mb-2">ប្រព័ន្ធស្កេន QR កត់វត្តមាន</h2>
        <p className="text-slate-500 font-medium mt-2">ស្កេនកាតសិស្សដើម្បីកត់ត្រាវត្តមានស្វ័យប្រវត្ត</p>
      </div>

      <div className="max-w-xl mx-auto space-y-8">
           <div className={`bg-slate-900 rounded-[3rem] border-[12px] border-slate-800 relative overflow-hidden shadow-2xl flex flex-col items-center justify-center gap-6 ${isScanning ? 'ring-4 ring-indigo-500' : ''}`}>
              <div id="qr-reader" className="w-full"></div>
              {!isScanning && (
                <div className="p-20 text-center space-y-6">
                   <div className="w-32 h-32 border-4 border-white/20 rounded-3xl flex items-center justify-center mx-auto">
                      <QrCode className="w-16 h-16 text-white/20" />
                   </div>
                   <button 
                     onClick={() => setIsScanning(true)} 
                     className="px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-900/40 hover:bg-indigo-500 transition-all"
                   >
                      ចាប់ផ្ដើមស្កេន
                   </button>
                </div>
              )}
              {isScanning && (
                <button 
                  onClick={() => setIsScanning(false)}
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-rose-500 text-white rounded-xl font-bold shadow-lg z-50"
                >
                  បញ្ឈប់ការស្កេន
                </button>
              )}
           </div>
           
           <AnimatePresence>
             {lastScanned && (
               <motion.div 
                 initial={{ opacity: 0, y: 20, scale: 0.9 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center gap-4"
               >
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-slate-800 khmer-font">{lastScanned.name}</h4>
                    <p className="text-slate-500 font-bold">ស្កេនជោគជ័យនៅម៉ោង {lastScanned.time}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black">វត្តមាន</span>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
           
           {!lastScanned && (
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl text-center py-12 text-slate-400 space-y-2">
                <Scan className="w-10 h-10 mx-auto opacity-20" />
                <p className="font-bold">សូមដាក់កាត QR របស់សិស្សចំកាមេរ៉ា</p>
             </div>
           )}
        </div>
    </div>
  );
}

