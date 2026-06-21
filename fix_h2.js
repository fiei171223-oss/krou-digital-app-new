import fs from 'fs';

let code = fs.readFileSync('src/App.tsx', 'utf-8');

const reps = [
  '<Users className="w-6 h-6 text-indigo-500" /> ១. ផ្នែកគ្រប់គ្រងថ្នាក់រៀន និងសិស្ស',
  '<BookText className="w-6 h-6 text-amber-500" /> ២. ផ្នែកផែនការ និងការបង្រៀនប្រចាំថ្ងៃ',
  '<BarChart3 className="w-6 h-6 text-sky-500" /> ៣. ផ្នែកវាយតម្លៃ និងលទ្ធផលសិក្សា',
  '<Library className="w-6 h-6 text-violet-500" /> ៤. ផ្នែកធនធានសិក្សា និងកញ្ចប់គាំទ្រ',
  '<FileText className="w-6 h-6 text-slate-500" /> ៥. ផ្នែករដ្ឋបាល ភស្តុភារ និងសុវត្ថិភាព',
  '<Briefcase className="w-6 h-6 text-indigo-700" /> ៦. ផ្នែកអភិវឌ្ឍន៍វិជ្ជាជីវៈ'
];

let i = 0;

code = code.replace(/<h2 className="text-xl md:text-2xl font-black mb-6 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">\n\s*<div/g, (match) => {
  const iconAndText = reps[i];
  i++;
  return '<h2 className="text-xl md:text-2xl font-black mb-6 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">\\n          ' + iconAndText + '\\n        </h2>\\n        <div';
});

fs.writeFileSync('src/App.tsx', code);
