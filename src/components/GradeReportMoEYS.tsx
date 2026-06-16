import React, { useState, useRef } from 'react';
import { Student, ScoreRecord, ClassInfo } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { Save, Edit2, CheckCircle2, Loader2 } from 'lucide-react';

interface GradeReportMoEYSProps {
  students: Student[];
  scores: ScoreRecord[];
  classInfo: ClassInfo;
  reportType: 'monthly' | 'semester1' | 'semester2' | 'annual';
  month?: string;
  onBack: () => void;
}

export default function GradeReportMoEYS({ 
  students, 
  scores, 
  classInfo, 
  reportType, 
  month, 
  onBack 
}: GradeReportMoEYSProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/src/assets/images/digital_teacher_logo_1778483502661.png");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editScores, setEditScores] = useState<Record<string, Partial<ScoreRecord>>>({});

  const getTitle = () => {
    switch (reportType) {
      case 'monthly': return `តារាងសម្រង់ពិន្ទុប្រចាំខែ ${month || ''}`;
      case 'semester1': return 'តារាងសម្រង់ពិន្ទុប្រចាំឆមាសទី ១';
      case 'semester2': return 'តារាងសម្រង់ពិន្ទុប្រចាំឆមាសទី ២';
      case 'annual': return 'តារាងសម្រង់ពិន្ទុប្រចាំឆ្នាំ';
      default: return 'តារាងសម្រង់ពិន្ទុ';
    }
  };

  const calculateGrades = (avg: number) => {
    if (avg >= 9) return { latin: 'A', khmer: 'ល្អប្រសើរ' };
    if (avg >= 8) return { latin: 'B', khmer: 'ល្អ' };
    if (avg >= 7) return { latin: 'C', khmer: 'ល្អបង្គួរ' };
    if (avg >= 5) return { latin: 'D', khmer: 'មធ្យម' };
    return { latin: 'F', khmer: 'ខ្សោយ' };
  };

  const handleScoreChange = (studentId: string, field: string, value: string, subField?: string) => {
    const numValue = Math.min(10, Math.max(0, parseFloat(value) || 0));
    
    setEditScores(prev => {
      const studentScore = prev[studentId] || {};
      if (subField) {
        const math = { ...(studentScore.math || { numbers: 0, operations: 0, geometry: 0, algebra: 0, statistics: 0 }) };
        (math as any)[subField] = numValue;
        return { ...prev, [studentId]: { ...studentScore, math } };
      }
      return { ...prev, [studentId]: { ...studentScore, [field]: numValue } };
    });
  };

  const handleSave = async () => {
    if (Object.keys(editScores).length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const promises = Object.entries(editScores).map(async ([studentId, updatedFields]) => {
        const existingScore = scores.find(s => s.studentId === studentId && s.month === month);
        const student = students.find(s => s.id === studentId);
        
        if (existingScore) {
          const scoreRef = doc(db, 'scores', existingScore.id);
          const newScore = { ...existingScore, ...updatedFields };
          
          // Recalculate totals
          const total = (newScore.reading + newScore.writing) / 2 + 
                       (newScore.math.numbers + newScore.math.operations + newScore.math.geometry + newScore.math.algebra + newScore.math.statistics) / 5 +
                       newScore.science + newScore.socialStudies + newScore.arts + newScore.pe + newScore.health + newScore.lifeSkills;
          
          await updateDoc(scoreRef, {
            ...updatedFields,
            total,
            average: total / 8,
            updatedAt: serverTimestamp()
          });
        } else if (student && month) {
          // Create new record if one doesn't exist for this month
          const scoreData: any = {
            studentId,
            studentName: student.name,
            grade: student.grade,
            gradeValue: student.grade,
            month: month,
            reading: 0,
            writing: 0,
            math: { numbers: 0, operations: 0, geometry: 0, algebra: 0, statistics: 0 },
            science: 0,
            socialStudies: 0,
            arts: 0,
            pe: 0,
            health: 0,
            lifeSkills: 0,
            academicYear: classInfo.academicYear,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ...updatedFields
          };

          const total = (scoreData.reading + scoreData.writing) / 2 + 
                       (scoreData.math.numbers + scoreData.math.operations + scoreData.math.geometry + scoreData.math.algebra + scoreData.math.statistics) / 5 +
                       scoreData.science + scoreData.socialStudies + scoreData.arts + scoreData.pe + scoreData.health + scoreData.lifeSkills;
          
          scoreData.total = total;
          scoreData.average = total / 8;

          await setDoc(doc(collection(db, 'scores')), scoreData);
        }
      });

      await Promise.all(promises);
      setIsEditing(false);
      setEditScores({});
    } catch (error) {
      console.error("Error saving scores:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុកពិន្ទុ។ សូមសាកល្បងម្ដងទៀត។");
    } finally {
      setIsSaving(false);
    }
  };

  const processData = () => {
    const s1Months = ['វិច្ឆិកា', 'ធ្នូ', 'មករា', 'កុម្ភៈ', 'មីនា'];
    const s2Months = ['មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា'];

    let list = students.map(student => {
      let studentScores: any = {};
      let total = 0;
      let average = 0;

      let targetScores = scores.filter(s => s.studentId === student.id);
      
      if (reportType === 'monthly') {
        targetScores = targetScores.filter(s => s.month === month);
      } else if (reportType === 'semester1') {
        targetScores = targetScores.filter(s => s1Months.includes(s.month));
      } else if (reportType === 'semester2') {
        targetScores = targetScores.filter(s => s2Months.includes(s.month));
      }
      // Annual uses all scores

      if (targetScores.length > 0) {
          const avgScore = (field: keyof ScoreRecord | string, path?: string[]) => {
            return targetScores.reduce((acc, s: any) => {
                if (path) return acc + (s[path[0]]?.[path[1]] || 0);
                return acc + (s[field] || 0);
            }, 0) / targetScores.length;
          };

          studentScores = {
            khmer: (avgScore('reading') + avgScore('writing')) / 2,
            math: (avgScore('', ['math', 'numbers']) + avgScore('', ['math', 'operations']) + avgScore('', ['math', 'geometry']) + avgScore('', ['math', 'algebra']) + avgScore('', ['math', 'statistics'])) / 5,
            science: avgScore('science'),
            social: avgScore('socialStudies'),
            arts: avgScore('arts'),
            pe: avgScore('pe'),
            health: avgScore('health'),
            lifeSkills: avgScore('lifeSkills')
          };
          
          total = Object.values(studentScores).reduce((a: any, b: any) => a + b, 0) as number;
          average = total / Object.keys(studentScores).length;
      }

      return {
        id: student.id,
        rollNumber: student.rollNumber,
        name: student.name,
        gender: student.gender === 'ស្រី' || student.gender === 'female' || student.gender === 'ស' ? 'ស' : 'ប',
        scores: studentScores,
        total,
        average,
        grade: calculateGrades(average)
      };
    });

    // Rank
    list.sort((a, b) => b.average - a.average);
    const rankedList = list.map((item, idx) => ({ 
      ...item, 
      rank: item.average > 0 ? (idx + 1).toString() : '-' 
    }));
    
    // Sort back to roll number if available, otherwise name
    rankedList.sort((a, b) => {
        const rollA = a.rollNumber || '';
        const rollB = b.rollNumber || '';
        if (rollA && rollB) return rollA.localeCompare(rollB);
        return a.name.localeCompare(b.name);
    });

    return rankedList;
  };

  const displayData = processData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white min-h-screen p-0 md:p-8 font-['Hanuman','Khmer_OS'] text-[11px] leading-tight text-slate-900 border-none">
      {/* Controls - Hidden in print */}
      <div className="fixed top-6 right-6 flex gap-3 z-50 print:hidden">
        {reportType === 'monthly' && (
          isEditing ? (
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all font-khmer flex items-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? 'កំពុងរក្សាទុក...' : 'រក្សាទុកការកែប្រែ'}
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all font-khmer flex items-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              បញ្ចូល/កែពិន្ទុ (Monthly Entry)
            </button>
          )
        )}
        <button 
          onClick={onBack}
          className="bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all font-khmer flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          ត្រឡប់ក្រោយ
        </button>
        <button 
          onClick={handlePrint}
          className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all font-khmer"
        >
           បោះពុម្ពបញ្ជី (Print)
        </button>
      </div>

      <div className="max-w-[297mm] mx-auto print:m-0 bg-white">
        {/* Page Header */}
        <div className="grid grid-cols-3 items-start mb-10 border-none print:mb-6">
          <div className="text-[#1a3a8f] text-[11px] font-['Khmer_OS_Muol_Light'] pt-4 inline-block w-fit">
            <div 
              className="flex justify-center mb-2 cursor-pointer" 
              onClick={() => logoInputRef.current?.click()}
              title="ចុចដើម្បីប្តូររូបសញ្ញា (Click to change logo)"
            >
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-[48px] h-auto object-contain pointer-events-none select-none"
                onError={(e) => {
                  e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Ministry_of_Education,_Youth_and_Sport_of_Cambodia.svg/1024px-Ministry_of_Education,_Youth_and_Sport_of_Cambodia.svg.png";
                }}
              />
              <input 
                type="file" 
                ref={logoInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoChange}
              />
            </div>
            <div className="space-y-1">
              <p className="whitespace-nowrap flex items-center gap-1">រដ្ឋបាលស្រុក/ខណ្ឌ/ក្រុង៖ <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50/50 min-w-[50px] inline-block transition-colors">ព្រៃឈរ</span></p>
              <p className="whitespace-nowrap flex items-center gap-1">សាលាបឋមសិក្សា៖ <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50/50 min-w-[50px] inline-block transition-colors">ល្វា</span></p>
              <p className="whitespace-nowrap flex items-center gap-1">ថ្នាក់ទី៖ <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50/50 min-w-[50px] inline-block transition-colors">{classInfo.grade}</span></p>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="space-y-2 mb-6 text-center flex flex-col items-center">
              <h2 className="text-[#e2421a] text-[12px] font-['Khmer_OS_Muol_Light'] tracking-tight mt-0 mb-0 leading-normal">ព្រះរាជាណាចក្រកម្ពុជា</h2>
              <h3 className="text-[#e2421a] text-[12px] font-['Khmer_OS_Muol_Light'] mt-0 mb-0 leading-normal">ជាតិ សាសនា ព្រះមហាក្សត្រ</h3>
              <div className="flex justify-center mt-1">
                <svg width="80" height="12" viewBox="0 0 80 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 6H30" stroke="#e2421a" strokeWidth="0.8"/>
                  <path d="M50 6H80" stroke="#e2421a" strokeWidth="0.8"/>
                  <circle cx="40" cy="6" r="3" stroke="#e2421a" strokeWidth="0.8"/>
                  <circle cx="40" cy="6" r="1.5" fill="#e2421a"/>
                  <path d="M34 6L36 4V8L34 6Z" fill="#e2421a"/>
                  <path d="M46 6L44 4V8L46 6Z" fill="#e2421a"/>
                </svg>
              </div>
            </div>
              
            <div className="space-y-1">
              <h1 className="text-[#cc0000] text-[11px] font-['Khmer_OS_Muol_Light'] font-bold leading-tight">{getTitle()}</h1>
              <p className="text-[#cc0000] text-[12px] font-bold font-['Khmer_OS_Siemreap']">ឆ្នាំសិក្សា <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-red-50/50 min-w-[50px] inline-block transition-colors">{classInfo.academicYear}</span></p>
            </div>
          </div>

          <div className="text-right text-[10px] font-bold text-slate-400 font-khmer pt-10">
             កាលបរិច្ឆេទ: {new Date().toLocaleDateString('km-KH')}
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto border-none">
          <table className="w-full border-collapse table-fixed border-[#3366cc] border text-center">
            <thead>
              <tr className="bg-[#1a3a8f] text-white text-[10px]">
                <th rowSpan={2} style={{ width: '35px' }} className="border border-[#3366cc] p-1">លរ</th>
                <th rowSpan={2} style={{ width: '55px' }} className="border border-[#3366cc] p-1">អត្តលេខ</th>
                <th rowSpan={2} style={{ width: '150px' }} className="border border-[#3366cc] p-1">គោត្តនាម នាមខ្លួន</th>
                <th rowSpan={2} style={{ width: '35px' }} className="border border-[#3366cc] p-1">ភេទ</th>
                <th colSpan={8} className="border border-[#3366cc] p-1">មុខវិជ្ជា</th>
                <th rowSpan={2} style={{ width: '50px' }} className="border border-[#3366cc] p-1">សរុប</th>
                <th rowSpan={2} style={{ width: '50px' }} className="border border-[#3366cc] p-1">មធ្យម</th>
                <th rowSpan={2} style={{ width: '40px' }} className="border border-[#3366cc] p-1">ចំណាត់</th>
                <th rowSpan={2} style={{ width: '70px' }} className="border border-[#3366cc] p-1">និទ្ទេស</th>
              </tr>
              <tr className="bg-[#1a3a8f] text-white text-[8px]">
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">ភាសាខ្មែរ</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">គណិតវិទ្យា</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">វិទ្យាសាស្ត្រ</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">សិក្សាសង្គម</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">សិល្បៈ</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">កាយវិការ</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">សុខភាព</th>
                <th className="border border-[#3366cc] p-1 overflow-hidden whitespace-nowrap">បំណិន</th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#eef3ff]'}>
                  <td className="border border-[#3366cc] p-1 font-bold">{idx + 1}</td>
                  <td className="border border-[#3366cc] p-1 text-[#1a3a8f] font-bold">{item.rollNumber || (8801+idx)}</td>
                  <td className="border border-[#3366cc] text-left px-2 font-bold truncate">{item.name}</td>
                  <td className="border border-[#3366cc] p-1 font-bold">{item.gender}</td>
                  
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.reading ?? scores.find(s => s.studentId === item.id && s.month === month)?.reading ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'reading', val)}
                      />
                    ) : (item.scores.khmer || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.math?.operations ?? scores.find(s => s.studentId === item.id && s.month === month)?.math?.operations ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'math', val, 'operations')}
                      />
                    ) : (item.scores.math || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.science ?? scores.find(s => s.studentId === item.id && s.month === month)?.science ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'science', val)}
                      />
                    ) : (item.scores.science || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.socialStudies ?? scores.find(s => s.studentId === item.id && s.month === month)?.socialStudies ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'socialStudies', val)}
                      />
                    ) : (item.scores.social || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.arts ?? scores.find(s => s.studentId === item.id && s.month === month)?.arts ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'arts', val)}
                      />
                    ) : (item.scores.arts || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.pe ?? scores.find(s => s.studentId === item.id && s.month === month)?.pe ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'pe', val)}
                      />
                    ) : (item.scores.pe || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.health ?? scores.find(s => s.studentId === item.id && s.month === month)?.health ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'health', val)}
                      />
                    ) : (item.scores.health || 0).toFixed(1)}
                  </td>
                  <td className="border border-[#3366cc] p-1">
                    {isEditing ? (
                      <ScoreInput 
                        value={editScores[item.id]?.lifeSkills ?? scores.find(s => s.studentId === item.id && s.month === month)?.lifeSkills ?? 0}
                        onChange={(val) => handleScoreChange(item.id, 'lifeSkills', val)}
                      />
                    ) : (item.scores.lifeSkills || 0).toFixed(1)}
                  </td>

                  <td className="border border-[#3366cc] p-1 font-bold text-[#1a3a8f]">{(item.total || 0).toFixed(1)}</td>
                  <td className="border border-[#3366cc] p-1 font-bold text-indigo-600">{(item.average || 0).toFixed(1)}</td>
                  <td className="border border-[#3366cc] p-1">
                      <div className={`w-6 h-6 mx-auto rounded flex items-center justify-center font-bold text-[9px] ${item.rank !== '-' && parseInt(item.rank) <= 3 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 'text-slate-400'}`}>
                        {item.rank}
                      </div>
                  </td>
                  <td className="border border-[#3366cc] p-1">
                     <span className={`text-[8px] font-bold ${
                        item.grade.latin === 'A' ? 'text-emerald-600' :
                        item.grade.latin === 'B' ? 'text-blue-600' :
                        item.grade.latin === 'C' ? 'text-indigo-600' :
                        item.grade.latin === 'D' ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {item.grade.khmer} ({item.grade.latin})
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Area */}
        <div className="mt-10 grid grid-cols-3 gap-10 font-khmer font-bold text-center">
            <div className="space-y-20">
                <p>បានឃើញ និងឯកភាព</p>
                <div className="space-y-1">
                    <p>នាយកសាលា</p>
                    <div className="h-20"></div>
                    <p className="text-slate-300">................................................</p>
                </div>
            </div>
            
            <div></div>

            <div className="space-y-20">
                <div className="space-y-1">
                    <p>ថ្ងៃ {new Date().getDate()} ខែ {new Date().getMonth() + 1} ឆ្នាំ {new Date().getFullYear()}</p>
                    <p>គ្រូបន្ទុកថ្នាក់</p>
                </div>
                <div className="space-y-1">
                    <div className="h-20"></div>
                    <p className="text-rose-600 font-['Khmer_OS_Muol']">{classInfo.teacherName}</p>
                </div>
            </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700;900&display=swap');
        
        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .min-h-screen { min-height: auto !important; }
          .print\\:hidden { display: none !important; }
          .border { border: 1px solid #3366cc !important; }
          .bg-white { background-color: #fff !important; }
          .bg-\\[\\#eef3ff\\] { background-color: #eef3ff !important; }
          .bg-\\[\\#1a3a8f\\] { background-color: #1a3a8f !important; }
        }
      `}</style>
    </div>
  );
}

function ScoreInput({ value, onChange }: { value: number, onChange: (val: string) => void }) {
  return (
    <input 
      type="number"
      step="0.1"
      min="0"
      max="10"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-indigo-50 border border-indigo-200 rounded px-1 py-0.5 text-center font-bold text-indigo-900 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none transition-all print:hidden"
    />
  );
}
