import React, { useState, useEffect } from 'react';
import { X, Presentation, Download, Loader2 } from 'lucide-react';
import { LessonPlan } from '../types';
import pptxgen from 'pptxgenjs';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  plan: LessonPlan;
}

interface SlideData {
  title: string;
  subtitle?: string;
  content: string[];
  type: 'intro' | 'content' | 'activity' | 'summary';
}

export default function SlideGeneratorModal({ isOpen, onClose, plan }: Props) {
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && !hasGenerated) {
      const storageKey = `slides_${plan.lessonTitle || 'draft'}`;
      const savedSlides = localStorage.getItem(storageKey);
      if (savedSlides) {
        try {
          setSlides(JSON.parse(savedSlides));
          setHasGenerated(true);
        } catch (e) {
          generateSlideOutline();
          setHasGenerated(true);
        }
      } else {
        generateSlideOutline();
        setHasGenerated(true);
      }
    }
  }, [isOpen]);

  const generateSlideOutline = async () => {
    setIsLoading(true);
    try {
      const stepsArr = Object.values(plan.steps);
      const contentStr = stepsArr.map(s => s.content).filter(Boolean).join('\n');
      
      const promptText = `អ្នកគឺជាអ្នកបង្កើតស្លាយបទបង្ហាញដ៏ចំណានម្នាក់។ សូមប្រែសម្រួលកិច្ចតែងការបង្រៀននេះទៅជាស្លាយបទបង្ហាញដ៏ទាក់ទាញ (Presentation Outline)។
ម៉ោងសិក្សា៖ ${plan.subject}, មេរៀន៖ ${plan.lessonTitle}, ថ្នាក់ទី៖ ${plan.grade}

ខ្លឹមសារមេរៀនពីកិច្ចតែងការ៖
${contentStr}

សូមបង្កើតជាស្លាយបទបង្ហាញ ដោយយកតាមលំដាប់លំដោយនៃខ្លឹមសារមេរៀនពីកិច្ចតែងការខាងលើ (ពិសេសផ្តោតលើមេរៀនថ្មី និងសកម្មភាពពង្រឹងចំណេះដឹង)។
សូមបង្កើតជាទម្រង់ JSON Array ដោយមិនមានពាក្យណែនាំអ្វីផ្សេង ដូចទម្រង់ខាងក្រោម៖
[
  {
    "title": "ចំណងជើងស្លាយ",
    "subtitle": "ចំណងជើងរង (មានឬគ្មានក៏បាន)",
    "content": ["ចំណុចទី១", "ចំណុចទី២", "ចំណុចខ្លីៗនីមួយៗអោយខ្លីៗ ច្បាស់ៗ"],
    "type": "intro" | "content" | "activity" | "summary"
  }
]

ចំណាំ៖ type "intro" សម្រាប់ស្លាយដំបូង, "content" សម្រាប់ខ្លឹមសារមេរៀន, "activity" សម្រាប់លំហាត់ឬសកម្មភាព, "summary" សម្រាប់សរុបមេរៀនបិទបញ្ចប់។`;

      const response = await fetch('/api/generateLessonPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText, isJson: true })
      });
      
      if (!response.ok) throw new Error('Failed to generate slides outline');
      
      const data = await response.json();
      let text = data.text || '';
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        text = match[0];
      }
      const parsedSlides = JSON.parse(text);
      setSlides(parsedSlides);
    } catch (error) {
      console.error(error);
      alert('មានបញ្ហាក្នុងការបង្កើតស្លាយ។ សូមព្យាយាមម្ដងទៀត។');
    }
    setIsLoading(false);
  };

  const handleDownloadPPTX = async () => {
    setIsDownloading(true);
    try {
      let pres = new pptxgen();
      pres.author = 'AI Lesson Plan';
      pres.company = 'MoEYS';
      pres.title = plan.lessonTitle;

      // Color Palette inspired by modern, clean 'Canva' look
      const colors = {
        primary: '4F46E5',    // Indigo 600
        secondary: '10B981',  // Emerald 500
        accent: 'F59E0B',     // Amber 500
        dark: '1E293B',       // Slate 800
        light: 'F8FAFC',      // Slate 50
        white: 'FFFFFF'
      };

      // Define Master Slides
      pres.defineSlideMaster({
        title: 'MASTER_INTRO',
        background: { color: colors.primary },
        objects: [
          {
            rect: { x: 0, y: '70%', w: '100%', h: '30%', fill: { color: colors.white } }
          },
          {
            text: {
              text: 'បង្កើតដោយប្រព័ន្ធ AI',
              options: { x: 0.5, y: '90%', w: 3, h: 0.5, fontFace: 'Khmer OS', fontSize: 12, color: colors.primary, bold: true }
            }
          }
        ]
      });

      pres.defineSlideMaster({
        title: 'MASTER_CONTENT',
        background: { color: colors.light },
        objects: [
          {
            rect: { x: 0, y: 0, w: '100%', h: '15%', fill: { color: colors.primary } }
          },
          {
            rect: { x: 0, y: '95%', w: '100%', h: '5%', fill: { color: colors.primary } }
          }
        ]
      });

      pres.defineSlideMaster({
        title: 'MASTER_ACTIVITY',
        background: { color: colors.white },
        objects: [
          {
            rect: { x: '5%', y: '5%', w: '90%', h: '90%', fill: { color: 'ECFDF5' }, line: { color: colors.secondary, width: 2 } } // Light emerald bg
          }
        ]
      });

      pres.defineSlideMaster({
        title: 'MASTER_SUMMARY',
        background: { color: colors.dark },
        objects: [
           {
             rect: { x: '50%', y: 0, w: '50%', h: '100%', fill: { color: colors.accent } }
           }
        ]
      });

      slides.forEach((slide) => {
        let presSlide;
        if (slide.type === 'intro') {
          presSlide = pres.addSlide({ masterName: 'MASTER_INTRO' });
          presSlide.addText(slide.title, {
            x: 1, y: 1.5, w: 8, h: 1.5, align: 'center', fontSize: 44, bold: true, color: colors.white, fontFace: 'Khmer OS Muol Light'
          });
          if (slide.subtitle) {
             presSlide.addText(slide.subtitle, {
               x: 1, y: 3, w: 8, h: 1, align: 'center', fontSize: 24, color: 'E0E7FF', fontFace: 'Khmer OS Battambang'
             });
          }
        } 
        else if (slide.type === 'activity') {
          presSlide = pres.addSlide({ masterName: 'MASTER_ACTIVITY' });
          presSlide.addText(slide.title, {
            x: 1, y: 0.8, w: 8, h: 1, align: 'center', fontSize: 36, bold: true, color: colors.secondary, fontFace: 'Khmer OS Muol Light'
          });
          
          let contentText = slide.content.map(c => `• ${c}`).join('\n\n');
          presSlide.addText(contentText, {
            x: 1.5, y: 2.2, w: 7, h: 3, fontSize: 24, color: colors.dark, fontFace: 'Khmer OS Battambang', align: 'left', bullet: false
          });
        }
        else if (slide.type === 'summary') {
          presSlide = pres.addSlide({ masterName: 'MASTER_SUMMARY' });
          presSlide.addText(slide.title, {
            x: 0.5, y: 2, w: 4, h: 1.5, align: 'left', fontSize: 40, bold: true, color: colors.white, fontFace: 'Khmer OS Muol Light'
          });
          let contentText = slide.content.map(c => `• ${c}`).join('\n');
          presSlide.addText(contentText, {
            x: 5.5, y: 1.5, w: 4, h: 3, fontSize: 22, color: colors.white, fontFace: 'Khmer OS Battambang', align: 'left'
          });
        }
        else {
          // Default Content Slide
          presSlide = pres.addSlide({ masterName: 'MASTER_CONTENT' });
          presSlide.addText(slide.title, {
            x: 0.5, y: 0.1, w: 8, h: 0.6, align: 'left', fontSize: 28, bold: true, color: colors.white, fontFace: 'Khmer OS Battambang'
          });
          if (slide.content && slide.content.length > 0) {
            let contentText = slide.content.map(c => c).join('\n\n');
            presSlide.addText(contentText, {
              x: 0.5, y: 1.5, w: 9, h: 3.5, fontSize: 22, color: colors.dark, fontFace: 'Khmer OS Battambang', align: 'left', bullet: true, color: colors.dark
            });
          }
        }
      });

      await pres.writeFile({ fileName: `Lesson_${plan.lessonTitle}_Presentation.pptx` });

    } catch (error) {
      console.error(error);
      alert('មានបញ្ហាក្នុងការទាញយកស្លាយបទបង្ហាញ។');
    }
    setIsDownloading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 print:hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 rounded-t-3xl rounded-b-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100 text-violet-600">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 font-khmer">បង្កើតស្លាយមេរៀន (PowerPoint)</h2>
              <p className="text-sm text-slate-500 font-khmer mt-0.5">{plan.subject} - {plan.lessonTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
             <button 
                onClick={generateSlideOutline}
                disabled={isLoading || isDownloading}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-bold text-slate-700 transition"
              >
                ចងក្រងម្ដងទៀត
             </button>
             <button 
                onClick={() => {
                  const storageKey = `slides_${plan.lessonTitle || 'draft'}`;
                  localStorage.setItem(storageKey, JSON.stringify(slides));
                  setIsSaving(true);
                  setTimeout(() => setIsSaving(false), 2000);
                }}
                disabled={isLoading || slides.length === 0 || isSaving}
                className={`px-4 py-2 text-white rounded-lg text-sm font-bold transition disabled:opacity-50 ${isSaving ? 'bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {isSaving ? 'បានរក្សាទុក' : 'រក្សាទុក'}
             </button>
             <button 
                onClick={handleDownloadPPTX}
                disabled={isLoading || isDownloading || slides.length === 0}
                className="px-4 py-2 flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} ទាញយក PPTX
             </button>
             <button 
                onClick={() => window.print()}
                disabled={isLoading || slides.length === 0}
                className="px-4 py-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition disabled:opacity-50"
              >
                ទាញយក PDF
             </button>
             <button 
                onClick={() => { setSlides([]); onClose(); }}
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

        {/* Content Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-violet-500" />
                  <p className="text-slate-500 font-khmer">AI កំពុងរៀបរចនាសម្ព័ន្ធស្លាយបទបង្ហាញ...</p>
               </div>
            ) : slides.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {slides.map((slide, index) => (
                   <div key={index} className={`aspect-video rounded-xl shadow-md overflow-hidden border border-slate-200 flex flex-col ${slide.type === 'intro' ? 'bg-indigo-600 text-white' : slide.type === 'summary' ? 'bg-slate-800 text-white' : slide.type === 'activity' ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
                     {/* Preview Slide Header */}
                     <div className={`px-4 border-b py-2 ${slide.type === 'intro' ? 'border-indigo-500' : slide.type === 'summary' ? 'border-slate-700' : 'border-slate-100 bg-slate-50'}`}>
                       <div className={`text-xs font-bold ${slide.type === 'intro' ? 'text-indigo-200' : slide.type === 'summary' ? 'text-slate-400' : 'text-slate-400'}`}>ស្លាយទី {index + 1} - {slide.type.toUpperCase()}</div>
                     </div>
                     {/* Preview Slide Body */}
                     <div className="p-4 flex-1 flex flex-col justify-center">
                       <h3 className={`font-moul mb-2 ${slide.type === 'intro' ? 'text-xl text-center' : slide.type === 'summary' ? 'text-lg' : 'text-lg text-slate-800'}`}>
                         {slide.title}
                       </h3>
                       {slide.subtitle && (
                         <p className={`text-sm text-center mb-4 ${slide.type === 'intro' ? 'text-indigo-200' : 'text-slate-500'}`}>{slide.subtitle}</p>
                       )}
                       {slide.content && slide.content.length > 0 && (
                         <ul className={`list-disc pl-5 text-sm space-y-1 ${slide.type === 'intro' ? 'text-indigo-100' : slide.type === 'summary' ? 'text-slate-300' : 'text-slate-600'}`}>
                           {slide.content.map((item, i) => (
                             <li key={i}>{item}</li>
                           ))}
                         </ul>
                       )}
                     </div>
                   </div>
                 ))}
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 font-khmer">
                  មិនទាន់មានទិន្នន័យស្លាយ។ សូមចុច "ចងក្រងម្ដងទៀត"។
               </div>
            )}
        </div>
      </div>
    </div>
  );
}
