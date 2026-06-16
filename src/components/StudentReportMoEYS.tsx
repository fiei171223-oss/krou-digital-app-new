import React, { useState, useRef } from 'react';
import { Student, ClassInfo } from '../types';

interface StudentReportMoEYSProps {
  students: Student[];
  classInfo: ClassInfo;
  onBack: () => void;
}

export default function StudentReportMoEYS({ students, classInfo, onBack }: StudentReportMoEYSProps) {
  const [logoUrl, setLogoUrl] = useState<string>("/src/assets/images/digital_teacher_logo_1778483502661.png");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const totalStudents = students.length || 60;
  
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('km-KH', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white min-h-screen p-0 md:p-8 font-['Hanuman','Khmer_OS'] text-[11px] leading-tight text-slate-900 border-none">
      {/* Controls - Hidden in print */}
      <div className="fixed top-6 right-6 flex gap-3 z-50 print:hidden">
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
        {/* Page Header - Refined to match Image 2 */}
        <div className="grid grid-cols-3 items-start mb-10 border-none print:mb-6">
          {/* Left Metadata (School Info) - Blue and Left Aligned */}
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
              <p className="whitespace-nowrap flex items-center gap-1">ថ្នាក់ទី៖ <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-blue-50/50 min-w-[50px] inline-block transition-colors">៦រ (6A)</span></p>
            </div>
          </div>

          {/* Center Titles - Kingdom Motto */}
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
              <h1 className="text-[#cc0000] text-[11px] font-['Khmer_OS_Muol_Light'] font-bold leading-tight">បញ្ជីឈ្មោះសិស្ស</h1>
              <p className="text-[#cc0000] text-[12px] font-bold font-['Khmer_OS_Siemreap']">ឆ្នាំសិក្សា <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-red-50/50 min-w-[60px] inline-block transition-colors">២០២៤-២០២៥</span></p>
            </div>
          </div>

          {/* Right Space - Empty or Timestamp as per requirement */}
          <div className="text-right text-[10px] font-bold text-slate-400 font-khmer pt-10">
             {/* Optional Right Content */}
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto border-none">
          <table className="w-full border-collapse table-fixed border-[#3366cc] border">
            <thead>
              <tr className="bg-[#1a3a8f] text-white text-[11px]">
                <th style={{ width: '35px' }} className="border border-[#3366cc] p-1 font-bold">លរ</th>
                <th style={{ width: '55px' }} className="border border-[#3366cc] p-1 font-bold">អត្តលេខ</th>
                <th style={{ width: '140px' }} className="border border-[#3366cc] p-1 font-bold">គោត្តនាម នាមខ្លួន</th>
                <th style={{ width: '35px' }} className="border border-[#3366cc] p-1 font-bold">ភេទ</th>
                <th style={{ width: '90px' }} className="border border-[#3366cc] p-1 font-bold">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th style={{ width: '35px' }} className="border border-[#3366cc] p-1 font-bold">អាយុ</th>
                <th style={{ width: '170px' }} className="border border-[#3366cc] p-1 font-bold">ទីកន្លែងកំណើត</th>
                <th className="border border-[#3366cc] p-0" colSpan={2}>
                  <div className="border-b border-[#3366cc] p-1 font-bold">ឈ្មោះឪពុក និងមុខរបរ</div>
                  <div className="flex">
                    <div className="flex-1 p-1 font-bold" style={{ width: '110px' }}>ឈ្មោះ</div>
                    <div className="w-[70px] border-l border-[#3366cc] p-1 font-bold">មុខរបរ</div>
                  </div>
                </th>
                <th className="border border-[#3366cc] p-0" colSpan={2}>
                  <div className="border-b border-[#3366cc] p-1 font-bold">ឈ្មោះម្ដាយ និងមុខរបរ</div>
                  <div className="flex">
                    <div className="flex-1 p-1 font-bold" style={{ width: '110px' }}>ឈ្មោះ</div>
                    <div className="w-[70px] border-l border-[#3366cc] p-1 font-bold">មុខរបរ</div>
                  </div>
                </th>
                <th style={{ width: '160px' }} className="border border-[#3366cc] p-1 font-bold">អាសយដ្ឋានសព្វថ្ងៃ</th>
                <th style={{ width: '55px' }} className="border border-[#3366cc] p-1 font-bold">ផ្សេងៗ</th>
              </tr>
              {/* Indices Row */}
              <tr className="bg-slate-50 text-[9px] text-center font-bold text-[#1a3a8f]">
                 <td className="border border-[#3366cc]">1</td>
                 <td className="border border-[#3366cc]">2</td>
                 <td className="border border-[#3366cc]">3</td>
                 <td className="border border-[#3366cc]">6</td>
                 <td className="border border-[#3366cc]">7</td>
                 <td className="border border-[#3366cc]">8</td>
                 <td className="border border-[#3366cc]">9</td>
                 <td className="border border-[#3366cc]" colSpan={2}>13 / 14</td>
                 <td className="border border-[#3366cc]" colSpan={2}>17 / 18</td>
                 <td className="border border-[#3366cc]">11</td>
                 <td className="border border-[#3366cc]">12</td>
              </tr>
            </thead>
            <tbody>
              {(students.length > 0 ? students : Array.from({ length: 60 })).map((student: any, idx) => {
                const isPlaceholder = !student || !student.id;
                return (
                  <tr key={isPlaceholder ? idx : student.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#eef3ff]'}>
                    <td className="border border-[#3366cc] text-center p-1 font-bold">{idx + 1}</td>
                    <td className="border border-[#3366cc] text-center p-1 truncate text-[#1a3a8f] font-bold">
                      {isPlaceholder ? (8801 + idx) : (student.rollNumber || (8801 + idx))}
                    </td>
                    <td className="border border-[#3366cc] p-1 font-bold truncate">
                      {isPlaceholder ? `សិស្ស ឈ្មោះ ${idx + 1}` : student.name}
                    </td>
                    <td className="border border-[#3366cc] text-center p-1 font-bold">
                       {isPlaceholder ? (idx % 2 === 0 ? 'ប' : 'ស') : (student.gender === 'ស្រី' || student.gender === 'female' || student.gender === 'ស' ? 'ស' : 'ប')}
                    </td>
                    <td className="border border-[#3366cc] text-center p-1 font-bold">{isPlaceholder ? '02-02-2013' : (student.dob || '01-01-2013')}</td>
                    <td className="border border-[#3366cc] text-center p-1 font-bold">{isPlaceholder ? 11 : (student.age || 10)}</td>
                    <td className="border border-[#3366cc] p-1 text-[10px] truncate font-bold">{isPlaceholder ? 'គតរ២ គត គំពាំ...' : 'វិញ្ញាបនបត្រ...'}</td>
                    <td className="border border-[#3366cc] p-1 truncate font-bold">{isPlaceholder ? 'ឪពុក សាលា' : (student.fatherName || '-')}</td>
                    <td className="border border-[#3366cc] p-1 truncate font-bold text-center">{isPlaceholder ? 'គសិករ' : (student.village || 'គសិករ')}</td>
                    <td className="border border-[#3366cc] p-1 truncate font-bold">{isPlaceholder ? 'ម្ដាយ សាលា' : (student.motherName || '-')}</td>
                    <td className="border border-[#3366cc] p-1 truncate font-bold text-center">{isPlaceholder ? 'គសិករ' : (student.village || 'គសិករ')}</td>
                    <td className="border border-[#3366cc] p-1 text-[10px] truncate font-bold">{isPlaceholder ? 'គតរ២ គត...' : (student.address || 'ភ្នំពេញ')}</td>
                    <td className={`border border-[#3366cc] text-center p-1 font-black text-[10px] ${isPlaceholder ? 'text-[#cc0000]' : 'text-[#cc0000]'}`}>
                       {isPlaceholder ? 'FALSE' : 'FALSE'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Area */}
        <div className="mt-8 mb-12">
           <div className="flex justify-between items-start font-khmer text-[12px]">
              {/* Left Column */}
              <div className="space-y-4 flex-1">
                 <div className="flex items-center gap-2">
                    <span className="text-[#008060]">បញ្ចប់បញ្ជីត្រឹមលេខរៀងទី</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{totalStudents}</span>
                    <span className="text-[#008060]">សិស្សសរុប</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{totalStudents}</span>
                    <span className="text-[#1a3a8f]">នាក់</span>
                    <span className="text-[#008060] ml-2">ស្រី</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{students.filter(s => s.gender === 'ស្រី' || s.gender === 'female' || s.gender === 'ស').length || 3}</span>
                    <span className="text-[#1a3a8f]">នាក់</span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <span className="text-[#008060] text-right inline-block w-[150px]">សិស្សឡើងថ្មីសរុបមានចំនួន</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{students.length > 0 ? students.filter(s => s.isNew).length : '...'}</span>
                    <span className="text-[#1a3a8f]">នាក់</span>
                    <span className="text-[#008060] ml-2">ស្រី</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{students.length > 0 ? students.filter(s => s.isNew && (s.gender === 'ស្រី' || s.gender === 'female' || s.gender === 'ស')).length : '...'}</span>
                    <span className="text-[#1a3a8f]">នាក់</span>
                 </div>

                 <div className="flex items-center gap-2">
                    <span className="text-[#008060] text-right inline-block w-[150px]">សិស្សចាស់សរុបមានចំនួន</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{students.length > 0 ? students.filter(s => !s.isNew).length : '...'}</span>
                    <span className="text-[#1a3a8f]">នាក់</span>
                    <span className="text-[#008060] ml-2">ស្រី</span>
                    <span contentEditable suppressContentEditableWarning className="font-bold text-[#1a3a8f] outline-none min-w-[30px] border-b border-dotted border-slate-300 text-center">{students.length > 0 ? students.filter(s => !s.isNew && (s.gender === 'ស្រី' || s.gender === 'female' || s.gender === 'ស')).length : '...'}</span>
                    <span className="text-[#1a3a8f]">នាក់</span>
                 </div>
              </div>
              
              {/* Right Column */}
              <div className="w-[380px] flex flex-col pt-2">
                 <div className="text-center space-y-2 mb-8 text-[#1a3a8f]">
                    <p>ថ្ងៃពុធ ១៤រោច ខែកត្តិក ឆ្នាំថោះ បញ្ចស័ក ព.ស. ២៥៦៧</p>
                    <p>
                      ធ្វើនៅ <span contentEditable suppressContentEditableWarning className="font-bold outline-none px-2 text-[#1a3a8f]">ពោធិ៍ជ្រៃ</span> 
                      ថ្ងៃទី <span contentEditable suppressContentEditableWarning className="font-bold outline-none px-1 text-[#1a3a8f]">១១</span> 
                      ខែ <span contentEditable suppressContentEditableWarning className="font-bold outline-none px-1 text-[#1a3a8f]">ធ្នូ</span> 
                      ឆ្នាំ<span contentEditable suppressContentEditableWarning className="font-bold outline-none text-[#1a3a8f]">២០២៣</span>
                    </p>
                 </div>
                 
                 <div className="flex text-center font-bold text-[#008060]">
                    <div className="flex-1 space-y-16">
                      <div className="space-y-1">
                        <p>បានឃើញ និង ឯកភាព</p>
                        <p>នាយកសាលា</p>
                      </div>
                      <div className="h-10"></div>
                    </div>
                    <div className="flex-1 space-y-16 mt-5">
                      <p>គ្រូប្រចាំថ្នាក់</p>
                      <p className="text-[#cc0000]">{classInfo.teacherName || 'លោកគ្រូ អ៊ុំ សុភត្រា'}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanuman:wght@400;700;900&family=Kantumruy+Pro:wght@100;400;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Khmer+OS+Muol+Light&display=swap');

        @media print {
          @page { size: landscape; margin: 10mm; }
          body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .min-h-screen { min-height: auto !important; }
          .print\\:hidden { display: none !important; }
          table { font-size: 10px; }
          .border { border: 1px solid #3366cc !important; }
          .border-b { border-bottom: 1px solid #3366cc !important; }
          .border-l { border-left: 1px solid #3366cc !important; }
          .bg-white { background-color: #fff !important; }
          .bg-\\[\\#eef3ff\\] { background-color: #eef3ff !important; }
          .bg-\\[\\#1a3a8f\\] { background-color: #1a3a8f !important; }
        }
        
        .font-khmer { font-family: 'Hanuman', 'Khmer OS', sans-serif; }
      `}</style>
    </div>
  );
}
