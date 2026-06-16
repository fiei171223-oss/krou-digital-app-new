import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  FileText, 
  FilePlus, 
  Printer, 
  Search, 
  Users, 
  GraduationCap, 
  MapPin, 
  User, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Baby,
  Download,
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { Student, Grade } from '../types';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, updateDoc, doc, orderBy, getDocs, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import CertificateGenerator from './CertificateGenerator';

interface AdministrationViewProps {
  onBack: () => void;
  students: Student[];
}

export default function AdministrationView({ onBack, students }: AdministrationViewProps) {
  const [activeTab, setActiveTab] = useState<'lists' | 'templates' | 'leave-requests'>('lists');
  const [activeList, setActiveList] = useState<'promoted' | 'poor' | 'scholarship' | 'orphan' | 'disabled' | 'honor'>('promoted');
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [honorRoll, setHonorRoll] = useState<any[]>([]);
  const [showCertificateGen, setShowCertificateGen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'leave_requests'), snap => {
      setLeaveRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const fetchHonorRoll = async () => {
      const q = query(collection(db, 'scores'), where('average', '>=', 8));
      const snap = await getDocs(q);
      setHonorRoll(snap.docs.map(doc => doc.data()));
    };
    fetchHonorRoll();

    return unsub;
  }, []);

  const stats = {
    poor: students.filter(s => s.isPoor).length,
    orphan: students.filter(s => s.isOrphan).length,
    disabled: students.filter(s => s.isDisabled).length,
    new: students.filter(s => s.isNew).length,
    leaves: leaveRequests.filter(r => r.status === 'pending').length,
    honor: honorRoll.length
  };

  const generateHonorRollPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('HONOR ROLL', 105, 30, { align: 'center' });
    doc.setFontSize(14);
    doc.text('List of High-Achieving Students', 105, 40, { align: 'center' });

    const tableData = honorRoll.map(s => [s.studentName, s.gradeValue || 'N/A', s.average.toFixed(2)]);
    
    (doc as any).autoTable({
      startY: 50,
      head: [['Student Name', 'Grade', 'Average']],
      body: tableData,
    });

    doc.save('Honor_Roll.pdf');
  };

  const generateStudentCard = (student: Student) => {
    const doc = new jsPDF();
    doc.rect(20, 20, 170, 100);
    doc.setFontSize(18);
    doc.text('STUDENT IDENTITY CARD', 105, 40, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Name: ${student.name}`, 30, 60);
    doc.text(`ID: ${student.id?.slice(0, 8)}`, 30, 70);
    doc.text(`Grade: ${student.grade}`, 30, 80);
    doc.text(`Academic Year: ${student.academicYear || '2024-2025'}`, 30, 90);
    doc.save(`Student_Card_${student.name}.pdf`);
  };

  const getFilteredList = () => {
    switch (activeList) {
      case 'poor': return students.filter(s => s.isPoor);
      case 'orphan': return students.filter(s => s.isOrphan);
      case 'disabled': return students.filter(s => s.isDisabled);
      case 'scholarship': return students.filter(s => s.stars.cleanliness + s.stars.learningActivity > 8);
      default: return students;
    }
  };

  const listData = getFilteredList();

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

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('lists')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'lists' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            បញ្ជីសិស្សតាមប្រភេទ
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'templates' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            ទម្រង់ឯកសាររដ្ឋបាល
          </button>
          <button 
            onClick={() => setActiveTab('leave-requests')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'leave-requests' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            សំណើសុំច្បាប់ ({stats.leaves})
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">រដ្ឋបាល និងឯកសារផ្លូវការឌីជីថល</h2>
        <p className="text-slate-500 font-medium khmer-font">សាលាកបត្រ លិខិតបញ្ជាក់ និងការរៀបចំបញ្ជីសិស្ស</p>
      </div>

      {activeTab === 'lists' ? (
        <div className="space-y-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <StatCard label="សិស្សក្រីក្រ" count={stats.poor} icon={<Heart className="text-rose-500" />} color="bg-rose-50" onClick={() => setActiveList('poor')} isActive={activeList === 'poor'} />
              <StatCard label="សិស្សអាហាររូបករណ៍" count={stats.new} icon={<GraduationCap className="text-indigo-500" />} color="bg-indigo-50" onClick={() => setActiveList('scholarship')} isActive={activeList === 'scholarship'} />
              <StatCard label="សិស្សកំព្រា" count={stats.orphan} icon={<Baby className="text-amber-500" />} color="bg-amber-50" onClick={() => setActiveList('orphan')} isActive={activeList === 'orphan'} />
              <StatCard label="សិស្សពិការ" count={stats.disabled} icon={<AlertTriangle className="text-slate-700" />} color="bg-slate-100" onClick={() => setActiveList('disabled')} isActive={activeList === 'disabled'} />
           </div>

           <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                    <Users className="w-6 h-6 text-indigo-600" /> 
                    {activeList === 'promoted' ? 'សិស្សឡើងថ្នាក់' : activeList === 'poor' ? 'បញ្ជីឈ្មោះសិស្សក្រីក្រ' : activeList === 'scholarship' ? 'បញ្ជីសិស្សអាហាររូបករណ៍' : activeList === 'orphan' ? 'បញ្ជីសិស្សកំព្រា' : 'បញ្ជីសិស្សពិការ'}
                 </h3>
                 <button className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black khmer-font text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                    <FileSpreadsheet className="w-4 h-4" /> ទាញយកជា Excel
                 </button>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-slate-50/50">
                       <tr className="text-left border-b border-slate-100">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះសិស្ស</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ភេទ</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ថ្នាក់ទី</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">អាសយដ្ឋាន</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">សកម្មភាព</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {listData.map(student => (
                         <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs">
                                     {student.name.charAt(0)}
                                  </div>
                                  <span className="font-black text-slate-700 khmer-font">{student.name}</span>
                               </div>
                            </td>
                            <td className="px-8 py-4 text-center">
                               <span className={`px-2 py-1 rounded-full text-[9px] font-black khmer-font ${student.gender === 'female' || student.gender === 'ស្រី' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {student.gender}
                               </span>
                            </td>
                            <td className="px-8 py-4 text-center font-black text-slate-500">ថ្នាក់ទី {student.grade}</td>
                            <td className="px-8 py-4 text-xs font-bold text-slate-400 khmer-font truncate max-w-[200px]">{student.address || '-'}</td>
                            <td className="px-8 py-4 text-right">
                               <button className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-all" title="បង្កើតឯកសារ">
                                  <FilePlus className="w-5 h-5" />
                               </button>
                            </td>
                         </tr>
                       ))}
                       {listData.length === 0 && (
                         <tr>
                            <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold khmer-font">មិនទាន់មានទិន្នន័យក្នុងបញ្ជីនេះនៅឡើយ...</td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      ) : activeTab === 'templates' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           <TemplateCard 
             title="ប័ណ្ណសរសើរឌីជីថល (Digital Certificate)" 
             description="បង្កើតប័ណ្ណសរសើរសម្រាប់សិស្សពូកែ និងសិស្សដែលមានស្នាដៃល្អ"
             icon={<Award className="w-10 h-10" />}
             color="from-amber-400 to-orange-500"
             onClick={() => setShowCertificateGen(true)}
           />
           <TemplateCard 
             title="សាលាកបត្រឯកត្តជន (Student Card Detailed)" 
             description="ទម្រង់លម្អិតអំពីប្រវត្តិរូបសិស្សសម្រាប់រក្សាទុកក្នុងបណ្ណសារសាលា"
             icon={<Users className="w-10 h-10" />}
             color="from-indigo-500 to-blue-600"
             onClick={() => {
                const s = students[0];
                if(s) generateStudentCard(s);
                else alert('មិនទាន់មានសិស្សក្នុងប្រព័ន្ធ');
             }}
           />
           <TemplateCard 
             title="តារាងកិត្តិយស (Honor Roll List)" 
             description="បញ្ជីឈ្មោះសិស្សឆ្នើមដែលមានមធ្យមភាគចាប់ពី ៨.០០ ឡើងទៅ"
             icon={<FileText className="w-10 h-10" />}
             color="from-emerald-500 to-teal-600"
             onClick={generateHonorRollPDF}
           />
           <TemplateCard 
             title="លិខិតផ្ទេរការសិក្សា (Transfer Letter)" 
             description="សម្រាប់សិស្សដែលត្រូវការផ្ទេរទៅសិក្សានៅសាលាផ្សេង"
             icon={<FileText className="w-10 h-10" />}
             color="from-rose-500 to-pink-600"
           />
           <TemplateCard 
             title="សេចក្តីជូនដំណឹង (Notice Template)" 
             description="ទម្រង់សេចក្តីជូនដំណឹងដល់មាតាបិតាសិស្សអំពីការឈប់សម្រាក ឬមហាសន្និបាត"
             icon={<CheckCircle2 className="w-10 h-10" />}
             color="from-amber-500 to-orange-600"
           />
           <TemplateCard 
             title="បញ្ជីអវត្តមានប្រចាំខែ (Absence Digest)" 
             description="របាយការណ៍បូកសរុបការអវត្តមានសិស្សប្រចាំខែសម្រាប់ផ្ញើការិយាល័យអប់រំ"
             icon={<Calendar className="w-10 h-10" />}
             color="from-slate-700 to-slate-900"
           />
        </div>
      ) : activeTab === 'leave-requests' ? (
        <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
           <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                 <Calendar className="w-6 h-6 text-indigo-600" /> សំណើសុំច្បាប់ឈប់សម្រាក
              </h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead className="bg-slate-50/50">
                    <tr className="text-left border-b border-slate-100">
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះសិស្ស</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">រយះពេល</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">មូលហេតុ</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ស្ថានភាព</th>
                       <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">សកម្មភាព</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {leaveRequests.map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/30 transition-colors">
                         <td className="px-8 py-4 font-black text-slate-700 khmer-font">{rec.studentName}</td>
                         <td className="px-8 py-4 text-center text-xs font-bold text-slate-500">{rec.startDate} → {rec.endDate}</td>
                         <td className="px-8 py-4 text-xs font-medium text-slate-400 khmer-font">{rec.reason}</td>
                         <td className="px-8 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black khmer-font ${rec.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                               {rec.status === 'pending' ? 'រង់ចាំពិនិត្យ' : 'បានអនុញ្ញាត'}
                            </span>
                         </td>
                         <td className="px-8 py-4 text-right">
                            {rec.status === 'pending' && (
                              <button 
                                onClick={async () => { await updateDoc(doc(db, 'leave_requests', rec.id!), { status: 'approved' }) }}
                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg font-black khmer-font text-[10px] shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                              >
                                 អនុញ្ញាត
                              </button>
                            )}
                         </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      ) : null}

      <AnimatePresence>
        {showCertificateGen && (
          <CertificateGenerator 
            students={students}
            onClose={() => setShowCertificateGen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, count, icon, color, onClick, isActive }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`p-6 rounded-[2.5rem] border-2 cursor-pointer transition-all ${isActive ? 'border-indigo-600 shadow-xl' : 'border-transparent bg-white shadow-sm'}`}
    >
       <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${color}`}>
             {icon}
          </div>
          <span className="text-3xl font-black text-slate-800">{count}</span>
       </div>
       <p className="text-xs font-black text-slate-500 khmer-font uppercase tracking-widest">{label}</p>
    </motion.div>
  );
}

function TemplateCard({ title, description, icon, color, onClick }: any) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={onClick}
      className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 flex flex-col items-center text-center gap-6 group hover:shadow-2xl transition-all cursor-pointer"
    >
       <div className={`w-20 h-20 bg-gradient-to-br ${color} rounded-[2rem] flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
          {icon}
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-black text-slate-800 khmer-font leading-tight">{title}</h4>
          <p className="text-xs text-slate-400 khmer-font font-bold leading-relaxed">{description}</p>
       </div>
       <button className="mt-4 w-full bg-slate-50 text-slate-600 py-3 rounded-2xl font-black khmer-font text-xs flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white transition-all">
          <Printer className="w-4 h-4" /> បង្កើតឯកសារ (Generate Deck)
       </button>
    </motion.div>
  );
}
