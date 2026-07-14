import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  Video, 
  Play, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  Star, 
  Clock, 
  User, 
  FileText, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

interface DemoClassItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  teacher: string;
  duration: string;
  views: number;
  rating: number;
  videoUrl: string;
  description: string;
  objectives: string[];
  thumbnailUrl: string;
}

const defaultDemoClasses: DemoClassItem[] = [
  {
    id: '1',
    title: 'ការបង្រៀនអំណានដំបូង៖ ការផ្សំព្យាង្គ និងពាក្យថ្មី',
    grade: 'ថ្នាក់ទី ១',
    subject: 'ភាសាខ្មែរ (កញ្ចប់អំណានដំបូង EGR)',
    teacher: 'អ្នកគ្រូ សុខ ចិន្តា',
    duration: '៣៥ នាទី',
    views: 1420,
    rating: 4.9,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    description: 'វីដេអូនង្ហាញពីវិធីសាស្ត្របង្រៀនអំណានដំបូងតាមបែបផែនកញ្ចប់អំណាន EGR ដោយប្រើប័ណ្ណអក្សរ និងការចូលរួមយ៉ាងសកម្មពីសិស្សានុសិស្ស។',
    objectives: [
      'សិស្សអាចបញ្ចេញសូរអក្សរ និងផ្សំព្យាង្គបានត្រឹមត្រូវ',
      'សិស្សអាចអានពាក្យថ្មីបានស្ទាត់ជំនាញ',
      'សិស្សចូលរួមលេងល្បែងអំណានប្រកបដោយភាពរីករាយ'
    ]
  },
  {
    id: '2',
    title: 'បច្ចេកទេសបង្រៀនគណិតវិទ្យា៖ ការបូកលេខគ្មានត្រាទុក',
    grade: 'ថ្នាក់ទី ២',
    subject: 'គណិតវិទ្យាដំបូង (EGMA)',
    teacher: 'លោកគ្រូ ចាន់ សុភ័ក្ត្រ',
    duration: '៤០ នាទី',
    views: 980,
    rating: 4.8,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    description: 'ការប្រើប្រាស់សម្ភារឧបទេសរូបភាព និងកូនឈើក្នុងការបង្រៀនប្រមាណវិធីបូកលេខ ដើម្បីឱ្យសិស្សងាយយល់ និងចងចាំបានយូរ។',
    objectives: [
      'សិស្សយល់ពីគោលគំនិតនៃការបូកលេខរហូតដល់ ១០០',
      'សិស្សអាចគណនាប្រមាណវិធីបូកគ្មានត្រាទុកបានរហ័ស',
      'សិស្សចេះអនុវត្តក្នុងជីវភាពប្រចាំថ្ងៃ'
    ]
  },
  {
    id: '3',
    title: 'វិធីសាស្ត្របង្រៀនបែបសិស្សមជ្ឈមណ្ឌលក្នុងមុខវិជ្ជាវិទ្យាសាស្ត្រ',
    grade: 'ថ្នាក់ទី ៤',
    subject: 'វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា',
    teacher: 'អ្នកគ្រូ កែវ មុន្នី',
    duration: '៤៥ នាទី',
    views: 850,
    rating: 4.7,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    description: 'គំរូថ្នាក់រៀនសាកល្បងជាក់ស្តែងដោយអនុញ្ញាតឱ្យសិស្សធ្វើការពិសោធន៍ជាក្រុម និងពិភាក្សាស្វែងរកចម្លើយដោយខ្លួនឯង។',
    objectives: [
      'សិស្សចេះសហការគ្នាជាក្រុមក្នុងការពិសោធន៍',
      'សិស្សចេះសង្កេត និងកត់ត្រាលទ្ធផលពិសោធន៍',
      'បណ្តុះគំនិតស្រាវជ្រាវ និងការគិតបែបស៊ីជម្រៅ'
    ]
  },
  {
    id: '4',
    title: 'ការគ្រប់គ្រងថ្នាក់រៀន និងការពង្រឹងវិន័យវិជ្ជមាន',
    grade: 'គ្រប់កម្រិតថ្នាក់',
    subject: 'គរុកោសល្យ និងការគ្រប់គ្រងថ្នាក់',
    teacher: 'លោកគ្រូ បណ្ឌិត សុខ វិសាល',
    duration: '៥០ នាទី',
    views: 2100,
    rating: 5.0,
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    description: 'ចែករំលែកបទពិសោធន៍ និងវិធីសាស្ត្រដឹកនាំថ្នាក់រៀនប្រកបដោយភាពកក់ក្តៅ បង្កើតកិច្ចព្រមព្រៀងក្នុងថ្នាក់ និងលើកទឹកចិត្តសិស្ស។',
    objectives: [
      'គ្រូចេះបង្កើតបរិយាកាសថ្នាក់រៀនប្រកបដោយសុវត្ថិភាពផ្លូវចិត្ត',
      'ការដោះស្រាយបញ្ហាអាកប្បកិរិយាសិស្សតាមបែបវិជ្ជមាន',
      'ការប្រើប្រាស់ប្រព័ន្ធលើកទឹកចិត្ត និងរង្វាន់'
    ]
  }
];

export default function DemoClassesView({ onBack }: { onBack: () => void }) {
  const [selectedClass, setSelectedClass] = useState<DemoClassItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ទាំងអស់');

  const subjects = ['ទាំងអស់', 'ភាសាខ្មែរ (កញ្ចប់អំណានដំបូង EGR)', 'គណិតវិទ្យាដំបូង (EGMA)', 'វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា', 'គរុកោសល្យ និងការគ្រប់គ្រងថ្នាក់'];

  const filteredClasses = defaultDemoClasses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'ទាំងអស់' || c.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-center gap-4 z-10">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all shrink-0"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                ៦. ផ្នែកអភិវឌ្ឍន៍វិជ្ជាជីវៈ
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-moul mt-2 tracking-wide flex items-center gap-3">
              <Video className="w-8 h-8" /> ថ្នាក់និទស្សន៍ (គំរូបង្រៀនល្អៗ)
            </h1>
            <p className="text-teal-100 text-sm mt-1 font-kantumruy">
              ទស្សនាវីដេអូគំរូបង្រៀន និងវិធីសាស្ត្រថ្មីៗពីគ្រូបង្រៀនឆ្នើមដើម្បីអភិវឌ្ឍសមត្ថភាពគរុកោសល្យ
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 flex items-center gap-3 z-10">
          <Award className="w-8 h-8 text-amber-300" />
          <div>
            <div className="text-xs text-teal-100 font-bold">វីដេអូគំរូឆ្នើម</div>
            <div className="text-lg font-black">{defaultDemoClasses.length} ថ្នាក់រៀន</div>
          </div>
        </div>
      </div>

      {/* Video Modal or Player Section */}
      {selectedClass ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xl border border-slate-100 space-y-6"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedClass(null)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-2 transition-all text-sm"
            >
              <ChevronLeft className="w-4 h-4" /> ត្រឡប់ទៅបញ្ជីថ្នាក់និទស្សន៍
            </button>
            <span className="px-4 py-1.5 rounded-full bg-teal-100 text-teal-800 font-bold text-xs">
              {selectedClass.grade}
            </span>
          </div>

          <div className="aspect-video w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl relative">
            <iframe
              src={selectedClass.videoUrl}
              title={selectedClass.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black font-kantumruy text-slate-800">
                  {selectedClass.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-teal-600">
                    <User className="w-4 h-4" /> {selectedClass.teacher}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {selectedClass.duration}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-500" /> {selectedClass.rating}
                  </span>
                </div>
              </div>

              <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm">
                មុខវិជ្ជា៖ {selectedClass.subject}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2 font-kantumruy">
                  <FileText className="w-5 h-5 text-teal-600" /> សេចក្តីពិពណ៌នាអំពីថ្នាក់និទស្សន៍
                </h3>
                <p className="text-slate-600 leading-relaxed font-khmer">
                  {selectedClass.description}
                </p>

                <h4 className="font-bold text-slate-800 pt-2 font-kantumruy">វត្ថុបំណងនៃមេរៀន៖</h4>
                <ul className="space-y-2">
                  {selectedClass.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 h-fit space-y-4">
                <h4 className="font-bold text-slate-800 font-kantumruy flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" /> ចំណុចសំខាន់ៗដែលគួរកត់សម្គាល់
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-khmer">
                  សូមសង្កេតមើលរបៀបដែលគ្រូសម្របសម្រួលសកម្មភាពសិស្ស ការប្រើប្រាស់កាយវិការ ទឹកមុខ និងសម្ភារឧបទេស ដើម្បីទាក់ទាញចំណាប់អារម្មណ៍សិស្សក្នុងថ្នាក់។
                </p>
                <button 
                  onClick={() => alert("មុខងារទាញយកប្លង់តែងការបង្រៀនគំរូនេះ នឹងបើកដំណើរការឆាប់ៗនេះ!")}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-all shadow-md"
                >
                  ទាញយកកិច្ចតែងការបង្រៀនគំរូ (PDF)
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ស្វែងរកចំណងជើង ឬឈ្មោះគ្រូ..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              {subjects.map((sub, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedSubject === sub 
                      ? 'bg-teal-600 text-white shadow-md' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClasses.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -4 }}
                className="bg-white rounded-[2rem] overflow-hidden shadow-md border border-slate-100 hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setSelectedClass(item)}>
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 text-teal-600 ml-1 fill-teal-600" />
                      </div>
                    </div>
                    <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 text-white font-bold text-xs backdrop-blur-sm">
                      {item.duration}
                    </span>
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-teal-600 text-white font-bold text-xs shadow-md">
                      {item.grade}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-teal-600 bg-teal-50 px-2.5 py-1 rounded-md">{item.subject}</span>
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-500" /> {item.rating}
                      </span>
                    </div>

                    <h3 
                      onClick={() => setSelectedClass(item)}
                      className="text-lg font-black text-slate-800 hover:text-teal-600 transition-colors cursor-pointer font-kantumruy leading-snug line-clamp-2"
                    >
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-khmer">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {item.teacher}
                  </span>
                  <button
                    onClick={() => setSelectedClass(item)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> មើលវីដេអូ
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-600 font-kantumruy">មិនមានថ្នាក់និទស្សន៍ដែលអ្នកកំពុងស្វែងរកទេ</h3>
              <p className="text-xs text-slate-400 mt-1">សូមសាកល្បងស្វែងរកដោយពាក្យគន្លឹះផ្សេង ឬជ្រើសរើសប្រធានបទទាំងអស់</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
