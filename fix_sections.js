import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The replacement was looking for `\n      <section>` but let's be more robust:
code = code.replace(/\{\/\* 1\. Class & Student Management \*\/\}\s*<section>/, 
  '{/* 1. Class & Student Management */}\n      <section className="bg-indigo-50/50 border border-indigo-100/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">');
  
code = code.replace(/\{\/\* 2\. Instructional Planning & Tools \*\/\}\s*<section>/, 
  '{/* 2. Instructional Planning & Tools */}\n      <section className="bg-amber-50/50 border border-amber-100/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">');
  
code = code.replace(/\{\/\* 3\. Assessment & Analytics \*\/\}\s*<section>/, 
  '{/* 3. Assessment & Analytics */}\n      <section className="bg-sky-50/50 border border-sky-100/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">');

code = code.replace(/\{\/\* 4\. Learning Resources & Intervention \*\/\}\s*<section>/, 
  '{/* 4. Learning Resources & Intervention */}\n      <section className="bg-violet-50/50 border border-violet-100/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">');

code = code.replace(/\{\/\* 5\. Administration & Logistics \*\/\}\s*<section>/, 
  '{/* 5. Administration & Logistics */}\n      <section className="bg-slate-100 border border-slate-200/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">');

code = code.replace(/\{\/\* 6\. Professional Development \*\/\}\s*<section>/, 
  '{/* 6. Professional Development */}\n      <section className="bg-teal-50/50 border border-teal-100/50 rounded-[2rem] p-6 lg:p-8 relative overflow-hidden">');

// Now let's remove the background colors from the h2 tags instead, since the section now has the background color!
// Or we can leave them bare (just text). The user specifically said "កន្លែង អក្សរ ទាំង៦ផ្នែក អាចដាក់ពណ៌នៅពីក្រោយទាំង៦ផ្នែក"
// This translates to "The letters in the 6 sections, can put colors behind all 6 sections (background)".
// Right now `h2` elements have: `<h2 className="text-lg md:text-xl font-bold mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">` (no background).
// Let's modify the script to put back the colored padding boxes on the h2 OR keep them as sections. Wait, "នៅពីក្រោយទាំង៦ផ្នែក" probably means "behind the 6 sections" itself. I think section background is correct!
// But just in case, let's also remove `premium-gradient-bg` from the main div so it's clean white so the pastel sections stand out clearly.

code = code.replace(/className="min-h-screen premium-gradient-bg flex flex-col/g, 'className="min-h-screen bg-slate-50 flex flex-col');

fs.writeFileSync('src/App.tsx', code);
