import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Sparkles, 
  Save, 
  Download, 
  BookOpen, 
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  Target,
  Layers,
  FileDown
} from 'lucide-react';
import { LessonPlan, Grade, StepContent } from '../types';
interface LessonPlanFormProps {
  onBack: () => void;
}

const INITIAL_PLAN: LessonPlan = {
  grade: 1,
  chapter: '',
  chapterTitle: '',
  lesson: '',
  lessonTitle: '',
  subject: 'ភាសាខ្មែរ',
  methodology: 'ការបង្រៀនតាមបែបសកម្ម',
  strategy: '',
  subTitle: '',
  objectives: {
    knowledge: '',
    skills: '',
    attitude: '',
  },
  materials: {
    teacher: '',
    student: '',
  },
  duration: 40,
  date: 'ថ្ងៃ........ខែ........ឆ្នាំ........អដ្ឋស័ក ព.ស ២០៧០ ត្រូវនឹងថ្ងៃទី........ខែ........ឆ្នាំ........',
  lessonContent: {
    text: '',
  },
  steps: {
    step1: { teacherActivity: '', content: '', studentActivity: '' },
    step2: { teacherActivity: '', content: '', studentActivity: '' },
    step3: { teacherActivity: '', content: '', studentActivity: '' },
    step4: { teacherActivity: '', content: '', studentActivity: '' },
    step5: { teacherActivity: '', content: '', studentActivity: '' },
  },
  references: '',
  teachingMethods: '',
  location: '',
  taughtBy: localStorage.getItem('user_teacher') || '',
};

const parseBlocks = (text: string | null | undefined) => {
  if (!text || text === '...') return [];
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const blocks: string[][] = [];
  let currentBlock: string[] = [];
  
  for (const line of lines) {
    if (line.trim().startsWith('•') || currentBlock.length === 0) {
      if (currentBlock.length > 0) {
        blocks.push([...currentBlock]);
      }
      currentBlock = [line];
    } else {
      currentBlock.push(line);
    }
  }
  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }
  return blocks;
};

const renderBulletedList = (text: string | null | undefined) => {
  if (!text || text === '...') return text || '...';
  // Splitting by \n and trimming spaces at the end, but keeping leading spaces for detection
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return (
    <ul className="space-y-1 text-left w-full">
      {lines.map((line, idx) => {
        const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
        const spaceCount = leadingWhitespace.replace(/\t/g, '  ').length;
        // If it starts with space or explicitly starts with a hyphen after trim
        const isSubBullet = spaceCount > 0 || line.trim().startsWith('-');
        const cleanLine = line.trim().replace(/^[-*•]\s*/, '');
        
        return (
          <li key={idx} className={`flex items-start gap-2 ${isSubBullet ? 'ml-6' : 'ml-0'}`}>
            <span className="shrink-0 mt-[1px] font-bold text-slate-700">{isSubBullet ? '-' : '•'}</span>
            <span className="flex-1">{cleanLine}</span>
          </li>
        );
      })}
    </ul>
  );
};

export default function LessonPlanForm({ onBack }: LessonPlanFormProps) {
  const [plan, setPlan] = useState<LessonPlan>(INITIAL_PLAN);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const promptText = `អ្នកគឺជា «អ្នកជំនាញវិធីសាស្ត្របង្រៀនសតវត្សទី២១» និងជាអ្នករៀបចំកិច្ចតែងការបង្រៀនដ៏មានជំនាញ។ ភារកិច្ចរបស់អ្នកគឺជួយខ្ញុំរៀបចំកិច្ចតែងការបង្រៀន ដោយផ្អែកលើវិធីសាស្ត្រទាំង ៥ ខាងក្រោមនេះឱ្យបានត្រឹមត្រូវតាមស្តង់ដារគរុកោសល្យ៖
      ១. វិធីសាស្ត្ររៀនតាមបែបរិះរក (Inquiry-Based Learning - IBL)៖ ផ្ដើមដោយសំណួរគន្លឹះ ដាស់ការគិត ឱ្យសិស្សស្រាវជ្រាវ រកឃើញចម្លើយ និងឆ្លុះបញ្ចាំង។
      ២. ម៉ូដែលបង្រៀនបែប 5E (5E Model)៖ ត្រូវមាន ៥ ដំណាក់កាលច្បាស់លាស់ (Engagement, Exploration, Explanation, Elaboration, Evaluation)។
      ៣. វិធីសាស្ត្ររៀនតាមបែបដោះស្រាយបញ្ហា (Problem-Based Learning - PBL)៖ ប្រើបញ្ហាក្នុងជីវិតជាក់ស្ដែងជាគោល ឱ្យសិស្សវិភាគ និងស្វែងរកដំណោះស្រាយ។
      ៤. វិធីសាស្ត្ររៀនតាមបែបគម្រោង (Project-Based Learning)៖ ផ្ដោតលើការធ្វើការងាររយៈពេលវែងដើម្បីបង្កើត «ផលិតផលចុងក្រោយ» (Final Product)។
      ៥. បច្ចេកទេសរៀនតាមបែបសហការ (Cooperative Learning)៖ ប្រើបច្ចេកទេសដូចជា Think-Pair-Share, Jigsaw, ឬ Numbered Heads Together។

      ព័ត៌មានអំពីមេរៀន៖
      មុខវិជ្ជា៖ ${plan.subject}
      ថ្នាក់ទី៖ ${plan.grade}
      មេរៀន៖ ${plan.lessonTitle}
      ចំណងជើងរង៖ ${plan.subTitle || ''}
      អត្ថបទមេរៀន៖ ${plan.lessonContent?.text || ''}
      វិធីសាស្ត្រដែលត្រូវជ្រើសរើស៖ ${plan.teachingMethods || 'មិនបានជ្រើសរើស'}

      ចូរអ្នកបង្កើតកិច្ចតែងការបង្រៀនមួយ ដែលលម្អិត ងាយស្រួលអនុវត្តជាក់ស្ដែងក្នុងថ្នាក់រៀន មានការកំណត់ពេលវេលាច្បាស់លាស់ និងបង្ហាញពីសកម្មភាពគ្រូ និងសកម្មភាពសិស្ស (ជាពិសេសសកម្មភាពសកម្មរបស់សិស្ស)។
      
      ចំណាំសំខាន់បំផុតទី១ (វត្ថុបំណងមេរៀន) - IMPORTANT CONSTRAINTS:
      សូមបង្កើតវត្ថុបំណងទាំង៣ (វិជ្ជាសម្បទា, បំណិនសម្បទា, ចរិយាសម្បទា) ដោយផ្អែកលើអត្ថបទមេរៀន ឬរូបភាពដែលបានផ្ដល់ឱ្យ។
      វត្ថុបំណងនីមួយៗ ត្រូវតែសរសេរតាមទម្រង់នេះយ៉ាងតឹងរ៉ឹង៖ 
      [សកម្មភាព (អ្វីដែលធ្វើ)] + [លក្ខខណ្ឌ (ក្នុងស្ថានភាព ឬតាមរយៈអ្វី)] + [លទ្ធផល (កម្រិតរំពឹងទុក)]
      សូមបញ្ចូលលក្ខខណ្ឌ សកម្មភាព និង លទ្ធផល អោយបានត្រឹមត្រូវនិងស៊ីសង្វាក់ពិតប្រាកដ។
      បញ្ជាក់៖ សម្រាប់ "វិជ្ជាសម្បទា" និង "បំណិនសម្បទា" គឺមិនចាំបាច់ដាក់ពាក្យ "សិស្ស" នៅពីមុខឡើយ។ (សូមកុំដាក់ពាក្យ សិស្ស)
      ឧទាហរណ៍៖ "រាប់ចំនួនរូបភាព (សកម្មភាព) ដោយប្រើម្រាមដៃ (លក្ខខណ្ឌ) បានរហ័ស (លទ្ធផល)។"

      ចំណាំសំខាន់បំផុតទី២ (វិធីសាស្ត្របង្រៀនសម្រាប់ជំហានទី៣, ទី៤ និងទី៥):
      ប្រសិនបើឯកសារមានជ្រើសរើសវិធីសាស្ត្របង្រៀន សូមរៀបចំសកម្មភាពគ្រូ ខ្លឹមសារ និងសកម្មភាពសិស្ស ក្នុងជំហានទី៣ ទី៤ និងទី៥ អោយត្រូវតាមក្បួនខ្នាតនៃវិធីសាស្ត្រនោះ យោងតាមមគ្គុទ្ទេសក៍ខាងក្រោម៖
      ១. វិធីសាស្ត្ររៀនតាមបែបរិះរក (IBL):
        - ជំហានទី៣ (Phase: Questioning & Exploration): ចោទសួរសំណួរគន្លឹះ/បាតុភូតចម្លែក ឱ្យសិស្សបង្កើតសម្មតិកម្ម និងរុករក។
        - ជំហានទី៤ (Phase: Explanation & Reflection): សិស្សវិភាគទិន្នន័យ បកស្រាយការរកឃើញ គ្រូសម្របសម្រួលទាញរកខ្លឹមសារគោល។
        - ជំហានទី៥ (Phase: Application): តេស្តការយល់ដឹងជាមួយស្ថានភាពថ្មី ឬកិច្ចការស្រាវជ្រាវបន្ត។
      ២. ម៉ូដែលបង្រៀនបែប 5E:
        - ជំហានទី៣ (Engage, Explore, Explain): ដាស់អារម្មណ៍ សិស្សធ្វើសកម្មភាពផ្ទាល់ដៃ និងពន្យល់ គ្រូជួយកែសម្រួល។
        - ជំហានទី៤ (Elaborate): សិស្សយកចំណេះដឹងថ្មីទៅដោះស្រាយលំហាត់ ឬអនុវត្តក្នុងស្ថានភាពថ្មី។
        - ជំហានទី៥ (Evaluate): ការវាយតម្លៃតាមរយៈសំណួរខ្លី ឬការឆ្លុះបញ្ចាំង។
      ៣. វិធីសាស្ត្ររៀនតាមបែបដោះស្រាយបញ្ហា (PBL):
        - ជំហានទី៣: គ្រូដាក់ស្ថានភាពបញ្ហាជាក់ស្តែង សិស្សវិភាគអ្វីដែលដឹងនិងមិនដឹង ដើម្បីដោះស្រាយបញ្ហា។
        - ជំហានទី៤: តំណាងក្រុមបង្ហាញដំណោះស្រាយ ដេញដោល និងបូកសរុប។
        - ជំហានទី៥: វាយតម្លៃដំណើរការដោះស្រាយបញ្ហា និងផ្តល់បញ្ហាស្រដៀងគ្នាជាកិច្ចការផ្ទះ។
      ៤. វិធីសាស្ត្ររៀនតាមបែបគម្រោង (Project-Based):
        - ជំហានទី៣: ណែនាំសំណួរគន្លឹះ ចែកក្រុម រៀបចំផែនការ និងប្រមូលគំនិត/វត្ថុធាតុដើម។
        - ជំហានទី៤: បង្ហាញវឌ្ឍនភាព/ព្រាង ទទួលមតិស្ថាបនាពីគ្រូនិងមិត្តភក្តិក្រុមកែលម្អ។
        - ជំហានទី៥: វាយតម្លៃតាម Rubric និងណែនាំកិច្ចការបន្តនៅផ្ទះប្រចាំគម្រោង។
      ៥. បច្ចេកទេសរៀនតាមបែបសហការ (Cooperative Learning):
        - ជំហានទី៣: ចែកក្រុម តួនាទីច្បាស់លាស់ (យោង Jigsaw ល) សិស្សធ្វើការពិភាក្សាធានាថាយល់រៀងខ្លួន។
        - ជំហានទី៤: តំណាងក្រុមឡើងឆ្លើយ(ចៃដន្យ) សិស្សធ្វើលំហាត់ពង្រឹងសមត្ថភាពរួមគ្នា។
        - ជំហានទី៥: វាយតម្លៃលទ្ធផលក្រុមនិងបុគ្គលម្នាក់ៗ និងដាក់កិច្ចការផ្ទះ។

      ចំណាំសំខាន់បំផុតទី៣ (ការបំពេញក្រឡោន):
      សូមវែកញែកអត្ថបទមេរៀន ហើយបញ្ចូលទៅក្នុងក្រឡោនទាំង៣ (សកម្មភាពគ្រូ ខ្លឹមសារមេរៀន សកម្មភាពសិស្ស) សម្រាប់គ្រប់ជំហានទាំង៥ (ពីជំហានទី១ ដល់ជំហានទី៥) ដោយស្វ័យប្រវត្តិតាមការទាមទារជាក់ស្ដែងនីមួយៗ ឱ្យបានក្បោះក្បាយ។ ជំហានទី៣ ៤ ៥ ត្រូវតែគោរពតាមវិធីសាស្ត្របង្រៀនខាងលើ។

      ចំណាំសំខាន់បំផុតទី៤ (រចនាសម្ព័ន្ធ Bullet Points ស្វ័យប្រវត្តិក្នុងផ្ទៃអត្ថបទ):
      នៅក្នុងចន្លោះ String នៃ JSON លោកអ្នកត្រូវប្រើគំរូទម្រង់នេះសម្រាប់ការចុះបន្ទាត់និងបំបែកចំណុច៖
      - ចំណុចធំ មិនបាច់ដកឃ្លាទេ (ប្រើ "• ") ។ ប្រសិនបើមានចំណុចតូចៗបន្ត សូមទម្លាក់បន្ទាត់ដោយប្រើ "\n" 
      - ចំណុចតូចៗ (Sub-bullets) សូមប្រើ "\n  - " (ចុះបន្ទាត់រួចដកឃ្លា ២ ដង ហើយមានសញ្ញា -)
      ឧទាហរណ៍ជាក់លាក់សម្រាប់ជំហានទី១៖
      "teacherActivity": "• ត្រួតពិនិត្យ៖\n  - អវត្តមាន\n  - សណ្ដាប់ធ្នាប់\n  - អនាម័យ"
      "content": "• រដ្ឋបាលថ្នាក់៖\n  - អវត្តមាន\n  - សណ្ដាប់ធ្នាប់\n  - អនាម័យ"
      "studentActivity": "• ប្រធានរាយការណ៍៖\n  - អវត្តមាន\n  - សណ្ដាប់ធ្នាប់\n  - អនាម័យ"
      សូមអនុវត្តទម្រង់បែបនេះ គ្រប់ជំហានដែលមានចំណុចនិងចំណុចតូចៗ ដើម្បីឱ្យការបង្ហាញមានរបៀបរៀបរយ។ ចំពោះជំហានទី១ សូមចម្លងតាមគំរូខាងលើទាំងស្រុងជានិច្ច ដោយហាមប្រើពាក្យបន្ថែមផ្សេងៗជារបស់ខ្លួនដូចជា "ក្នុងថ្នាក់" ឬ "និងបរិស្ថានសិក្សា" ដាច់ខាត (ឧ. សណ្ដាប់ធ្នាប់ គឺត្រឹមពាក្យ សណ្ដាប់ធ្នាប់ គឺត្រូវបានហើយ)។

      ចំណាំបន្ថែមសម្រាប់ជំហានទី២ (រចនាសម្ព័ន្ធកាតព្វកិច្ច)៖
      - សកម្មភាពគ្រូ៖ ត្រូវមានចំណុចធំ៣ គឺ "• កំណែ៖" (មានចំណុចតូចៗ), "• គ្រូសួរ៖" (មានចំណុចតូចៗ) និង "• ទំនាក់ទំនងមេរៀនថ្មី៖" (មានចំណុចតូចៗ)
      - ខ្លឹមសារមេរៀន៖ ត្រូវមានចំណុចធំ៣ គឺ "• កែកិច្ចការផ្ទះ៖" (មានចំណុចតូចៗ), "• រំឭកមេរៀនចាស់៖" (មានចំណុចតូចៗ) និង "• ទំនាក់ទំនងមេរៀនថ្មី៖" (មានចំណុចតូចៗ)
      ឧទាហរណ៍៖
      "teacherActivity": "• កំណែ៖\n  - [ចំណុចតូចៗ]\n• គ្រូសួរ៖\n  - [ចំណុចតូចៗ]\n• ទំនាក់ទំនងមេរៀនថ្មី៖\n  - [ចំណុចតូចៗ]"
      "content": "• កែកិច្ចការផ្ទះ៖\n  - [ចំណុចតូចៗ]\n• រំឭកមេរៀនចាស់៖\n  - [ចំណុចតូចៗ]\n• ទំនាក់ទំនងមេរៀនថ្មី៖\n  - [ចំណុចតូចៗ]"

      ចំណាំបន្ថែមសម្រាប់ជំហានទី៤ និងទី៥៖
      - ជំហានទី៤ ក្រឡោនខ្លឹមសារមេរៀន (content)៖ ចំណុចធំ គឺត្រូវដាក់ "• ពង្រឹងចំណេះដឹង៖" បន្ទាប់មកទើបមានចំណុចតូចៗ (-) នៅខាងក្រោម។
      - ជំហានទី៥ ក្រឡោនខ្លឹមសារមេរៀន (content)៖ ត្រូវមានចំណុចធំចំនួន៣ គឺ ១."• កិច្ចការផ្ទះ៖" ២."• កិច្ចការស្រាវជ្រាវ៖" និង ៣."• បណ្ដាំផ្ញើ៖" បន្ទាប់មកទើបមានចំណុចតូចៗ (-) នៅខាងក្រោមចំណុចធំនីមួយៗ។

      ចំណាំសំខាន់បំផុតទី៥ (ការពង្រាយចំណុចធំៗ [•] និងចំណុចតូចៗ [-] ឱ្យស្មើគ្នាគ្រប់ក្រឡោន ពិសេសជំហានទី៣ ទី៤ និងទី៥):
      ដើម្បីឱ្យការបង្ហាញធ្លាក់មកស្មើគ្នា (Parallel alignment) លោកអ្នកត្រូវតែធានាថាចំនួនចំណុចធំៗ (•) នៅក្រឡោនទាំង៣ ("teacherActivity", "content", "studentActivity") ក្នុងជំហាននីមួយៗគឺមានចំនួនស្មើគ្នាបេះបិទ។
      លើសពីនេះ បើចំណុចធំណាមួយមានចំណុចតូចៗទ្រនាប់ (-) នោះក្រឡោនទី២ ឬទី៣ដែលត្រូវគ្នា ក៏ត្រូវតែមានចំណុចធំនិងចំណុចតូចៗនោះដើរទន្ទឹមគ្នា ឬស៊ីសង្វាក់គ្នាដែរ (បើមិនមានសកម្មភាពផ្ទាល់ទេ អាចដាក់ជា "• តាមដាន" និង "- យកចិត្តទុកដាក់" ជាដើម ល្អជាងទុកចោលទទេ ដែលធ្វើឱ្យបាត់ជួរ)។
      ឧទាហរណ៍ជាក់ស្ដែង ក្នុងជំហានទី៣ បើ "teacherActivity" មាន ៣ ចំណុចធំ (•) នោះ "content" និង "studentActivity" ក៏ត្រូវមាន ៣ ចំណុចធំ (•) ដែរ។

      សូមត្រលប់មកវិញតែជាទម្រង់ JSON object string ប៉ុណ្ណោះ ដោយមិនមាន markdown formatting (NO \`\`\`json) ហើយស្របតាមទម្រង់ដូចខាងក្រោម៖
      {
        "chapter": "១",
        "chapterTitle": "ចំណងជើងជំពូក",
        "lesson": "១",
        "objectives": {
          "knowledge": "រៀបរាប់...តាមរយៈ...បានត្រឹមត្រូវ។",
          "skills": "គណនា...ដោយប្រើ...បានរហ័ស។",
          "attitude": "សិស្សមានស្មារតី...ក្នុង...ដោយ...។"
        },
        "materials": {
          "teacher": "សៀវភៅពុម្ព...",
          "student": "សៀវភៅពុម្ព, ប៊ិច..."
        },
        "steps": {
          "step1": { "teacherActivity": "• ត្រួតពិនិត្យ៖\n  - អវត្តមាន\n  - សណ្ដាប់ធ្នាប់\n  - អនាម័យ", "content": "• រដ្ឋបាលថ្នាក់៖\n  - អវត្តមាន\n  - សណ្ដាប់ធ្នាប់\n  - អនាម័យ", "studentActivity": "• ប្រធានរាយការណ៍៖\n  - អវត្តមាន\n  - សណ្ដាប់ធ្នាប់\n  - អនាម័យ" },
          "step2": { "teacherActivity": "...", "content": "...", "studentActivity": "..." },
          "step3": { "teacherActivity": "...", "content": "...", "studentActivity": "..." },
          "step4": { "teacherActivity": "...", "content": "...", "studentActivity": "..." },
          "step5": { "teacherActivity": "...", "content": "...", "studentActivity": "..." }
        }
      }`;

      const response = await fetch('/api/generateLessonPlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText })
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || 'API request failed');
      }
      
      const data = await response.json();
      const text = data.text || '';
      try {
        const cleanedText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanedText);
        
        setPlan(prev => ({
          ...prev,
          chapter: parsed.chapter || prev.chapter,
          chapterTitle: parsed.chapterTitle || prev.chapterTitle,
          lesson: parsed.lesson || prev.lesson,
          objectives: {
            ...prev.objectives,
            ...parsed.objectives
          },
          materials: {
            ...prev.materials,
            ...parsed.materials
          },
          steps: {
            step1: parsed.steps?.step1 || prev.steps.step1,
            step2: parsed.steps?.step2 || prev.steps.step2,
            step3: parsed.steps?.step3 || prev.steps.step3,
            step4: parsed.steps?.step4 || prev.steps.step4,
            step5: parsed.steps?.step5 || prev.steps.step5,
          }
        }));

      } catch (parseError) {
        console.error("Failed to parse JSON result", parseError, text);
        alert("បរាជ័យក្នុងការរៀបចំទម្រង់។ សូមសាកល្បងម្ដងទៀត។");
      } finally {
        setIsGenerating(false);
      }
    } catch (error: any) {
      console.error("AI Generation failed:", error);
      setIsGenerating(false);
      alert(`មានបញ្ហាក្នុងការបង្កើតកិច្ចតែងការ៖ ${error.message || "AI API Error"}`);
    }
  };

  const handleExportWord = (exportTitle?: string) => {
    const contentElement = document.getElementById("lesson-plan-preview");
    if (!contentElement) return;

    // We clone the node to clean it up before exporting
    const clone = contentElement.cloneNode(true) as HTMLElement;
    
    // Remove the photo upload buttons or anything with print:hidden if possible
    const hideElements = clone.querySelectorAll('.print\\:hidden');
    hideElements.forEach(el => el.remove());

    const content = clone.innerHTML;

    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>កិច្ចតែងការ</title>
      <style>
        body { font-family: 'Khmer OS Siemreap', 'Moul', sans-serif; font-size: 11pt; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; vertical-align: top; }
        th { font-family: 'Moul', sans-serif; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
      </style>
    </head>
    <body>`;
    const postHtml = "</body></html>";
    const html = preHtml + content + postHtml;

    const blob = new Blob(['\\ufeff', html], {
      type: 'application/msword'
    });
    const blobUrl = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `កិច្ចតែងការ_${exportTitle || plan.lessonTitle || 'ថ្មី'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  const handleSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlan(prev => ({
          ...prev,
          schoolLogo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold mb-2 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" /> ត្រឡប់ក្រោយ
          </button>
          <h2 className="text-3xl font-black text-slate-800 font-kantumruy">បង្កើតកិច្ចតែងការបង្រៀន</h2>
          <p className="text-slate-500 font-khmer">ប្រើប្រាស់ AI ដើម្បីជំនួយក្នុងការរៀបចំកិច្ចតែងការបានយ៉ាងរហ័ស</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl shadow-slate-100 border border-slate-50 flex flex-col h-[600px] lg:h-[800px]">
             <h3 className="text-lg font-black text-slate-800 border-b pb-4 mb-4 flex items-center gap-2 shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-500" /> ព័ត៌មានទូទៅ
             </h3>
             
             <div className="space-y-4 overflow-y-auto flex-grow pr-2 no-scrollbar mb-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">កាលបរិច្ឆេទ</label>
                  <textarea value={plan.date} onChange={e => setPlan({...plan, date: e.target.value})} placeholder="ថ្ងៃ...ខែ...ឆ្នាំ...អដ្ឋស័ក ព.ស ២០៧០ ត្រូវនឹងថ្ងៃទី...ខែ...ឆ្នាំ..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer min-h-[80px] resize-none" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">មុខវិជ្ជា</label>
                    <select value={plan.subject} onChange={e => setPlan({...plan, subject: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer font-bold">
                      <option>ភាសាខ្មែរ</option>
                      <option>គណិតវិទ្យា</option>
                      <option>វិទ្យាសាស្ត្រ</option>
                      <option>សិក្សាសង្គម</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">កម្រិតថ្នាក់</label>
                    <select value={plan.grade} onChange={e => setPlan({...plan, grade: parseInt(e.target.value) as Grade})} className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer font-bold">
                      {[1,2,3,4,5,6].map(g => <option key={g} value={g}>ថ្នាក់ទី {g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ជំពូកទី</label>
                    <input type="text" value={plan.chapter} onChange={e => setPlan({...plan, chapter: e.target.value})} placeholder="ឧ. ១" className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">មេរៀនទី</label>
                    <input type="text" value={plan.lesson} onChange={e => setPlan({...plan, lesson: e.target.value})} placeholder="ឧ. ១" className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ចំណងជើងជំពូក</label>
                  <input type="text" value={plan.chapterTitle} onChange={e => setPlan({...plan, chapterTitle: e.target.value})} placeholder="ឧ. ការស្វាគមន៍" className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ចំណងជើងមេរៀន</label>
                  <input type="text" value={plan.lessonTitle} onChange={e => setPlan({...plan, lessonTitle: e.target.value})} placeholder="ឧ. ការប្រើប្រាស់ពាក្យ..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">អត្ថបទមេរៀន</label>
                  <textarea value={plan.lessonContent?.text || ''} onChange={e => setPlan({...plan, lessonContent: {...plan.lessonContent, text: e.target.value}})} placeholder="បញ្ចូលអត្ថបទមេរៀនសង្ខេបដើម្បីឱ្យ AI ជំនួយការបង្កើតវត្ថុបំណង..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer min-h-[80px]" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ឡូហ្គូសាលា (បើមាន)</label>
                  <input type="file" accept="image/*" onChange={handleSchoolLogoUpload} className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer text-sm" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ចំណងជើងរង</label>
                  <input type="text" value={plan.subTitle} onChange={e => setPlan({...plan, subTitle: e.target.value})} placeholder="ចំណងជើងរង (បើមាន)..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">រយៈពេល (នាទី)</label>
                    <input type="number" value={plan.duration} onChange={e => setPlan({...plan, duration: parseInt(e.target.value) || 40})} className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ទីកន្លែង</label>
                    <input type="text" value={plan.location || ''} onChange={e => setPlan({...plan, location: e.target.value})} placeholder="បន្ទប់..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">វិធីសាស្រ្តបង្រៀន</label>
                  <div className="relative">
                     <select 
                       value={plan.teachingMethods || ''} 
                       onChange={e => setPlan({...plan, teachingMethods: e.target.value})} 
                       className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer appearance-none"
                     >
                       <option value="">-- សូមជ្រើសរើសវិធីសាស្ត្រ --</option>
                       <option value="វិធីសាស្ត្ររៀនតាមបែបរិះរក (Inquiry-Based Learning - IBL)">វិធីសាស្ត្ររៀនតាមបែបរិះរក (Inquiry-Based Learning - IBL)</option>
                       <option value="ម៉ូដែលបង្រៀនបែប 5E (5E Instructional Model)">ម៉ូដែលបង្រៀនបែប 5E (5E Instructional Model)</option>
                       <option value="វិធីសាស្ត្ររៀនតាមបែបដោះស្រាយបញ្ហា (Problem-Based Learning - PBL)">វិធីសាស្ត្ររៀនតាមបែបដោះស្រាយបញ្ហា (Problem-Based Learning - PBL)</option>
                       <option value="វិធីសាស្ត្ររៀនតាមបែបគម្រោង (Project-Based Learning)">វិធីសាស្ត្ររៀនតាមបែបគម្រោង (Project-Based Learning)</option>
                       <option value="បច្ចេកទេសរៀនតាមបែបសហការ (Cooperative Learning Techniques)">បច្ចេកទេសរៀនតាមបែបសហការ (Cooperative Learning Techniques)</option>
                     </select>
                     <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                       <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                     </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">ឯកសារ</label>
                  <input type="text" value={plan.references || ''} onChange={e => setPlan({...plan, references: e.target.value})} placeholder="ឧ. សៀវភៅពុម្ព..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer" />
                </div>
                
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2 block">បង្រៀនដោយ</label>
                  <input type="text" value={plan.taughtBy || ''} onChange={e => setPlan({...plan, taughtBy: e.target.value})} placeholder="ឈ្មោះគ្រូ..." className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 font-khmer font-bold text-indigo-700" />
                </div>
             </div>

             <button 
               onClick={handleGenerateAI}
               disabled={isGenerating || !plan.lessonContent?.text}
               className="w-full py-4 shrink-0 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
             >
               {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
               {isGenerating ? 'កំពុងបង្កើត...' : 'AI បង្កើតកិច្ចតែងការ'}
             </button>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-2 print:col-span-full bg-slate-100 p-4 md:p-8 rounded-[3rem] flex justify-center print:bg-transparent print:p-0">
           <div id="lesson-plan-preview" className="bg-white px-[1.5cm] py-[1.5cm] rounded flex flex-col shadow-xl min-h-[297mm] w-full max-w-[210mm] print:shadow-none print:rounded-none print:p-0 print:w-[210mm] mx-auto">
              <div className="flex justify-between items-start mb-8">
                 {/* Left: Ministry Logo & School Name */}
                 <div className="flex flex-col items-center justify-center text-center">
                    <img 
                      src={plan.schoolLogo || "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/MoEYS_Logo.svg/240px-MoEYS_Logo.svg.png"} 
                      alt="School Logo" 
                      className="w-16 h-16 object-contain mb-2" 
                    />
                    <h2 className="text-[11pt] font-moul text-black">
                       {localStorage.getItem('user_school') || 'សាលាបឋមសិក្សាព្រែកទាល់'}
                    </h2>
                 </div>
                 
                 {/* Right: Nation, Religion, King */}
                 <div className="flex flex-col items-center">
                    <h2 className="text-[12pt] font-moul text-blue-800">ព្រះរាជាណាចក្រកម្ពុជា</h2>
                    <h2 className="text-[12pt] font-moul text-blue-800 mt-1">ជាតិ សាសនា ព្រះមហាក្សត្រ</h2>
                 </div>
              </div>
              <div className="border-b border-slate-200 pb-4 mb-6 text-center space-y-2">
                 <h1 className="text-xl md:text-2xl font-moul text-red-600">កិច្ចតែងការបង្រៀន</h1>
              </div>

              <div className="mb-6 font-khmer text-sm md:text-[11pt] leading-relaxed text-slate-800">
                 <ul className="list-disc pl-5 space-y-2">
                    <li><span className="font-bold">កាលបរិច្ឆេទ៖</span> {plan.date}</li>
                    <li><span className="font-bold">មុខវិជ្ជា៖</span> {plan.subject}</li>
                    <li><span className="font-bold">ជំពូកទី {plan.chapter}៖</span> {plan.chapterTitle}</li>
                    <li>
                       <span className="font-bold">មេរៀនទី {plan.lesson}៖</span> {plan.lessonTitle}
                    </li>
                    {plan.subTitle && <li><span className="font-bold">ចំណងជើងរង៖</span> {plan.subTitle}</li>}
                    <li><span className="font-bold">រយៈពេល៖</span> {plan.duration} នាទី</li>
                    <li><span className="font-bold">ឯកសារ៖</span> {plan.references}</li>
                    <li><span className="font-bold">វិធីសាស្ត្របង្រៀន៖</span> {plan.teachingMethods}</li>
                    <li><span className="font-bold">ទីកន្លែង៖</span> {plan.location}</li>
                    <li><span className="font-bold">បង្រៀនដោយ៖</span> {plan.taughtBy}</li>
                 </ul>
              </div>

              <div className="flex-grow space-y-8 print:overflow-visible print:max-h-none print:pr-0">
                 <section className="space-y-4">
                    <h4 className="text-lg font-moul text-slate-800">
                       ១. វត្ថុបំណងមេរៀន
                    </h4>
                    <div className="font-khmer text-[11pt] text-slate-800 leading-relaxed">
                       <ul className="list-disc pl-8 space-y-2">
                          <li><span className="font-bold">វិជ្ជាសម្បទា៖</span> {plan.objectives.knowledge || '...'}</li>
                          <li><span className="font-bold">បំណិនសម្បទា៖</span> {plan.objectives.skills || '...'}</li>
                          <li><span className="font-bold">ចរិយាសម្បទា៖</span> {plan.objectives.attitude || '...'}</li>
                       </ul>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h4 className="text-lg font-moul text-slate-800">
                       ២. សម្ភារបង្រៀន
                    </h4>
                    <div className="font-khmer text-[11pt] text-slate-800 leading-relaxed">
                       <ul className="list-disc pl-8 space-y-2">
                          <li><span className="font-bold">សម្រាប់គ្រូ៖</span> {plan.materials.teacher || '...'}</li>
                          <li><span className="font-bold">សម្រាប់សិស្ស៖</span> {plan.materials.student || '...'}</li>
                       </ul>
                    </div>
                 </section>

                 <section className="space-y-4">
                    <h4 className="text-lg font-moul text-slate-800">
                       ៣. ដំណើរបង្រៀន
                    </h4>
                    <div className="overflow-hidden border border-slate-200 rounded-xl">
                       <table className="w-full text-left border-collapse">
                          <thead>
                             <tr className="bg-slate-100 text-blue-800 font-bold font-khmer text-[12pt]">
                                <th className="border-b border-r border-slate-200 p-3 w-1/3 text-center">សកម្មភាពគ្រូ</th>
                                <th className="border-b border-r border-slate-200 p-3 w-1/3 text-center">ខ្លឹមសារមេរៀន</th>
                                <th className="border-b border-slate-200 p-3 w-1/3 text-center">សកម្មភាពសិស្ស</th>
                             </tr>
                          </thead>
                          <tbody className="text-sm font-khmer text-slate-800">
                             {Object.entries(plan.steps).map(([key, step], idx) => {
                                const tBlocks = parseBlocks(step.teacherActivity);
                                const cBlocks = parseBlocks(step.content);
                                const sBlocks = parseBlocks(step.studentActivity);
                                const maxBlocks = Math.max(tBlocks.length, cBlocks.length, sBlocks.length, 1);

                                return (
                                <React.Fragment key={key}>
                                   <tr className="bg-blue-50">
                                      <td colSpan={3} className="border-b border-slate-200 p-2 font-bold text-center text-blue-800">
                                         ជំហានទី {idx + 1}
                                      </td>
                                   </tr>
                                   {Array.from({length: maxBlocks}).map((_, bIdx) => {
                                      const isLast = bIdx === maxBlocks - 1;
                                      return (
                                       <tr key={`${key}-${bIdx}`}>
                                          <td className={`border-r border-slate-200 p-3 align-top ${isLast ? 'border-b' : ''}`}>
                                             {tBlocks[bIdx] ? renderBulletedList(tBlocks[bIdx].join('\n')) : (bIdx === 0 && (!step.teacherActivity || step.teacherActivity === '...') ? '...' : null)}
                                          </td>
                                          <td className={`border-r border-slate-200 p-3 align-top ${isLast ? 'border-b' : ''}`}>
                                             {cBlocks[bIdx] ? renderBulletedList(cBlocks[bIdx].join('\n')) : (bIdx === 0 && (!step.content || step.content === '...') ? '...' : null)}
                                          </td>
                                          <td className={`border-slate-200 p-3 align-top ${isLast ? 'border-b' : ''}`}>
                                             {sBlocks[bIdx] ? renderBulletedList(sBlocks[bIdx].join('\n')) : (bIdx === 0 && (!step.studentActivity || step.studentActivity === '...') ? '...' : null)}
                                          </td>
                                       </tr>
                                      );
                                   })}
                                </React.Fragment>
                                );
                             })}
                          </tbody>
                       </table>
                    </div>
                 </section>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex justify-end gap-3 print:hidden flex-wrap">
                 <button onClick={() => handleExportWord()} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-100 transition-all">
                    <FileDown className="w-5 h-5" /> ទាញយកជា Word (DOC)
                 </button>
                 <button onClick={() => window.print()} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-200 transition-all">
                    <Download className="w-5 h-5" /> ទាញយកជា PDF
                 </button>
                 <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black flex items-center gap-2 shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                    <Save className="w-5 h-5" /> រក្សាទុក
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
