import React, { useState } from 'react';
import { X, BookOpen, Layers, Target } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TEACHING_METHODS = [
  { name: "វិធីសាស្ត្ររៀនតាមបែបរិះរក (Inquiry-Based Learning - IBL)", desc: "ជំរុញឱ្យសិស្សចោទសួរ ស៊ើបអង្កេត ស្វែងរកចម្លើយដោយខ្លួនឯងជាជាងការប្រាប់ចំៗ។" },
  { name: "ម៉ូដែលបង្រៀនបែប 5E (5E Instructional Model)", desc: "វដ្តនៃការរៀនសូត្រ៥ជំហានដែលរួមមាន៖ ទាក់ទាញចំណាប់អារម្មណ៍(Engage), ស្វែងយល់(Explore), ពន្យល់និងស្រាយបញ្ជាក់(Explain), ពង្រីកចំណេះដឹង(Elaborate), និង វាយតម្លៃ(Evaluate)។" },
  { name: "វិធីសាស្ត្ររៀនតាមបែបដោះស្រាយបញ្ហា (Problem-Based Learning - PBL)", desc: "ដាក់បញ្ហាជាក់ស្តែង ឬស៊ីជម្រៅឱ្យសិស្សដោះស្រាយដើម្បីរៀនគំនិតថ្មី និងវិធីសាស្រ្តអនុវត្ត។" },
  { name: "វិធីសាស្ត្ររៀនតាមបែបគម្រោង (Project-Based Learning)", desc: "សិស្សរៀនតាមរយៈការធ្វើគម្រោង និងស្រាវជ្រាវរយៈពេលវែងដើម្បីដោះស្រាយបញ្ហា ឬឆ្លើយតបសំណួរស្មុគស្មាញ។" },
  { name: "បច្ចេកទេសរៀនតាមបែបសហការ (Cooperative Learning Techniques)", desc: "សិស្សធ្វើការជាក្រុមតូចៗ ជួយគ្នាទៅវិញទៅមកដើម្បីសម្រេចគោលដៅរួម និងធានាថាសមាជិកទាំងអស់យល់មេរៀន។" },
  { name: "ថ្នាក់រៀនត្រឡប់ (Flipped Classroom)", desc: "សិស្សរៀនមេរៀនថ្មីនៅផ្ទះជាមុន (តាមវីដេអូ ឬឯកសារ) ឯពេលវេលាក្នុងថ្នាក់គឺសម្រាប់ធ្វើលំហាត់ ពិភាក្សា និងអនុវត្តជាក់ស្ដែងមានការណែនាំពីគ្រូ។" },
  { name: "ការសិក្សាតាមបទពិសោធន៍ (Experiential Learning)", desc: "ការរៀនតាមរយៈការធ្វើផ្ទាល់ និងការឆ្លុះបញ្ចាំងពីបទពិសោធន៍ដែលទទួលបាន (Learning by doing)។" },
  { name: "វិធីសាស្រ្តសូក្រាត (Socratic Method)", desc: "ការបង្រៀនតាមរយៈការការសួរសំណួរដេញដោល និងឆ្លើយតបជាបន្តបន្ទាប់ ដើម្បីជំរុញការគិតស៊ីជម្រៅរបស់សិស្ស។" },
  { name: "ការរៀនផ្អែកលើល្បែង (Game-Based Learning)", desc: "ការប្រើប្រាស់ល្បែងអប់រំដើម្បីទាក់ទាញចំណាប់អារម្មណ៍ ការប្រកួតប្រជែងវិជ្ជមាន និងការយល់ដឹងកាន់តែប្រសើរ។" }
];

const TEACHING_STRATEGIES = [
  { name: "ការគិត-ចាប់គូ-ចែករំលែក (Think-Pair-Share)", desc: "សិស្សគិតម្នាក់ឯងជាមុន បន្ទាប់មកចាប់គូពិភាក្សា រួចទើបចែករំលែកសេចក្តីសន្និដ្ឋានប្រាប់ពេញមួយថ្នាក់។" },
  { name: "វិធីសាស្រ្តជីកស ឬ ការផ្គុំចំណេះដឹង (Jigsaw Technique)", desc: "សិស្សម្នាក់ៗរៀនមួយផ្នែកនៃមេរៀន (ជាអ្នកឯកទេស) រួចត្រលប់មកវិញបង្រៀនប្រាប់សមាជិកក្រុមដើមរបស់ខ្លួនតាមវគ្គផ្គុំបញ្ជូលគ្នា។" },
  { name: "ការបំផុសគំនិត (Brainstorming)", desc: "ការឱ្យសិស្សបញ្ចេញគំនិតឱ្យបានច្រើនបំផុត ជុំវិញប្រធានបទណាមួយ ដោយមិនទាន់មានការវាយតម្លៃខុសត្រូវ។" },
  { name: "ការដើរមើលវិចិត្រសាល (Gallery Walk)", desc: "ការងារក្រុមរៀបចំជាផ្ទាំងៗបិទជុំវិញថ្នាក់ រួចសិស្សផ្សេងៗដើរមើល អាន និងការផ្ដល់មតិត្រឡប់ (feedback) ដូចដើរមើលគំនូរក្នុងវិចិត្រសាល។" },
  { name: "ការដើរតួ ឬ ការលេងតួ (Role-playing)", desc: "សិស្សសម្ដែងជាតួអង្គក្នុងស្ថានភាពណាមួយដើម្បីយល់ពីបញ្ហា ដំណោះស្រាយ កាន់តែច្បាស់ និងជាក់ស្តែង។" },
  { name: "ការជជែកដេញដោល (Debate)", desc: "ការពិភាក្សាចែកជាពីរក្រុមតទល់គ្នា ការពារទឡ្ហីករណ៍របស់ខ្លួនដោយមានហេតុផលនិងភស្តុតាងច្បាស់លាស់។" },
  { name: "ផែនទីគំនិត (Mind Mapping)", desc: "ការគូរគំនូសបំព្រួញមេរៀនដោយប្រើពាក្យគន្លឹះ រូបភាព និងគំនូសភ្ជាប់គ្នាដើម្បីមេីលឃើញទំនាក់ទំនងនៃអត្ថន័យ។" },
  { name: "ការបង្រៀនដោយមិត្តភក្តិ (Peer Teaching)", desc: "សិស្សដែលចេះច្បាស់ ឬយល់លឿន ជួយបង្រៀនឬពន្យល់បន្តទៅកាន់មិត្តភក្តិដែលមិនទាន់យល់។" },
  { name: "ការសិក្សាករណី (Case Study)", desc: "ការវិភាគ និងដោះស្រាយទិដ្ឋភាពជាក់ស្តែង ឬព្រឹត្តិការណ៍ពិត ដើម្បីស្វែងរកដំណោះស្រាយសមស្រប។" },
  { name: "ការអនុវត្តផ្ទាល់ (Hands-on Activity)", desc: "ការអនុវត្តជាក់ស្ដែង ប៉ះពាល់មុខសញ្ញាផ្ទាល់ ដូចជាការពិសោធន៍ ធ្វើសិប្បកម្ម ឬការងារប្រតិបត្តិ។" },
  { name: "ការពិភាក្សាបែបអាងត្រី (Fishbowl Discussion)", desc: "សិស្សមួយក្រុមតូចអង្គុយពិភាក្សានៅកណ្តាលចាំជជែកគ្នា ចំណែកសិស្សអ្នកក្រៅវង់ចាំស្ដាប់ កត់ត្រា និងអាចប្តូរវេនចូលបាន។" },
  { name: "ការពិភាក្សាបែបដុំព្រិល (Snowballing Discussion)", desc: "សិស្សផ្តើមពិភាក្សាជាគូ រួចច្របាច់បញ្ចូលគ្នាជា៤នាក់ ៨នាក់ ធំទៅៗរហូតដល់ពេញមួយថ្នាក់ដូចដុំព្រិល។" },
  { name: "សិក្ខាសាលាសូក្រាត (Socratic Seminar)", desc: "ការពិភាក្សាជាក្រុមធំជុំវិញការអានអត្ថបទណាមួយ ដោយសួរសំណួរបើកទូលាយ ដើម្បីស្វែងរកអត្ថន័យនិងការពិតតាមការសួរនិងឆ្លើយ។" },
  { name: "ការឆ្លើយវិលជុំ ឬ តុរាងរង្វង់ (Round Robin / Round Table)", desc: "សមាជិកនីមួយៗក្នុងក្រុមត្រូវឆ្លើយ ឬបញ្ចេញគំនិត ឬសរសេរឆ្លើយតបម្តងម្នាក់តាមវេនវិលជុំ។" },
  { name: "មួកគិតទាំង៦ (Six Thinking Hats)", desc: "តម្រូវឱ្យសិស្សគិតនិងវាយតម្លៃបញ្ហាមួយជ្រុងម្ដងៗ តាមរយៈការពាក់មួកនិម្មិតពណ៌ខុសៗគ្នា (អារម្មណ៍ អវិជ្ជមាន វិជ្ជមាន គំនិតច្នៃប្រឌិត ។ល។)។" },
  { name: "ការធ្វើត្រាប់តាម ឬ ក្លែងធ្វើ (Simulation)", desc: "ការបង្កើតបរិយាកាសនិម្មិត និងលក្ខខណ្ឌដូចពិតៗ ដើម្បីឱ្យសិស្សអនុវត្តជំនាញ (ឧទាហរណ៍ ការបោះឆ្នោតក្លែងក្លាយ)។" },
  { name: "ការរៀនតាមស្ថានីយ (Station Rotation)", desc: "រៀបចំទីតាំងនិងមេរៀនជាកន្លែងៗ (ស្ថានីយ) រួចឱ្យសិស្សប្តូរវេនគ្នាទៅរៀនតាមស្ថានីយកំណត់។" },
  { name: "សំបុត្រចេញ / សំបុត្រចូល (Exit Ticket / Entry Ticket)", desc: "សំណួរខ្លីៗមុនចូលរៀន ឬមុនពេលចេញពីថ្នាក់ ដើម្បីស្ទាបស្ទង់ជម្រៅនៃការយល់ដឹងរបស់សិស្សយ៉ាងរហ័ស។" },
  { name: "ក្រដាសមួយនាទី (One-Minute Paper)", desc: "ឱ្យសិស្សប្រើពេលត្រឹមតែ១នាទី សរសេរសរុបអ្វីដែលខ្លួនបានរៀន ឬសំណួរដែលនៅសេសសល់។" },
  { name: "ចំណុចស្រអាប់បំផុត (Muddiest Point)", desc: "សំណួររកចំណុចដែលសិស្សអត់យល់ ឬនៅត្រាប់ត្រជាក់ជាងគេក្នុងកំឡុងពេលរៀន ដើម្បីឱ្យគ្រូពន្យល់ឡើងវិញ។" },
  { name: "តារាង KWL (KWL Chart)", desc: "ឱ្យសិស្សបំពេញតារាង៖ អ្វីដែលដឹងរួច (Know), អ្វីដែលចង់ដឹង (Want), និងអ្វីដែលបានរៀនក្រោយចប់ម៉ោង (Learned)។" },
  { name: "ប័ណ្ណបង្ហាញ ឬ ប័ណ្ណបោះឆ្នោត (Flashcards / Polling Cards)", desc: "ប្រើប័ណ្ណសួរឆ្លើយតូចៗ ដោយបោះបង្អួតលើអាកាសព្រមៗគ្នា ដើម្បីទាញការចូលរួមរបស់សិស្សទាំងអស់គ្នាក្នុងការឆ្លើយ។" }
];

export default function TeachingGlossaryModal({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'methods' | 'strategies'>('methods');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 sm:pb-6 print:hidden">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 font-khmer">សទ្ទានុក្រមវិធីសាស្ត្រ និងយុទ្ធវិធីបង្រៀន</h2>
              <p className="text-sm text-slate-500 font-khmer mt-0.5">ដំណើរការលម្អិតនៃបច្ចេកទេសបង្រៀននីមួយៗ</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 pt-4 gap-4 border-b border-slate-100 shrink-0 bg-white">
          <button
            onClick={() => setActiveTab('methods')}
            className={`pb-3 px-2 font-khmer font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'methods' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Layers className="w-4 h-4" />
            វិធីសាស្រ្តបង្រៀន ({TEACHING_METHODS.length})
          </button>
          <button
            onClick={() => setActiveTab('strategies')}
            className={`pb-3 px-2 font-khmer font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'strategies' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Target className="w-4 h-4" />
            យុទ្ធវិធីបង្រៀន ({TEACHING_STRATEGIES.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="space-y-4">
            {(activeTab === 'methods' ? TEACHING_METHODS : TEACHING_STRATEGIES).map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                <h3 className={`font-khmer font-bold mb-2 flex items-start gap-2 ${activeTab === 'methods' ? 'text-indigo-800' : 'text-emerald-800'}`}>
                  <span className="shrink-0 mt-0.5">{index + 1}.</span> 
                  {item.name}
                </h3>
                <p className="text-slate-600 font-khmer text-[15px] leading-relaxed pl-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
