import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Box, 
  BookOpen, 
  ClipboardCheck, 
  BarChart3, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  FileText,
  Shapes,
  Calculator,
  Hash,
  Star,
  Users,
  Search,
  AlertCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { Student, MathMaterial, MathAssessment } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface EarlyGradeMathViewProps {
  onBack: () => void;
  students: Student[];
}

export default function EarlyGradeMathView({ onBack, students }: EarlyGradeMathViewProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'activities' | 'assessment' | 'reports'>('inventory');
  const [materials, setMaterials] = useState<MathMaterial[]>([]);
  const [assessments, setAssessments] = useState<MathAssessment[]>([]);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddAssessment, setShowAddAssessment] = useState(false);

  // Form states
  const [newMaterial, setNewMaterial] = useState({ name: '', total: 0, status: 'good' as any, category: 'សម្ភារៈជាក់ស្តែង' });
  const [newAssessment, setNewAssessment] = useState<Partial<MathAssessment>>({
    studentId: '',
    numberRecognition: 0,
    calculation: 0,
    placeValue: 0,
    wordProblem: 0,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsubMaterials = onSnapshot(collection(db, 'math_materials'), (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MathMaterial[]);
    });
    const unsubAssessments = onSnapshot(query(collection(db, 'math_assessments'), orderBy('date', 'desc')), (snap) => {
      setAssessments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MathAssessment[]);
    });
    return () => {
      unsubMaterials();
      unsubAssessments();
    };
  }, []);

  const handleAddMaterial = async () => {
    if (!newMaterial.name) return;
    await addDoc(collection(db, 'math_materials'), newMaterial);
    setNewMaterial({ name: '', total: 0, status: 'good', category: 'សម្ភារៈជាក់ស្តែង' });
    setShowAddMaterial(false);
  };

  const handleAddAssessment = async () => {
    if (!newAssessment.studentId) return;
    const student = students.find(s => s.id === newAssessment.studentId);
    
    // Simple logic for level
    const avg = ((newAssessment.numberRecognition || 0) + (newAssessment.calculation || 0) + (newAssessment.placeValue || 0) + (newAssessment.wordProblem || 0)) / 4;
    const level = avg >= 8 ? 'high' : avg >= 5 ? 'medium' : 'low';

    await addDoc(collection(db, 'math_assessments'), {
      ...newAssessment,
      studentName: student?.name || '',
      level
    });
    setShowAddAssessment(false);
  };

  const COLORS = ['#ef4444', '#f59e0b', '#10b981']; // low, medium, high

  const getReportData = () => {
    const counts = { low: 0, medium: 0, high: 0 };
    // Get only latest assessment for each student
    const latestAssessments: Record<string, MathAssessment> = {};
    assessments.forEach(a => {
      if (!latestAssessments[a.studentId]) latestAssessments[a.studentId] = a;
    });

    Object.values(latestAssessments).forEach(a => {
      counts[a.level]++;
    });

    return [
      { name: 'មិនទាន់យល់', value: counts.low, khmerValue: 'កម្រិតទាប' },
      { name: 'យល់ខ្លះ', value: counts.medium, khmerValue: 'កម្រិតមធ្យម' },
      { name: 'យល់ច្បាស់', value: counts.high, khmerValue: 'កម្រិតខ្ពស់' }
    ];
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

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} label="គ្រប់គ្រងសម្ភារៈ" icon={<Box className="w-4 h-4" />} />
          <TabButton active={activeTab === 'activities'} onClick={() => setActiveTab('activities')} label="ផែនការសកម្មភាព" icon={<BookOpen className="w-4 h-4" />} />
          <TabButton active={activeTab === 'assessment'} onClick={() => setActiveTab('assessment')} label="វាយតម្លៃសិស្ស" icon={<ClipboardCheck className="w-4 h-4" />} />
          <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} label="របាយការណ៍" icon={<BarChart3 className="w-4 h-4" />} />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">កញ្ចប់សម្ភារៈគណិតវិទ្យាថ្នាក់ដំបូង</h2>
        <p className="text-slate-500 font-medium khmer-font">ឧបករណ៍ជំនួយការបង្រៀន វាយតម្លៃ និងតាមដានវឌ្ឍនភាព</p>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'inventory' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800 khmer-font uppercase flex items-center gap-2">
                  <Shapes className="text-indigo-600" /> បញ្ជីសម្ភារៈជាក់ស្តែង
               </h3>
               <button 
                onClick={() => setShowAddMaterial(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black khmer-font text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
               >
                  <Plus className="w-4 h-4" /> បន្ថែមសម្ភារៈ
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materials.map(item => (
                <div key={item.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex items-start gap-4 hover:shadow-2xl transition-all group">
                   <div className={`p-4 rounded-2xl ${item.status === 'good' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                      <Box className="w-8 h-8" />
                   </div>
                   <div className="flex-1 space-y-1">
                      <h4 className="font-black text-slate-700 khmer-font">{item.name}</h4>
                      <p className="text-xs font-bold text-slate-400 khmer-font">ចំនួនសរុប: {item.total}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black khmer-font ${
                        item.status === 'good' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                      }`}>
                         {item.status === 'good' ? 'ស្ថានភាពល្អ' : item.status === 'damaged' ? 'ខូចខាត' : 'បាត់បង់'}
                      </span>
                   </div>
                   <button 
                    onClick={async () => { await deleteDoc(doc(db, 'math_materials', item.id!)) }}
                    className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                   >
                      <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 khmer-font font-bold uppercase tracking-widest">មិនទាន់មានសម្ភារៈក្នុងបញ្ជីនៅឡើយ</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'activities' && (
          <motion.div 
            key="activities"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
             <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                   <BookOpen className="text-indigo-600" /> ធនធានបង្រៀន PDF
                </h3>
                <div className="space-y-4">
                   <ResourceItem title="សៀវភៅណែនាំគ្រូ គណិតវិទ្យាថ្នាក់ទី១" type="pdf" />
                   <ResourceItem title="សៀវភៅជំនួយសិស្ស ភាគ១" type="pdf" />
                   <ResourceItem title="កម្រងរូបភាពសម្រាប់គណិតវិទ្យា" type="pdf" />
                </div>
             </div>

             <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                   <CheckCircle2 className="text-emerald-600" /> លំហូរបង្រៀនជំហានទាំង ៣
                </h3>
                <div className="space-y-4">
                   <StepItem number={1} title="សម្ភារៈជាក់ស្តែង (Concrete)" desc="ប្រើប្រាស់បេីកង បំពង់បឺត ឬគ្រាប់គ្រួសសម្រាប់រាប់" active={true} />
                   <StepItem number={2} title="រូបភាព (Pictorial)" desc="ប្រើរូបភាពតំណាងឱ្យចំនួន ឬទំហំ" active={false} />
                   <StepItem number={3} title="និមិត្តសញ្ញា (Abstract)" desc="ប្រើតួលេខ និងសញ្ញាគណិតវិទ្យា" active={false} />
                </div>
             </div>
          </motion.div>
        )}

        {activeTab === 'assessment' && (
          <motion.div 
            key="assessment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
               <h3 className="text-xl font-black text-slate-800 khmer-font uppercase flex items-center gap-2">
                  <Calculator className="text-indigo-600" /> វាយតម្លៃសមត្ថភាពសិស្ស
               </h3>
               <button 
                onClick={() => setShowAddAssessment(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-black khmer-font text-sm flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
               >
                  <Plus className="w-4 h-4" /> បញ្ចូលពិន្ទុតេស្ត
               </button>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="bg-slate-50">
                        <tr className="text-left border-b border-slate-100">
                           <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះសិស្ស</th>
                           <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ស្គាល់លេខ</th>
                           <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">គណនា</th>
                           <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">តម្លៃខ្ទង់</th>
                           <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ចំណោទ</th>
                           <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">កម្រិត</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {assessments.map(rec => (
                          <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                             <td className="px-8 py-4 font-black text-slate-700 khmer-font">{rec.studentName}</td>
                             <td className="px-4 py-4 text-center font-black text-slate-600">{rec.numberRecognition}/10</td>
                             <td className="px-4 py-4 text-center font-black text-slate-600">{rec.calculation}/10</td>
                             <td className="px-4 py-4 text-center font-black text-slate-600">{rec.placeValue}/10</td>
                             <td className="px-4 py-4 text-center font-black text-slate-600">{rec.wordProblem}/10</td>
                             <td className="px-8 py-4 text-right">
                                <span className={`px-2 py-1 rounded-full text-[9px] font-black khmer-font ${
                                  rec.level === 'high' ? 'bg-emerald-100 text-emerald-600' : 
                                  rec.level === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                                }`}>
                                   {rec.level === 'high' ? 'ខ្ពស់' : rec.level === 'medium' ? 'មធ្យម' : 'ទាប'}
                                </span>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div 
            key="reports"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
             <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6">
                <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                   <BarChart3 className="text-indigo-600" /> កម្រិតយល់ដឹងសរុបក្នុងថ្នាក់
                </h3>
                <div className="h-64 mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getReportData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 900, fill: '#64748b' }} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 900 }}
                      />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {getReportData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-black text-slate-400">ទាប</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-[10px] font-black text-slate-400">មធ្យម</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-slate-400">ខ្ពស់</span>
                  </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center justify-center text-center gap-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600">
                   <Users className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-slate-800 khmer-font">បែងចែកក្រុមជំនួយ</h3>
                   <p className="text-sm text-slate-400 khmer-font font-medium max-w-xs">ប្រើទិន្នន័យដើម្បីបែងចែកក្រុមសិស្សដែលត្រូវការជំនួយបន្ថែមជាមួយសម្ភារៈបេីកង</p>
                </div>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black khmer-font shadow-lg hover:bg-indigo-700 transition-all">
                   បង្កើតក្រុមចៃដន្យតាមកម្រិត
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
         {showAddMaterial && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddMaterial(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl relative z-10 p-8 space-y-6">
                 <h3 className="text-xl font-black text-slate-800 khmer-font">បន្ថែមសម្ភារៈថ្មី</h3>
                 <div className="space-y-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase">Name</label>
                       <input type="text" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-black text-sm" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest uppercase">Total Count</label>
                       <input type="number" value={newMaterial.total} onChange={e => setNewMaterial({...newMaterial, total: Number(e.target.value)})} className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-600 transition-all font-black text-sm" />
                    </div>
                 </div>
                 <button onClick={handleAddMaterial} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font shadow-lg">រក្សាទុក</button>
              </motion.div>
           </div>
         )}

         {showAddAssessment && (
           <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddAssessment(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative z-10 p-8 space-y-8">
                 <h3 className="text-2xl font-black text-slate-800 khmer-font">កត់ត្រាពិន្ទុតេស្តរហ័ស</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-full">
                       <label className="text-[10px] font-black text-slate-400 uppercase">Student</label>
                       <select value={newAssessment.studentId} onChange={e => setNewAssessment({...newAssessment, studentId: e.target.value})} className="w-full p-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-black text-sm">
                          <option value="">-- បញ្ជីឈ្មោះសិស្ស --</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                       </select>
                    </div>
                    <AssessmentInput label="ស្គាល់លេខ (0-10)" value={newAssessment.numberRecognition} onChange={val => setNewAssessment({...newAssessment, numberRecognition: val})} />
                    <AssessmentInput label="ការគណនា (0-10)" value={newAssessment.calculation} onChange={val => setNewAssessment({...newAssessment, calculation: val})} />
                    <AssessmentInput label="តម្លៃខ្ទង់ (0-10)" value={newAssessment.placeValue} onChange={val => setNewAssessment({...newAssessment, placeValue: val})} />
                    <AssessmentInput label="ការដោះស្រាយចំណោទ (0-10)" value={newAssessment.wordProblem} onChange={val => setNewAssessment({...newAssessment, wordProblem: val})} />
                 </div>
                 <button onClick={handleAddAssessment} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font shadow-lg">រក្សាទុកពិន្ទុ</button>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function TabButton({ active, onClick, label, icon }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-xl font-black khmer-font text-xs flex items-center gap-2 transition-all whitespace-nowrap ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}
    >
      {icon} {label}
    </button>
  );
}

function ResourceItem({ title, type }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-200 transition-all">
       <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-black text-slate-600 khmer-font">{title}</span>
       </div>
       <button className="p-2 text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
          <BarChart3 className="w-4 h-4" />
       </button>
    </div>
  );
}

function StepItem({ number, title, desc, active }: any) {
  return (
    <div className={`p-4 rounded-2xl border-2 transition-all ${active ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
       <div className="flex items-center gap-3 mb-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
             {number}
          </div>
          <h4 className={`font-black khmer-font ${active ? 'text-emerald-700' : 'text-slate-400'}`}>{title}</h4>
       </div>
       <p className={`text-xs khmer-font font-medium ${active ? 'text-emerald-600' : 'text-slate-300'}`}>{desc}</p>
    </div>
  );
}

function AssessmentInput({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
       <label className="text-[10px] font-black text-slate-400 uppercase">{label}</label>
       <input 
        type="number" 
        min="0" 
        max="10" 
        value={value} 
        onChange={e => onChange(Number(e.target.value))} 
        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-600 outline-none rounded-2xl font-black text-lg transition-all" 
       />
    </div>
  );
}
