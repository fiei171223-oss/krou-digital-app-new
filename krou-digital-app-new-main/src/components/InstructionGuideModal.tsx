import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X, BookOpen, Lightbulb, PlayCircle, HelpCircle, Video, Sparkles, Pause, RotateCcw } from 'lucide-react';

interface InstructionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
}

const getInstructionsForView = (view: string) => {
  switch (view) {
    case 'dashboard':
      return {
        title: 'ផ្ទាំងគ្រប់គ្រងទូទៅ (Dashboard)',
        description: 'ជាផ្ទាំងដើម ដែលមានភាពងាយស្រួលក្នុងការមើលសង្ខេបលទ្ធផល និងចុចចូលទៅកាន់ផ្នែកនានានៃកម្មវិធី។',
        features: [
          'មើលសេចក្តីសង្ខេប៖ ចំនួនសិស្ស សិស្សប្រឈមគ្រោះថ្នាក់។ល។',
          'ជ្រើសរើសផ្នែកនានា៖ គ្រប់គ្រងថ្នាក់រៀន ផែនការបង្រៀន តារាងពិន្ទុ និងធនធាន។'
        ],
        howTo: 'លោកគ្រូ អ្នកគ្រូគ្រាន់តែចុចលើកាតណាមួយដែលចង់ចូលប្រើប្រាស់។ ផ្នែកនីមួយៗត្រូវបានបែងចែកជាក្រុមច្បាស់លាស់។'
      };
    case 'attendance':
      return {
        title: 'ស្រង់វត្តមានសិស្ស',
        description: 'ផ្នែកសម្រាប់ស្រង់ និងកត់ត្រាអវត្តមានសិស្សប្រចាំថ្ងៃ។',
        features: [
          'កត់ត្រាវត្តមានរហ័ស តាមកាលបរិច្ឆេទ។',
          'បង្ហាញទិន្នន័យអវត្តមានដែលបានកត់ត្រារួច។'
        ],
        howTo: '១. ជ្រើសរើសថ្ងៃខែឆ្នាំ\n២. ធីក (Check) លើឈ្មោះសិស្សដែលអវត្តមាន\n៣. ចុច "រក្សាទុក"'
      };
    case 'student-management':
      return {
        title: 'បញ្ជីឈ្មោះសិស្ស',
        description: 'ប្រើសម្រាប់គ្រប់គ្រងទិន្នន័យសិស្សក្នុងថ្នាក់ទាំងអស់។',
        features: [
          'បន្ថែម កែប្រែ ឬលុបឈ្មោះសិស្ស។',
          'រក្សាទុកព័ត៌មានលម្អិតដូចជា ភេទ អាណាព្យាបាល លេខទូរស័ព្ទ។'
        ],
        howTo: 'ចុច "+" ដើម្បីបង្កើតសិស្សថ្មី។ អាចចុចលើរូបសញ្ញា "ប៊ិច" ដើម្បីកែប្រែព័ត៌មានចាស់ ឬរូប "ធុងសំរាម" ដើម្បីលុប។'
      };
    case 'qr-scanner':
      return {
        title: 'ស្កេនវត្តមាន (QR Code)',
        description: 'ប្រព័ន្ធស្កេនកាតសិស្ស ដើម្បីកត់ត្រាវត្តមានស្វ័យប្រវត្តិ។',
        features: [
          'ប្រើកាមេរ៉ាទូរស័ព្ទ ឬកុំព្យូទ័រ ដើម្បីស្កេន QR កាត។',
          'លោតសំឡេង និងកត់ត្រាពេលស្កេនជោគជ័យ។'
        ],
        howTo: 'ចុចបើកកាមេរ៉ា ឬចាប់ផ្តើមស្កេន។ យកកាតមាន QR របស់សិស្សមកបង្ហាញមុខកាមេរ៉ា។ ទិន្នន័យនឹងរក្សាទុកជាវត្តមាន។'
      };
    case 'classroom-mgmt':
      return {
        title: 'គ្រប់គ្រងវិន័យថ្នាក់រៀន',
        description: 'កត់ត្រានូវបញ្ហាវិន័យ និងចំណុចគួរកែលម្អរបស់សិស្ស។',
        features: [
          'ដាក់ពិន្ទុវិន័យ។',
          'កត់ចំណាំបញ្ហារបស់សិស្ស។'
        ],
        howTo: 'ជ្រើសរើសឈ្មោះសិស្ស និងកត់ត្រាចំណុចដែលសិស្សនោះត្រូវកែលម្អ ឬបានបំពានបទបញ្ជា។'
      };
    case 'seating-chart':
      return {
        title: 'ប្លង់ថ្នាក់រៀន',
        description: 'រៀបចំកន្លែងអង្គុយរបស់សិស្សតាមប្លង់ឌីជីថលទាន់សម័យ។',
        features: [
          'អូស (Drag) និងទម្លាក់ទិន្នន័យដើម្បីប្ដូរកន្លែងសិស្ស។',
          'បង្ហាញចំណាត់ថ្នាក់សិស្សនៅលើតុនីមួយៗ។'
        ],
        howTo: 'ចុចលើឈ្មោះសិស្សអូសទម្លាក់តាមប្លង់តុដែលចង់បាន រួចទាញយករូបថតប្លង់សម្រាប់បិទនៅក្ដារខៀន។'
      };
    case 'lesson-plan':
      return {
        title: 'AI បង្កើតកិច្ចតែងការ',
        description: 'មុខងារពិសេសភ្ជាប់ជាមួយ AI ដើម្បីជួយរៀបចំកិច្ចតែងការបង្រៀនបានរហ័ស។',
        features: [
          'បញ្ចូលតែចំណងជើងមេរៀន និងវត្ថុបំណង។',
          'AI នឹងបង្កើតសកម្មភាពគ្រូ សិស្ស និងការវាយតម្លៃដោយស្វ័យប្រវត្តិ និងបំពេញទម្រង់។'
        ],
        howTo: '១. បំពេញមុខវិជ្ជា ចំណងជើងមេរៀន\n២. បំពេញអត្ថបទ ឬសង្ខេបមេរៀន\n៣. ចុច "AI បង្កើតកិច្ចតែងការ"\n៤. រង់ចាំ AI តាក់តែង រួចទាញយកជា Word (DOC)។'
      };
    case 'classroom-tools':
      return {
        title: 'ជំនួយការគ្រូ AI',
        description: 'ទំព័រជជែក (Chat) ជាមួយ AI ដើម្បីសួរនាំគន្លឹះដោះស្រាយបញ្ហាក្នុងការបង្រៀន។',
        features: [
          'ផ្ដល់យោបល់ វិធីសាស្ត្រដោះស្រាយក្មេងរឹងរូស ការរៀបចំម៉ោងសិក្សា។'
        ],
        howTo: 'វាយបញ្ចូលសំណួរ និងបញ្ហារបស់អ្នក រួចរង់ចាំAI ឆ្លើយតបជាភាសាខ្មែរ។'
      };
    case 'grade-summary':
      return {
        title: 'តារាងសម្រង់ពិន្ទុ',
        description: 'តារាងបញ្ចូលពិន្ទុសម្រាប់កិច្ចការ និងការប្រឡងប្រចាំខែ។',
        features: [
          'បូកសរុបពិន្ទុស្វ័យប្រវត្តិ។',
          'ចែកចំណាត់ថ្នាក់ និងមធ្យមភាគអូតូ។'
        ],
        howTo: 'ជ្រើសរើសខែមុខវិជ្ជា បញ្ចូលពិន្ទុតាមឈ្មោះសិស្ស។ ប្រព័ន្ធនឹងគណនាចំណាត់ថ្នាក់ និងនិទ្ទេស។'
      };
    case 'student-card':
      return {
        title: 'បង្កើតកាតសិស្ស / កាតពិន្ទុ',
        description: 'រចនាកាតសម្គាល់ខ្លួន ឬកាតពិន្ទុសម្រាប់សិស្ស។',
        features: [
          'បង្កើតកាតមាន QR Code ស្វ័យប្រវត្តិ។',
          'ទាញយកជា PDF Batch (មួយសន្លឹកមានកាត៩)។'
        ],
        howTo: 'ជ្រើសរើសទម្រង់កាត។ បំពេញឈ្មោះសាលា។ ចុចលើ "ទាញយកកាតទាំងអស់ជាទម្រង់ PDF"។ កាតទាំងនេះត្រូវបានប្រើក្នុងផ្នែកស្កេន QR។'
      };
    case 'certificates':
      return {
        title: 'បណ្ណសរសើរឌីជីថល',
        description: 'បង្កើតបណ្ណសរសើរដោយស្វ័យប្រវត្តិ និងទាញយកជា PDF។',
        features: [
          'ទាញយកជាបណ្ណដាច់ដោយឡែក ឬសម្រាប់ថ្នាក់ទាំងមូល។'
        ],
        howTo: 'រើសឈ្មោះសិស្ស វាយបញ្ជូលចំណាត់ថ្នាក់ ឬមូលហេតុសរសើរ រួចចុចបង្កើត និងទាញយក។'
      };
    case 'teacher-accounts':
      return {
        title: 'គណនីគ្រូ (បញ្ជាក់អត្តសញ្ញាណ)',
        description: 'ផ្នែកសម្រាប់គ្រប់គ្រង និងស្នើសុំបញ្ជាក់អត្តសញ្ញាណ.',
        features: ['បញ្ចូលព័ត៌មានគ្រូ', 'បោះពុម្ពឯកសារបញ្ជាក់'],
        howTo: 'បញ្ចូលព័ត៌មានអត្តសញ្ញាណ និងស្នើសុំការបញ្ជាក់ពីប្រព័ន្ធ។'
      };
    case 'administration':
      return {
        title: 'រដ្ឋបាល & ឯកសារ (Administration)',
        description: 'ផ្នែកសម្រាប់ពុម្ពឯកសារ និងរបាយការណ៍ផ្សេងៗរបស់រដ្ឋបាល។',
        features: ['ទាញយករបាយការណ៍', 'បោះពុម្ពពាក្យស្នើសុំនានា'],
        howTo: 'ចុចលើឯកសារដែលត្រូវការ ដើម្បីទាញយក ឬបោះពុម្ព។'
      };
    case 'inventory':
    case 'resource-tracking':
      return {
        title: 'សារពើភ័ណ្ឌ & ខ្ចីសង (Inventory)',
        description: 'ការកត់ត្រាសម្ភារៈបង្រៀន និងឧបករណ៍ប្រើប្រាស់នានា។',
        features: ['គ្រប់គ្រងស្តុកថ្មីៗ', 'តាមដានការខ្ចីប្រគល់'],
        howTo: 'បន្ថែមចំនួនសម្ភារកាលបរិច្ឆេទក្នុងស្តុក និងចុះឈ្មោះអ្នកខ្ចីឬសងទៅតាមថ្ងៃខែជាក់ស្តែង។'
      };
    case 'danger-signs':
      return {
        title: 'សញ្ញាគ្រោះថ្នាក់ (Danger Signs)',
        description: 'ប្រព័ន្ធព្រមានសម្រាប់កត់ត្រាសកម្មភាពមិនប្រក្រតី ឬបញ្ហារបស់សិស្ស។',
        features: ['កំណត់ត្រាសញ្ញាព្រមាន', 'ផ្ដល់ដំណោះស្រាយ'],
        howTo: 'ចូលទៅកត់ត្រាពីសញ្ញាមិនប្រក្រតីដែលប្រទះឃើញ រួចរៀបចំវិធានការដោះស្រាយទៅតាមនោះ។'
      };
    case 'score-analysis':
      return {
        title: 'វិភាគពិន្ទុសិស្ស',
        description: 'ផ្នែកសម្រាប់វិភាគ និងមើលក្រាហ្វិកនៃលទ្ធផលសិក្សារបស់សិស្ស។',
        features: ['បង្ហាញគំនូសតាង (Chart)', 'ប្រៀបធៀបសមត្ថភាពសិស្ស'],
        howTo: 'ជ្រើសរើសឈ្មោះសិស្ស ដើម្បីមើលការវិភាគលទ្ធផលសិក្សារបស់ពួកគេតាមមុខវិជ្ជា។'
      };
    case 'daily-logs':
      return {
        title: 'សៀវភៅតាមដាន (Daily Logs)',
        description: 'កំណត់ត្រាសកម្មភាពបង្រៀននិងរៀនប្រចាំថ្ងៃ។',
        features: ['កត់ត្រាសកម្មភាព', 'វាយតម្លៃភាពជោគជ័យប្រចាំថ្ងៃ'],
        howTo: 'ចុចបញ្ចូលសកម្មភាពដែលបានបង្រៀន និងវាយតម្លៃថាសម្រេច ឬមិនទាន់សម្រេច។'
      };
    case 'teacher-dev':
      return {
        title: 'អភិវឌ្ឍន៍វិជ្ជាជីវៈ (Teacher Development)',
        description: 'កត់ត្រានូវការបណ្ដុះបណ្ដាល និងវគ្គសិក្សាដែលគ្រូបង្រៀនបានចូលរួម។',
        features: ['តាមដានប្រវត្តិការបណ្តុះបណ្តាល', 'កំណត់គោលដៅអភិវឌ្ឍន៍'],
        howTo: 'បញ្ចូលឈ្មោះវគ្គសិក្សា កាលបរិច្ឆេទ និងលទ្ធផលទទួលបាន ដើម្បីរក្សាទុកជាប្រវត្តិរូប។'
      };
    case 'admin-calendar':
    case 'schedule':
      return {
        title: 'កាលវិភាគបង្រៀន',
        description: 'តារាងកាលវិភាគបង្រៀនប្រចាំសប្ដាហ៍។',
        features: ['រៀបចំម៉ោងបង្រៀន', 'មើលកាលវិភាគតាមថ្ងៃ'],
        howTo: 'បញ្ចូលមុខវិជ្ជា ទៅតាមម៉ោងនិងថ្ងៃនីមួយៗក្នុងតារាង។'
      };
    case 'school-archive':
      return {
        title: 'បណ្ណសារសាលា',
        description: 'កន្លែងផ្ទុកឯកសាររដ្ឋបាល និងឯកសារផ្សេងៗរបស់សាលា។',
        features: ['ផ្ទុកឯកសារសំខាន់ៗ', 'ងាយស្រួលស្វែងរក'],
        howTo: 'អាចធ្វើការបង្ហោះ ឬទាញយកឯកសាររដ្ឋបាលពីក្នុងបណ្ណសារនេះ។'
      };
    case 'difficult-words':
      return {
        title: 'បញ្ជីពាក្យពិបាក',
        description: 'ចងក្រងពាក្យពិបាកៗ ដើម្បីងាយស្រួលពន្យល់សិស្ស។',
        features: ['រក្សាទុកពាក្យ និងអត្ថន័យ', 'ងាយស្រួលទាញយកប្រើប្រាស់'],
        howTo: 'ចុចបញ្ចូលពាក្យពិបាក ថ្នាក់ពាក្យ និងន័យរបស់វា ដើម្បីទុករំលឹកសិស្ស។'
      };
    case 'at-risk-warning':
      return {
        title: 'សិស្សប្រឈមគ្រោះថ្នាក់ (រៀនយឺត)',
        description: 'ផ្តោតលើសិស្សដែលមានពិន្ទុទាប ឬអវត្តមានច្រើន ដើម្បីជួយពង្រឹងបន្ថែម។',
        features: ['បង្ហាញបញ្ជីសិស្សខ្សោយដោយស្វ័យប្រវត្តិ', 'តាមដានការវិវត្ត'],
        howTo: 'ប្រព័ន្ធនឹងទាញយកសិស្សដែលមានពិន្ទុទាបដោយស្វ័យប្រវត្តិ។ លោកគ្រូអ្នកគ្រូអាចបន្ថែមចំណារ ដើម្បីជួយពួកគេ។'
      };
    case 'parent-comm':
      return {
        title: 'ទំនាក់ទំនងមាតាបិតា',
        description: 'កត់ត្រាលទ្ធផលជួបជាមួយអាណាព្យាបាលសិស្ស។',
        features: ['កត់ត្រាការប្រជុំ', 'តាមដានការសហការ'],
        howTo: 'បញ្ចូលព័ត៌មានអពីការជួបជជែកជាមួយអាណាព្យាបាលសិស្សតាមរៀងរាល់ខែ ឬឆមាស។'
      };
    case 'egr-package':
    case 'egr-math':
    case 'library':
    case 'materials':
    case 'pisa-test':
    case 'sea-plm-test':
    case 'homework':
      return {
        title: 'បណ្ណាល័យ និងធនធានសិក្សា',
        description: 'បណ្តុំសៀវភៅ វិញ្ញាសារ តេស្ត អំណាន និងកិច្ចការផ្ទះ។',
        features: ['មើលសៀវភៅ PDF', 'ទាញយក និងរក្សាទុកឯកសារ'],
        howTo: 'ចុចមើលសៀវភៅដែលចង់អាន ឬអាចទាញយកមករក្សាទុកដើម្បីអាននៅពេលគ្មានអ៊ីនធឺណិត។'
      };
    case 'teaching-strategies':
    case 'toolbox':
      return {
        title: 'វិធីសាស្ត្រ និងឧបករណ៍បង្រៀន',
        description: 'កម្រងវិធីសាស្ត្រគរុកោសល្យ និងហ្គេមអប់រំផ្សេងៗ។',
        features: ['គន្លឹះបង្រៀនថ្មីៗ', 'ហ្គេមបង្រៀនសប្បាយៗ'],
        howTo: 'ជ្រើសរើសប្រភេទវិធីសាស្ត្រ ឬហ្គេម ដែលអ្នកចង់ប្រើប្រាស់ រួចអនុវត្តតាមការណែនាំ។'
      };
    case 'student-rewards':
      return {
        title: 'ប្រព័ន្ធរង្វាន់សិស្ស',
        description: 'ផ្ដល់រង្វាន់ ឬពិន្ទុលើកទឹកចិត្តដល់សិស្សដែលខិតខំប្រឹងប្រែង។',
        features: ['បន្ថែមផ្កាយ/ពិន្ទុលើកទឹកចិត្ត', 'មើលតារាងចំណាត់ថ្នាក់'],
        howTo: 'ចុចឈ្មោះសិស្ស រួចចុចបន្ថែមពិន្ទុ ឬយករង្វាន់ផ្សេងៗនៅពេលពួកគេធ្វើបានល្អ។'
      };
    case 'absent-list':
      return {
        title: 'របាយការណ៍អវត្តមានប្រចាំខែ',
        description: 'បូកសរុបចំនួនថ្ងៃឈប់សម្រាករបស់សិស្សម្នាក់ៗ។',
        features: ['មើលទិន្នន័យអវត្តមានសរុប', 'ទាញយករបាយការណ៍'],
        howTo: 'ជ្រើសរើសខែ ដើម្បីមើលតារាងបូកសរុបអវត្តមាន។'
      };
    default:
      return {
        title: 'របៀបប្រើប្រាស់ទូទៅ',
        description: 'ផ្នែកមួយចំនួនតម្រូវឲ្យបំពេញទិន្នន័យ ដើម្បីមានភាពងាយស្រួលគ្រប់គ្រងសំណុំឯកសារឌីជីថល។',
        features: [
          'ប្រសិនបើអ្នកត្រូវការជំនួយបន្ថែម សូមពិនិត្យមើលសញ្ញា ❓ ក្បែរៗប៊ូតុងមុខងារ។',
          'រាល់ទិន្នន័យភាគច្រើនត្រូវបានរក្សាទុកដោយស្វ័យប្រវត្តិ។'
        ],
        howTo: 'សូមចុចសាកល្បងចុចលើប៊ូតុង និងបញ្ចូលទិន្នន័យផ្សេងៗ។ ដើម្បីត្រលប់ទៅផ្ទាំងដើមវិញចុច ត្រលប់ក្រោយ។'
      };
  }
};

const AIVideoPlayer = ({ content }: { content: any }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const videoDuration = 20000;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Ambient tech, relaxing background track
    audioRef.current = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.2; // keep it subtle
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const playPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && progress < 100) {
        playPromiseRef.current = audioRef.current.play();
        if (playPromiseRef.current !== undefined) {
          playPromiseRef.current.catch(e => { /* Ignore interruption error gracefully */ });
        }
      } else {
        if (playPromiseRef.current !== undefined && playPromiseRef.current !== null) {
          playPromiseRef.current.then(() => {
            if (audioRef.current) audioRef.current.pause();
          }).catch(() => { /* Ignore error */ });
        } else {
          audioRef.current.pause();
        }
      }
    }
  }, [isPlaying, progress]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => {
          const next = p + (100 / (videoDuration / 100)); // update every 100ms
          if (next >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress]);

  useEffect(() => {
    if (progress < 20) setCurrentSlide(0);
    else if (progress < 45) setCurrentSlide(1);
    else if (progress < 70) setCurrentSlide(2);
    else setCurrentSlide(3);
  }, [progress]);

  const togglePlay = () => {
    if (progress >= 100) {
      setProgress(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };
  
  return (
    <div className="bg-slate-900 rounded-[14px] aspect-video relative overflow-hidden group font-khmer shadow-inner border-[4px] border-black">
      <div className="absolute inset-0 transition-opacity duration-1000">
         <img 
           src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80" 
           alt="bg" 
           className={`w-full h-full object-cover transition-all duration-${videoDuration} ease-linear transform ${isPlaying ? 'scale-110' : 'scale-100'}`} 
         />
         <div className={`absolute inset-0 bg-gradient-to-br ${
           currentSlide === 0 ? 'from-blue-900/80 to-indigo-900/90' : 
           currentSlide === 1 ? 'from-emerald-900/80 to-teal-900/90' : 
           currentSlide === 2 ? 'from-violet-900/80 to-purple-900/90' : 'from-indigo-900/80 to-slate-900/90'
         } mix-blend-multiply transition-colors duration-1000`}></div>
      </div>

      <div className="absolute inset-0 p-8 flex flex-col justify-center items-center text-center pb-16 z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentSlide === 0 && (
            <motion.div key="slide0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
               <div className="w-16 h-16 mx-auto bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 shadow-lg border border-white/20">
                 <Sparkles className="w-10 h-10 text-yellow-300" />
               </div>
               <h2 className="text-3xl font-black text-white drop-shadow-md">{content.title}</h2>
               <p className="text-white/80 font-medium">វីដេអូណែនាំអំពីការប្រើប្រាស់</p>
            </motion.div>
          )}

          {currentSlide === 1 && (
            <motion.div key="slide1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="w-full max-w-sm mx-auto space-y-4">
               <div className="flex items-center gap-3 justify-center mb-2">
                 <BookOpen className="w-6 h-6 text-emerald-400" />
                 <h3 className="text-xl font-bold text-emerald-300">ប្រើបានអីខ្លះ?</h3>
               </div>
               <p className="text-white text-base leading-relaxed bg-black/30 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-xl">
                 {content.description}
               </p>
            </motion.div>
          )}

          {currentSlide === 2 && (
            <motion.div key="slide2" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className="w-full h-full flex flex-col justify-center">
               <div className="flex items-center gap-3 justify-center mb-4">
                 <Lightbulb className="w-6 h-6 text-yellow-400" />
                 <h3 className="text-xl font-bold text-yellow-300">ចំណុចសំខាន់ៗ</h3>
               </div>
               <div className="space-y-3 px-4">
                 {content.features?.map((f: string, i: number) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.4 }}
                     key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-lg text-left shadow-lg text-white text-sm flex gap-3"
                   >
                     <div className="w-2 h-2 bg-yellow-400 rounded-full mt-1.5 shrink-0 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                     <span>{f}</span>
                   </motion.div>
                 ))}
               </div>
            </motion.div>
          )}

          {currentSlide === 3 && (
             <motion.div key="slide3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="w-full max-w-lg">
                <div className="bg-indigo-900/60 backdrop-blur-md border border-indigo-400/30 p-5 rounded-2xl shadow-2xl text-left">
                  <h3 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2 border-b border-indigo-400/30 pb-2">
                    <PlayCircle className="w-5 h-5" /> របៀបប្រើប្រាស់ជំហាននីមួយៗ
                  </h3>
                  <div className="text-white/90 text-sm leading-8 whitespace-pre-wrap font-medium">
                    {content.howTo}
                  </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute top-4 left-4 flex gap-2 z-20">
        <span className="px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-md backdrop-blur-md flex items-center gap-1 border border-white/10">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          AI បង្កើត
        </span>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20">
         <div className="flex items-center gap-4 px-2 mb-1">
            <button onClick={togglePlay} className="text-white hover:text-indigo-400 transition-colors focus:outline-none shrink-0 border-none bg-transparent p-0">
              {progress >= 100 ? (
                <RotateCcw className="w-5 h-5" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <PlayCircle className="w-5 h-5 fill-current" />
              )}
            </button>
            <div className="flex-grow h-1.5 bg-white/20 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect();
              const percent = ((e.clientX - bounds.left) / bounds.width) * 100;
              setProgress(percent);
            }}>
              <div className="absolute top-0 bottom-0 left-0 bg-indigo-500 transition-all duration-100 ease-linear" style={{ width: `${progress}%` }}></div>
              <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white/40"></div>
              <div className="absolute top-0 bottom-0 left-[45%] w-[1px] bg-white/40"></div>
              <div className="absolute top-0 bottom-0 left-[70%] w-[1px] bg-white/40"></div>
            </div>
            <div className="text-[10px] text-white/80 font-mono font-medium shrink-0">
               0:{Math.floor((progress / 100) * (videoDuration/1000)).toString().padStart(2, '0')} / 0:{videoDuration/1000}
            </div>
         </div>
      </div>
    </div>
  );
};

export default function InstructionGuideModal({ isOpen, onClose, currentView }: InstructionGuideModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // Reset state when modal opens/closes or view changes
  React.useEffect(() => {
    setIsGenerating(false);
    setShowVideo(false);
  }, [isOpen, currentView]);

  if (!isOpen) return null;

  const content = getInstructionsForView(currentView);

  const handleGenerateVideo = () => {
    setIsGenerating(true);
    // Simulate AI video generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setShowVideo(true);
    }, 3000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden font-khmer shadow-indigo-500/10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 pt-8 relative overflow-hidden shrink-0">
             {/* decorative */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             
             <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/20 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                  <HelpCircle className="w-6 h-6 text-white" />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white mb-1 drop-shadow-sm line-clamp-1">
                     {content.title}
                  </h3>
                  <p className="text-blue-100 text-sm opacity-90 leading-relaxed font-medium">
                     ការណែនាំ និងរបៀបប្រើប្រាស់
                  </p>
               </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
            
            {/* AI Video Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-1 rounded-2xl border border-indigo-100">
              {!showVideo ? (
                <div className="bg-white rounded-[14px] p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-indigo-500" />
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">វីដេអូណែនាំដោយ AI</h4>
                  <p className="text-sm text-slate-500 mb-6">
                    ឲ្យ AI បង្កើតវីដេអូពន្យល់លម្អិតអំពីការប្រើប្រាស់ផ្នែកនេះដោយស្វ័យប្រវត្តិ។
                  </p>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 active:scale-95"
                  >
                    {isGenerating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        កំពុងបង្កើតវីដេអូ...
                      </>
                    ) : (
                      <>
                        <Video className="w-5 h-5" />
                        បង្កើតវីដេអូណែនាំ
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <AIVideoPlayer content={content} />
              )}
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
               <span className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  ប្រើបានអីខ្លះ៖
               </span>
               {content.description}
            </div>

            {content.features && content.features.length > 0 && (
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-2 mb-3 text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  ចំណុចសំខាន់ៗ៖
                </span>
                <ul className="space-y-2">
                  {content.features.map((feature, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 items-start">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50 text-indigo-900 text-sm leading-relaxed">
               <span className="font-bold flex items-center gap-2 mb-3 text-indigo-700">
                  <PlayCircle className="w-4 h-4" />
                  របៀបប្រើប្រាស់៖
               </span>
               <div className="whitespace-pre-wrap leading-loose">
                 {content.howTo}
               </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-sm text-sm"
            >
              យល់ព្រម
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
