import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  Calendar, 
  BookOpen, 
  Search,
  Filter,
  Trash2,
  Clock,
  User,
  MessageSquare,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy, where, Timestamp } from 'firebase/firestore';
import { DailyLog, Student } from '../types';

interface DailyLogViewProps {
  onBack: () => void;
}

export default function DailyLogView({ onBack }: DailyLogViewProps) {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  
  const [newLog, setNewLog] = useState({
    studentId: '',
    date: new Date().toISOString().split('T')[0],
    learningActivity: '',
    groupWork: '',
    homeworkStatus: 'not_assigned' as any,
    behaviorNote: '',
    parentSignature: false
  });

  useEffect(() => {
    // Fetch logs
    const qLogs = query(collection(db, 'daily_logs'), orderBy('date', 'desc'));
    const unsubscribeLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyLog[]);
    });

    // Fetch students for dropdown
    const qStudents = query(collection(db, 'students'), orderBy('name', 'asc'));
    const unsubscribeStudents = onSnapshot(qStudents, (snapshot) => {
      setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeStudents();
    };
  }, []);

  const handleAddLog = async () => {
    if (!newLog.studentId || !newLog.date) return;
    try {
      await addDoc(collection(db, 'dailyLogs'), {
        ...newLog,
        updatedAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewLog({
        ...newLog,
        learningActivity: '',
        groupWork: '',
        behaviorNote: ''
      });
    } catch (error) {
      console.error("Error adding log:", error);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបកំណត់ត្រានេះ?')) {
      await deleteDoc(doc(db, 'dailyLogs', id));
    }
  };

  const filteredLogs = logs.filter(log => {
    const student = students.find(s => s.id === log.studentId);
    const matchesSearch = student?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.learningActivity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStudent === 'all' || log.studentId === filterStudent;
    return matchesSearch && matchesFilter;
  });

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'មិនស្គាល់';

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

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកក្នុងកំណត់ត្រា..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 font-bold khmer-font"
          >
            <Plus className="w-5 h-5" />
            កត់ត្រាថ្មី
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">សៀវភៅតាមដានការរៀនសូត្រប្រចាំថ្ងៃ</h2>
        <p className="text-slate-500 font-medium khmer-font">កត់ត្រាសកម្មភាពសិក្សា និងការងាររបស់សិស្សសម្រាប់ទំនាក់ទំនងជាមួយមាតាបិតា</p>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
        {filteredLogs.length > 0 ? (
          filteredLogs.map(log => (
            <motion.div 
              layout
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:border-indigo-100 transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-48 flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <User className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 khmer-font text-center">{getStudentName(log.studentId)}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                    <Calendar className="w-3 h-3" />
                    {log.date}
                  </div>
                </div>

                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider khmer-font flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        សកម្មភាពរៀន
                      </h5>
                      <p className="text-slate-700 font-medium leading-relaxed khmer-font bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {log.learningActivity || 'មិនមានទិន្នន័យ'}
                      </p>
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider khmer-font flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-emerald-500" />
                        ការងារក្រុម
                      </h5>
                      <p className="text-slate-700 font-medium khmer-font bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        {log.groupWork || 'មិនមានទិន្នន័យ'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider khmer-font flex items-center gap-2">
                        <FileText className="w-4 h-4 text-amber-500" />
                        កិច្ចការផ្ទះ
                      </h5>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase khmer-font ${
                        log.homeworkStatus === 'completed' ? 'bg-emerald-100 text-emerald-700' : 
                        log.homeworkStatus === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {log.homeworkStatus === 'completed' ? 'រួចរាល់' : 
                         log.homeworkStatus === 'pending' ? 'មិនទាន់រួចរាល់' : 'គ្មានកិច្ចការ'}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider khmer-font flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-rose-500" />
                        ការកត់សម្គាល់អាកប្បកិរិយា
                      </h5>
                      <p className="text-slate-700 font-medium khmer-font bg-rose-50/30 p-3 rounded-xl border border-rose-100/50 italic text-sm">
                        {log.behaviorNote || 'គ្មាន'}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        {log.parentSignature ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold khmer-font">
                            <CheckCircle2 className="w-4 h-4" />
                            មាតាបិតាបានចុះហត្ថលេខា
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold khmer-font">
                            <AlertCircle className="w-4 h-4" />
                            មិនទាន់ចុះហត្ថលេខា
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={() => handleDeleteLog(log.id!)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold khmer-font">មិនទាន់មានកំណត់ត្រាសម្រាប់បង្ហាញនៅឡើយ</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
              <Plus className="w-6 h-6 rotate-45 text-slate-400" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 khmer-font mb-8">កត់ត្រាសកម្មភាពប្រចាំថ្ងៃ</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ជ្រើសរើសសិស្ស</label>
                  <select 
                    value={newLog.studentId}
                    onChange={(e) => setNewLog({...newLog, studentId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  >
                    <option value="">-- រើសសិស្ស --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (ថ្នាក់ទី{s.grade})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">កាលបរិច្ឆេទ</label>
                  <input 
                    type="date"
                    value={newLog.date}
                    onChange={(e) => setNewLog({...newLog, date: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">សកម្មភាពរៀនក្នុងថ្នាក់</label>
                  <textarea 
                    value={newLog.learningActivity}
                    onChange={(e) => setNewLog({...newLog, learningActivity: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                    placeholder="បញ្ជាក់ពីមេរៀនដែលបានរៀន..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">សកម្មភាពក្រុម/ការងាររួម</label>
                  <textarea 
                    value={newLog.groupWork}
                    onChange={(e) => setNewLog({...newLog, groupWork: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ស្ថានភាពកិច្ចការផ្ទះ</label>
                  <select 
                    value={newLog.homeworkStatus}
                    onChange={(e) => setNewLog({...newLog, homeworkStatus: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  >
                    <option value="not_assigned">គ្មានកិច្ចការ</option>
                    <option value="pending">មិនទាន់រួចរាល់</option>
                    <option value="completed">រួចរាល់</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ការកត់សម្គាល់បន្ថែម</label>
                  <textarea 
                    value={newLog.behaviorNote}
                    onChange={(e) => setNewLog({...newLog, behaviorNote: e.target.value})}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                    placeholder="អាកប្បកិរិយា ឬចំណុចខ្វះខាត..."
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleAddLog}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font text-lg hover:bg-indigo-700 transition-all mt-8 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
            >
              <Save className="w-6 h-6" />
              រក្សាទុកកំណត់ត្រា
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
