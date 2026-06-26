import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Printer, Loader2 } from 'lucide-react';
import { LessonPlan } from '../types';
import Markdown from 'react-markdown';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
  type: 'student' | 'teacher';
}

export default function WorksheetModal({ isOpen, onClose, plan, type }: Props) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    if (isOpen && !hasGenerated) {
      generateWorksheet();
      setHasGenerated(true);
    }
  }, [isOpen]);

  const generateWorksheet = async () => {
    setIsLoading(true);
    setContent('');
    try {
      const isStudent = type === 'student';
      
      const stepsArr = Object.values(plan.steps);
      const teacherActivityStr = stepsArr.map(s => s.teacherActivity).filter(Boolean).join('\n');
      const studentActivityStr = stepsArr.map(s => s.studentActivity).filter(Boolean).join('\n');
      const contentStr = stepsArr.map(s => s.content).filter(Boolean).join('\n');
      
      const promptText = `អ្នកគឺជាគ្រូបង្រៀនកម្រិតបឋមដ៏ចំណានម្នាក់នៅកម្ពុជា។ 
សូមបង្កើត «${isStudent ? 'សន្លឹកកិច្ចការសិស្ស (Student Worksheet)' : 'សន្លឹកកិច្ចការគ្រូ និងគន្លឹះបង្រៀន (Teacher Guide)'}» ដោយផ្អែកលើកិច្ចតែងការបង្រៀនខាងក្រោមនេះ និងគោរពតាមកម្រិត Bloom's Taxonomy ទាំង៦ (ចងចាំ យល់ វិភាគ អនុវត្ត វាយតម្លៃ បង្កើតថ្មី)។
{មុខវិជ្ជា៖ ${plan.subject}, មេរៀនទី ${plan.lesson}៖ ${plan.lessonTitle}, ថ្នាក់ទី៖ ${plan.grade}, រយៈពេល៖ ${plan.duration}នាទី}

វត្ថុបំណង៖
- វិជ្ជាសម្បទា៖ ${plan.objectives.knowledge}
- បំណិនសម្បទា៖ ${plan.objectives.skills}
- ចរិយាសម្បទា៖ ${plan.objectives.attitude}

ខ្លឹមសារសង្ខេបពីកិច្ចតែងការ៖
${contentStr}

${isStudent ? 'គោលបំណងសន្លឹកកិច្ចការ៖ សម្រាប់ចែកឲ្យសិស្សធ្វើលំហាត់ក្នុងថ្នាក់ ឬយកទៅធ្វើនៅផ្ទះ។\nទម្រង់ទាមទារ៖\n១. ផ្នែកក្បាល៖ មានចន្លោះឲ្យសិស្សបំពេញ ឈ្មោះ, ថ្នាក់, ថ្ងៃខែ, និងកន្លែងដាក់ពិន្ទុ។\n២. ផ្នែកខ្លឹមសារ/លំហាត់៖ ផ្តល់លំហាត់ សំណួរ ឬសកម្មភាព (ដូចជាផ្គូផ្គង, សំណួរពហុជ្រើសរើស, ឬសំណួរត្រិះរិះ) ដែលឆ្លើយតបទៅនឹងវត្ថុបំណង។ រៀបចំឲ្យមានចន្លោះសម្រាប់ឆ្លើយ និងប្រើភាសាងាយយល់ សាកសមនឹងសិស្សកម្រិតនេះ។' : 'គោលបំណងសន្លឹកកិច្ចការគ្រូ៖ សម្រាប់គ្រូកាន់ អំឡុងពេល ឬក្រោយពេលបង្រៀន។\nទម្រង់ទាមទារ៖\n១. កម្រងអត្រាកំណែ (Answer Key) សម្រាប់លំហាត់ទាំងអស់នៅក្នុងសន្លឹកកិច្ចការសិស្ស។\n២. យុទ្ធវិធីបង្រៀន ('+plan.strategy+') និងវិធីសាស្រ្តប្រើប្រាស់។\n៣. គន្លឹះឬសំណួរបំផុស (Guiding Questions) ដែលគ្រូអាចសួរក្នុងថ្នាក់ដើម្បីជួយសិស្ស។\n៤. វិធីសាស្ត្រវាយតម្លៃខ្លីៗ (Formative Assessment) ដើម្បីដឹងថាសិស្សយល់មេរៀនឬអត់។'}

សូមសរសេរចេញជាទម្រង់ Markdown ដែលមានរបៀបរៀបរយល្អ ប្រើប្រាស់តារាង បញ្ជី ឬអក្សរដិត(bold) ឱ្យបានត្រឹមត្រូវ។ មិនបាច់សរសេរពាក្យណែនាំទេ (ដូចជា "នេះជាសន្លឹកកិច្ចការ...") ចាប់ផ្តើមសរសេរយកតែម្តង។`;

      const response = await fetch('/api/generateLessonPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText })
      });
      
      if (!response.ok) throw new Error('Failed to generate worksheet');
      
      const data = await response.json();
      setContent(data.text || '');
    } catch (error) {
      console.error(error);
      setContent('*មានបញ្ហាក្នុងការបង្កើតមាតិកា។ សូមព្យាយាមម្ដងទៀត។*');
    }
    setIsLoading(false);
  };

  const handleExportWord = () => {
    const contentElement = document.getElementById("worksheet-content");
    if (!contentElement) return;

    const clone = contentElement.cloneNode(true) as HTMLElement;
    const hideElements = clone.querySelectorAll('.print\\:hidden');
    hideElements.forEach(el => el.remove());

    const htmlContent = clone.innerHTML;

    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>សន្លឹកកិច្ចការ</title>
      <style>
        body { font-family: 'Khmer OS Siemreap', 'Moul', sans-serif; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
        th { font-family: 'Moul', sans-serif; background-color: #f8fafc; }
        h1 { font-size: 16pt; font-family: 'Moul', sans-serif; text-align: center; }
        h2 { font-size: 14pt; font-weight: bold; }
        h3 { font-size: 12pt; font-weight: bold; }
        ul, ol { margin-left: 20px; }
      </style>
    </head>
    <body>`;
    const postHtml = "</body></html>";
    const html = preHtml + htmlContent + postHtml;

    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword'
    });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `សន្លឹកកិច្ចការ_${type === 'student' ? 'សិស្ស' : 'គ្រូ'}_${plan.lessonTitle || 'ថ្មី'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleDelete = () => {
    setContent('');
    onClose();
  };

  const handleSave = () => {
    // For now, save is just closing since the state is not persisted in LessonPlan, or we can just show a toast.
    alert("រក្សាទុករួចរាល់!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 print:p-0 print:block print:relative print:z-0">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity print:hidden" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl flex flex-col h-[90vh] print:h-auto print:shadow-none print:rounded-none animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 print:hidden rounded-t-3xl rounded-b-none flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'student' ? 'bg-sky-100 text-sky-600' : 'bg-rose-100 text-rose-600'}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 font-khmer">
                {type === 'student' ? 'សន្លឹកកិច្ចការសិស្ស' : 'សន្លឹកកិច្ចការគ្រូ'}
              </h2>
              <p className="text-sm text-slate-500 font-khmer mt-0.5">{plan.subject} - {plan.lessonTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
             <button 
                onClick={generateWorksheet}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold text-slate-700 transition"
              >
                បង្កើតម្ដងទៀត
             </button>
             <button 
                onClick={handleSave}
                disabled={isLoading || !content}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
              >
                រក្សាទុក
             </button>
             <button 
                onClick={handleExportWord}
                disabled={isLoading || !content}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                ទាញយក Word
             </button>
             <button 
                onClick={() => window.print()}
                disabled={isLoading || !content}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                title="ទាញយក PDF (Print)"
              >
                <Printer className="w-4 h-4" /> ទាញយក PDF
             </button>
             <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-bold transition-colors"
              >
                លុប
             </button>
             <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors ml-2"
              >
                <X className="w-5 h-5" />
              </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 bg-slate-100 print:bg-white flex justify-center">
          <div id="worksheet-content" className="bg-white w-full max-w-[210mm] min-h-[297mm] mx-auto p-[1cm] sm:p-[1.5cm] rounded shadow-sm print:shadow-none print:p-0 print:block">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full space-y-4 print:hidden">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                  <p className="text-slate-500 font-khmer">កំពុងបង្កើត{type === 'student' ? 'សន្លឹកកិច្ចការសិស្ស' : 'សន្លឹកកិច្ចការគ្រូ'}...</p>
               </div>
            ) : (
               <div className="font-khmer text-[11pt] leading-relaxed text-slate-800">
                  <div className="markdown-body space-y-3">
                    <Markdown
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-xl font-moul text-center mb-6" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-6 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-base font-bold mt-4 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="mb-3" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-3 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-3 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        table: ({node, ...props}) => <table className="w-full border-collapse border border-slate-300 mb-4" {...props} />,
                        th: ({node, ...props}) => <th className="border border-slate-300 p-2 bg-slate-50 font-bold" {...props} />,
                        td: ({node, ...props}) => <td className="border border-slate-300 p-2" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-300 pl-4 italic text-slate-600 mb-3" {...props} />,
                      }}
                    >
                      {content}
                    </Markdown>
                  </div>
                  
                  {type === 'student' && content && (
                     <div className="mt-16 pt-8 border-t border-dashed border-slate-300 flex justify-between text-slate-400 text-xs italic print:flex text-center">
                        <p>បង្កើតដោយ៖ ប្រព័ន្ធ AI កិច្ចតែងការបង្រៀន</p>
                        <p>សម្រាប់ប្រើប្រាស់នៅក្នុងថ្នាក់រៀន</p>
                     </div>
                  )}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
