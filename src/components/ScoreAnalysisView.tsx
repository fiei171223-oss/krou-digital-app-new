import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  ChevronLeft, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  Users, 
  Award, 
  Search,
  Filter,
  Plus,
  Save,
  Trash2,
  BookOpen,
  PlusCircle,
  Trophy,
  Calculator,
  AlertTriangle,
  Lightbulb,
  ArrowDown
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Student, Grade, ScoreRecord } from '../types';
import GradeReportMoEYS from './GradeReportMoEYS';

interface ScoreAnalysisViewProps {
  onBack: () => void;
}

const KHMER_GRADES = [
  { label: 'ល្អប្រសើរ (A)', range: [9, 10], color: '#10b981' },
  { label: 'ល្អ (B)', range: [8, 8.99], color: '#3b82f6' },
  { label: 'ល្អបង្គួរ (C)', range: [7, 7.99], color: '#6366f1' },
  { label: 'មធ្យម (D)', range: [5, 6.99], color: '#f59e0b' },
  { label: 'ខ្សោយ (E/F)', range: [0, 4.99], color: '#ef4444' },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ScoreAnalysisView({ onBack }: ScoreAnalysisViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('មេសា');
  const [selectedGrade, setSelectedGrade] = useState<Grade>(1);
  const [showAddScore, setShowAddScore] = useState(false);
  const [activeTab, setActiveTab] = useState<'monthly' | 'semester' | 'yearly'>('monthly');
  const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1);
  const [activeReport, setActiveReport] = useState<'monthly' | 'semester1' | 'semester2' | 'annual' | null>(null);

  const classInfo = {
    schoolName: 'សាលាបឋមសិក្សាជ័យជំន្នះ',
    grade: `ថ្នាក់ទី ${selectedGrade}`,
    academicYear: '២០២៣-២០២៤',
    teacherName: 'លោកគ្រូ សុខ ជា'
  };

  if (activeReport) {
    return (
      <GradeReportMoEYS 
        students={students.filter(s => s.grade === selectedGrade)}
        scores={scores.filter(s => s.gradeValue === selectedGrade)}
        classInfo={classInfo}
        reportType={activeReport}
        month={selectedMonth}
        onBack={() => setActiveReport(null)}
      />
    );
  }

  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'students'), orderBy('name', 'asc')), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    const unsubScores = onSnapshot(query(collection(db, 'scores'), orderBy('createdAt', 'desc')), snap => {
      setScores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScoreRecord[]);
    });
    return () => { unsubStudents(); unsubScores(); };
  }, []);

  const calculateRanking = (list: any[]) => {
    return [...list].sort((a, b) => (b.average || 0) - (a.average || 0))
      .map((item, idx) => ({ ...item, rank: (item.average || 0) > 0 ? idx + 1 : '-' }));
  };

  const monthlyScoresWithRank = useMemo(() => {
    // Sync all students for the grade automatically
    const gradeStudents = students.filter(s => s.grade === selectedGrade);
    const list = gradeStudents.map(student => {
      const score = scores.find(s => s.studentId === student.id && s.month === selectedMonth && s.gradeValue === selectedGrade && s.category === 'monthly');
      return {
        id: student.id,
        rollNumber: student.rollNumber,
        studentName: student.name,
        gender: student.gender,
        average: score?.average || 0,
        total: score?.total || 0,
        gradeLatin: score?.gradeLatin || 'F',
        gradeKhmer: score?.gradeKhmer || 'ខ្សោយ',
        isFilled: !!score
      };
    });
    return calculateRanking(list);
  }, [students, scores, selectedMonth, selectedGrade]);

  const semesterScores = useMemo(() => {
    const s1Months = ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];
    const s2Months = ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'];
    const targetMonths = selectedSemester === 1 ? s1Months : s2Months;

    const studentSummary = students.filter(s => s.grade === selectedGrade).map(student => {
      const sScores = scores.filter(s => s.studentId === student.id && targetMonths.includes(s.month));
      const avg = sScores.length === 0 ? 0 : sScores.reduce((acc, curr) => acc + (curr.average || 0), 0) / sScores.length;
      const total = sScores.length === 0 ? 0 : sScores.reduce((acc, curr) => acc + (curr.total || 0), 0) / sScores.length;
      
      const { latin, khmer } = calculateGrades(avg);
      return { 
        id: student.id, 
        rollNumber: student.rollNumber,
        studentName: student.name, 
        gender: student.gender,
        average: avg, 
        total,
        gradeLatin: latin,
        gradeKhmer: khmer
      };
    });

    return calculateRanking(studentSummary);
  }, [students, scores, selectedSemester, selectedGrade]);

  const yearlyScores = useMemo(() => {
    const studentSummary = students.filter(s => s.grade === selectedGrade).map(student => {
      const sScores = scores.filter(s => s.studentId === student.id);
      const avg = sScores.length === 0 ? 0 : sScores.reduce((acc, curr) => acc + (curr.average || 0), 0) / sScores.length;
      const total = sScores.length === 0 ? 0 : sScores.reduce((acc, curr) => acc + (curr.total || 0), 0) / sScores.length;
      
      const { latin, khmer } = calculateGrades(avg);
      return { 
        id: student.id, 
        rollNumber: student.rollNumber,
        studentName: student.name, 
        gender: student.gender,
        average: avg, 
        total,
        gradeLatin: latin,
        gradeKhmer: khmer
      };
    });

    return calculateRanking(studentSummary);
  }, [students, scores, selectedGrade]);

  const displayScores = activeTab === 'monthly' ? monthlyScoresWithRank : activeTab === 'semester' ? semesterScores : yearlyScores;

  const calculateGrades = (avg: number) => {
    if (avg >= 9) return { latin: 'A', khmer: 'ល្អប្រសើរ' };
    if (avg >= 8) return { latin: 'B', khmer: 'ល្អ' };
    if (avg >= 7) return { latin: 'C', khmer: 'ល្អបង្គួរ' };
    if (avg >= 5) return { latin: 'D', khmer: 'មធ្យម' };
    return { latin: 'F', khmer: 'ខ្សោយ' };
  };

  const handleAddScore = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const math = {
      numbers: Number(formData.get('math_numbers')),
      operations: Number(formData.get('math_operations')),
      geometry: Number(formData.get('math_geometry')),
      algebra: Number(formData.get('math_algebra')),
      statistics: Number(formData.get('math_statistics')),
    };
    
    const subScores = [
      Number(formData.get('reading')),
      Number(formData.get('writing')),
      math.numbers, math.operations, math.geometry, math.algebra, math.statistics,
      Number(formData.get('science')),
      Number(formData.get('socialStudies')),
      Number(formData.get('arts')),
      Number(formData.get('pe')),
      Number(formData.get('health')),
      Number(formData.get('lifeSkills')),
    ];

    const total = subScores.reduce((a, b) => a + b, 0);
    const average = total / subScores.length;
    const { latin, khmer } = calculateGrades(average);

    const studentId = formData.get('studentId') as string;
    const student = students.find(s => s.id === studentId);

    const data: any = {
      studentId,
      studentName: student?.name || 'Unknown',
      reading: Number(formData.get('reading')),
      writing: Number(formData.get('writing')),
      math,
      science: Number(formData.get('science')),
      socialStudies: Number(formData.get('socialStudies')),
      arts: Number(formData.get('arts')),
      pe: Number(formData.get('pe')),
      health: Number(formData.get('health')),
      lifeSkills: Number(formData.get('lifeSkills')),
      total,
      average,
      gradeLatin: latin,
      gradeKhmer: khmer,
      month: selectedMonth,
      year: new Date().getFullYear(),
      gradeValue: selectedGrade,
      category: 'monthly',
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, 'scores'), data);
    setShowAddScore(false);
  };

  const generateReportCard = (score: any) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('REPORT CARD', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text(`Student: ${score.studentName}`, 20, 40);
    doc.text(`Month: ${score.month}`, 20, 50);
    doc.text(`Rank: ${score.rank}`, 20, 60);
    doc.text(`Average: ${score.average.toFixed(2)}`, 20, 70);
    doc.text(`Grade: ${score.gradeKhmer} (${score.gradeLatin})`, 20, 80);

    // Subject Table
    const subjects = [
      ['Reading', score.reading],
      ['Writing', score.writing],
      ['Science', score.science],
      ['Social Studies', score.socialStudies],
      ['Arts', score.arts],
      ['PE', score.pe],
      ['Health', score.health],
      ['Life Skills', score.lifeSkills],
    ];

    (doc as any).autoTable({
      startY: 90,
      head: [['Subject', 'Score']],
      body: subjects,
    });

    doc.save(`Report_Card_${score.studentName}_${score.month}.pdf`);
  };

  const exportToExcel = () => {
    const data = displayScores.map((s: any, idx: number) => ({
      Rank: s.rank,
      Name: s.studentName,
      Average: s.average.toFixed(2),
      Total: s.total,
      Grade: `${s.gradeKhmer} (${s.gradeLatin})`
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Scores");
    XLSX.writeFile(workbook, `Scores_${selectedMonth}_Grade${selectedGrade}.xlsx`);
  };

  const chartData = useMemo(() => {
    const monthScores = scores.filter(s => s.month === selectedMonth && s.gradeValue === selectedGrade);
    return monthScores.map(s => ({
      name: s.studentName,
      avg: s.average,
      total: s.total
    }));
  }, [scores, selectedMonth, selectedGrade]);

  const gradeDistribution = useMemo(() => {
    const dist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    scores.filter(s => s.month === selectedMonth && s.gradeValue === selectedGrade)
      .forEach(s => {
        if (s.gradeLatin) dist[s.gradeLatin as keyof typeof dist]++;
      });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [scores, selectedMonth, selectedGrade]);

  const predictiveAlerts = useMemo(() => {
    const currentMonthScores = scores.filter(s => s.month === selectedMonth && s.gradeValue === selectedGrade);
    return currentMonthScores.filter(s => (s.average || 0) < 5).map(s => ({
      name: s.studentName,
      avg: s.average,
      risk: (s.average || 0) < 4 ? 'high' : 'medium'
    }));
  }, [scores, selectedMonth, selectedGrade]);

  const subjectWeaknesses = useMemo(() => {
    const monthScores = scores.filter(s => s.month === selectedMonth && s.gradeValue === selectedGrade);
    if (monthScores.length === 0) return [];
    
    const subjects = [
      { id: 'reading', name: 'ការអាន' },
      { id: 'writing', name: 'សរសេរ' },
      { id: 'science', name: 'វិទ្យាសាស្ត្រ' },
      { id: 'socialStudies', name: 'សិក្សាសង្គម' },
    ];

    return subjects.map(sub => {
      const avg = monthScores.reduce((acc, curr) => acc + (curr[sub.id as keyof ScoreRecord] as number || 0), 0) / monthScores.length;
      return { name: sub.name, avg };
    }).sort((a, b) => a.avg - b.avg);
  }, [scores, selectedMonth, selectedGrade]);

  const topicAlerts = useMemo(() => {
    const monthScores = scores.filter(s => s.month === selectedMonth && s.gradeValue === selectedGrade);
    if (monthScores.length === 0) return [];

    const topics = [
      { id: 'reading', name: 'ការអាន' },
      { id: 'writing', name: 'សរសេរ' },
      { id: 'math_numbers', name: 'គណិតវិទ្យា៖ ចំនួន', path: ['math', 'numbers'] },
      { id: 'math_operations', name: 'គណិតវិទ្យា៖ រស់រាល់', path: ['math', 'operations'] },
      { id: 'math_geometry', name: 'គណិតវិទ្យា៖ ធរណីមាត្រ', path: ['math', 'geometry'] },
      { id: 'math_algebra', name: 'គណិតវិទ្យា៖ ពីជគណិត', path: ['math', 'algebra'] },
      { id: 'math_statistics', name: 'គណិតវិទ្យា៖ ស្ថិតិ', path: ['math', 'statistics'] },
      { id: 'science', name: 'វិទ្យាសាស្ត្រ' },
      { id: 'socialStudies', name: 'សិក្សាសង្គម' },
    ];

    return topics.map(topic => {
      let belowAverageCount = 0;
      monthScores.forEach(s => {
        let val = 0;
        if (topic.path) {
          // @ts-ignore
          val = s[topic.path[0]]?.[topic.path[1]] || 0;
        } else {
          // @ts-ignore
          val = s[topic.id] || 0;
        }
        if (val < 5) belowAverageCount++;
      });

      const percentage = (belowAverageCount / monthScores.length) * 100;
      let status: 'warning' | 'danger' | 'critical' = 'warning';
      if (percentage >= 70) status = 'critical';
      else if (percentage >= 50) status = 'danger';

      return { ...topic, percentage, belowAverageCount, status };
    }).filter(t => t.percentage >= 30); // Alert starting from 30% for visibility
  }, [scores, selectedMonth, selectedGrade]);

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

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm font-black khmer-font text-xs">
          <button onClick={() => setActiveTab('monthly')} className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>ប្រចាំខែ</button>
          <button onClick={() => setActiveTab('semester')} className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'semester' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>ប្រចាំឆមាស</button>
          <button onClick={() => setActiveTab('yearly')} className={`px-6 py-2 rounded-xl transition-all ${activeTab === 'yearly' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>ប្រចាំឆ្នាំ</button>
        </div>

        <div className="flex gap-4">
           {activeTab === 'semester' && (
             <select value={selectedSemester} onChange={(e) => setSelectedSemester(Number(e.target.value) as 1 | 2)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold khmer-font outline-none">
               <option value={1}>ឆមាសទី ១</option>
               <option value={2}>ឆមាសទី ២</option>
             </select>
           )}
           <select value={selectedGrade} onChange={(e) => setSelectedGrade(Number(e.target.value) as Grade)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold khmer-font outline-none">
             {[1,2,3,4,5,6].map(g => <option key={g} value={g}>ថ្នាក់ទី {g}</option>)}
           </select>
           {activeTab === 'monthly' && (
             <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold khmer-font outline-none">
               {['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'].map(m => (
                 <option key={m} value={m}>{m}</option>
               ))}
             </select>
           )}
        </div>
      </div>

      {topicAlerts.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border rounded-[2.5rem] p-8 space-y-6 shadow-xl border-rose-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
              <h3 className="text-2xl font-black khmer-font">ការវិភាគកំហុសសិស្ស (Error Analysis)</h3>
            </div>
            <span className="bg-rose-50 text-rose-600 px-4 py-1 rounded-full text-xs font-black">ការជូនដំណឹងស្វ័យប្រវត្ត</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topicAlerts.map(alert => (
              <div key={alert.id} className={`p-4 rounded-2xl border flex items-center justify-between transition-all hover:scale-[1.02] ${
                alert.status === 'critical' ? 'bg-rose-50 border-rose-200' : 
                alert.status === 'danger' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <p className="text-lg font-black text-slate-800 khmer-font">{alert.name}</p>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${
                    alert.status === 'critical' ? 'text-rose-600' : 
                    alert.status === 'danger' ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {alert.percentage.toFixed(0)}% សិស្សទទួលបានពិន្ទុទាប
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center ${
                  alert.status === 'critical' ? 'bg-rose-600 text-white' : 
                  alert.status === 'danger' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  <span className="text-lg font-black leading-none">{alert.belowAverageCount}</span>
                  <span className="text-[8px] font-bold uppercase">នាក់</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex gap-4 items-start">
             <Lightbulb className="w-6 h-6 text-amber-500 flex-shrink-0" />
             <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 khmer-font">ដំបូន្មានសម្រាប់គ្រូបង្រៀន៖</p>
                <p className="text-xs text-slate-500 khmer-font leading-relaxed italic">
                  ប្រព័ន្ធរកឃើញថាសិស្សភាគច្រើនជួបលំបាកលើចំណុចខាងលើ (ជាពិសេសប្រសិនបើសូចនាករមានពណ៌ក្រហម)។ លោកគ្រូអ្នកគ្រូគួរតែរៀបចំ "ម៉ោងរំលឹកមេរៀនឡើងវិញ" ឬប្រើវិធីសាស្ត្របង្រៀនថ្មីសម្រាប់ចំណុចទាំងនេះ ដូចជាការប្រើរូបភាពជំនួស ឬការអនុវត្តក្នុងជីវភាពជាក់ស្តែង។
                </p>
             </div>
          </div>
        </motion.div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">វិភាគលទ្ធផលសិក្សា Dashboard</h2>
        <p className="text-slate-500 font-medium khmer-font">ប្រព័ន្ធស្វ័យប្រវត្តិកម្មពិន្ទុ និងចំណាត់ថ្នាក់និទ្ទេស</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-indigo-500" /> បម្រែបម្រួលមធ្យមភាគសិស្ស
                  </h3>
                  <button onClick={() => setShowAddScore(true)} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    <PlusCircle className="w-5 h-5" /> បញ្ចូលពិន្ទុថ្មី
                  </button>
               </div>
               <div className="h-[400px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                     <YAxis axisLine={false} tickLine={false} domain={[0, 10]} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                     <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Bar dataKey="avg" name="មធ្យមភាគ" fill="#6366f1" radius={[8, 8, 0, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
               <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-800 khmer-font">តារាងពិន្ទុ និងចំណាត់ថ្នាក់</h3>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setActiveReport(activeTab === 'monthly' ? 'monthly' : activeTab === 'semester' ? (selectedSemester === 1 ? 'semester1' : 'semester2') : 'annual')} 
                      className="text-[10px] font-black bg-emerald-600 text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" /> ទាញយកតារាងសម្រង់ពិន្ទុ (MoEYS)
                    </button>
                    <button onClick={exportToExcel} className="text-[10px] font-black text-indigo-600 border border-indigo-100 hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all font-khmer">Export XLSX</button>
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50">
                     <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">លេខរៀង</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ចំណាត់ថ្នាក់</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">អត្តលេខ</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះសិស្ស</th>
                        <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ភេទ</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">មធ្យមភាគ</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">និទ្ទេស</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {displayScores.map((score: any, idx: number) => (
                        <tr key={score.id || idx} className={`hover:bg-slate-50/50 transition-colors ${score.isFilled === false ? 'opacity-50' : ''}`}>
                           <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">{idx + 1}</td>
                           <td className="px-6 py-4 text-center">
                              <div className={`w-8 h-8 mx-auto rounded-lg flex items-center justify-center font-black text-sm ${score.rank !== '-' && score.rank <= 3 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
                                 {score.rank}
                              </div>
                           </td>
                           <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{score.rollNumber || '---'}</td>
                           <td className="px-6 py-4 font-black text-slate-700 khmer-font">{score.studentName}</td>
                           <td className="px-4 py-4 text-center font-bold text-slate-400 khmer-font text-xs">
                              {score.gender === 'ស្រី' || score.gender === 'female' || score.gender === 'ស' ? 'ស' : 'ប'}
                           </td>
                           <td className="px-6 py-4 text-center font-black text-indigo-600">{(score.average || 0).toFixed(2)} / 10</td>
                           <td className="px-8 py-4 text-right flex items-center justify-end gap-3">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black khmer-font ${
                                calculateGrades(score.average).latin === 'A' ? 'bg-emerald-100 text-emerald-600' :
                                calculateGrades(score.average).latin === 'B' ? 'bg-blue-100 text-blue-600' :
                                calculateGrades(score.average).latin === 'C' ? 'bg-indigo-100 text-indigo-600' :
                                calculateGrades(score.average).latin === 'D' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                              }`}>
                                 {calculateGrades(score.average).khmer} ({calculateGrades(score.average).latin})
                              </span>
                              <button 
                                onClick={() => generateReportCard(score)}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                title="ទាញយកព្រឹត្តិបត្រពិន្ទុ"
                                disabled={!score.isFilled && activeTab === 'monthly'}
                              >
                                 <Download className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
               <h3 className="text-lg font-black text-slate-800 khmer-font mb-6">ការបែងចែកនិទ្ទេស</h3>
               <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={gradeDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                         {gradeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="space-y-2 mt-4">
                  {gradeDistribution.map((g, i) => (
                    <div key={g.name} className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                          <span className="text-xs font-bold text-slate-500">និទ្ទេស {g.name}</span>
                       </div>
                       <span className="text-sm font-black text-slate-800">{g.value} នាក់</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 rounded-[3rem] shadow-xl text-white">
               <h3 className="text-xl font-black khmer-font mb-6 flex items-center gap-2">
                 <Trophy className="w-6 h-6 text-amber-400" /> សិស្សឆ្នើមប្រចាំខែ
               </h3>
               <div className="space-y-4">
                  {chartData.sort((a, b) => b.avg - a.avg).slice(0, 3).map((s, idx) => (
                    <div key={s.name} className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${idx === 0 ? 'bg-amber-400 text-amber-900' : 'bg-slate-100/20 text-white'}`}>
                          {idx + 1}
                       </div>
                       <div>
                          <p className="font-black khmer-font leading-none mb-1">{s.name}</p>
                          <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{s.avg.toFixed(1)} / 10 Avg</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {showAddScore && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl p-10">
              <form onSubmit={handleAddScore} className="space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-slate-800 khmer-font">បញ្ចូលសន្លឹកពិន្ទុស្វ័យប្រវត្ត</h3>
                    <button type="button" onClick={() => setShowAddScore(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Plus className="w-8 h-8 rotate-45 text-slate-400" /></button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="block text-sm font-black text-slate-600 mb-2 khmer-font">ជ្រើសរើសសិស្ស</label>
                        <select name="studentId" required className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none khmer-font font-bold">
                           <option value="">-- រើសសិស្ស --</option>
                           {students.filter(s => s.grade === selectedGrade).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <ScoreInput label="ការអាន" name="reading" />
                       <ScoreInput label="សរសេរ" name="writing" />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="font-black text-slate-400 uppercase tracking-widest text-xs flex items-center gap-2">
                       <Calculator className="w-4 h-4" /> មុខវិជ្ជាគណិតវិទ្យា
                    </h4>
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                       <ScoreInput label="ចំនួន" name="math_numbers" />
                       <ScoreInput label="រស់រាល់" name="math_operations" />
                       <ScoreInput label="ធរណីមាត្រ" name="math_geometry" />
                       <ScoreInput label="ពីជគណិត" name="math_algebra" />
                       <ScoreInput label="ស្ថិតិ" name="math_statistics" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <ScoreInput label="វិទ្យាសាស្ត្រ" name="science" />
                    <ScoreInput label="សិក្សាសង្គម" name="socialStudies" />
                    <ScoreInput label="សិល្បៈ" name="arts" />
                    <ScoreInput label="កាយវិការ" name="pe" />
                    <ScoreInput label="សុខភាព" name="health" />
                    <ScoreInput label="បំណិន" name="lifeSkills" />
                 </div>

                 <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">តារាងកម្រិតនិទ្ទេសស្វ័យប្រវត្ត</p>
                    <div className="flex flex-wrap gap-4">
                       {KHMER_GRADES.map(g => (
                         <div key={g.label} className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }}></div>
                            <span className="text-[10px] font-black text-slate-600 khmer-font">{g.label} : {g.range[0]}-{g.range[1]}</span>
                         </div>
                       ))}
                    </div>
                 </div>

                 <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black khmer-font text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3">
                    <Save className="w-6 h-6" /> រក្សាទុក និងគណនាចំណាត់ថ្នាក់
                 </button>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}

function ScoreInput({ label, name }: { label: string, name: string }) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest khmer-font">{label}</label>
      <input 
        name={name} 
        type="number" 
        min="0" 
        max="10" 
        step="0.1"
        defaultValue="0"
        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none font-bold" 
      />
    </div>
  );
}
