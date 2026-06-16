import fs from 'fs';

const filePath = 'src/App.tsx';
let code = fs.readFileSync(filePath, 'utf-8');

const stateRegex = /const \[view, setView\] = useState<string>\('dashboard'\);/;
code = code.replace(stateRegex, `  const [activeTab, setActiveTab] = useState<'home' | 'class' | 'ai' | 'library' | 'more'>('home');\n  const [activeSection, setActiveSection] = useState<string | null>(null);\n\n  const onBack = () => setActiveSection(null);\n  const setView = (v: string) => setActiveSection(v);`);

const mainRegex = /<main className="flex-grow p-4 md:p-10 max-w-\[1400px\] mx-auto w-full">([\s\S]*?)<\/main>/;

const newMain = `<main className="flex-grow max-w-[1400px] mx-auto w-full pb-28 md:pb-10 relative">
        <AnimatePresence mode="wait">
          {activeSection ? (
            <motion.div
              key="active-section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-10"
            >
              {activeSection === 'attendance' && <AttendanceView onBack={onBack} />}
              {activeSection === 'student-management' && <StudentManagementView onBack={onBack} />}
              {activeSection === 'score-analysis' && <ScoreAnalysisView onBack={onBack} />}
              {activeSection === 'grade-summary' && <GradeSummaryView onBack={onBack} students={students} />}
              {activeSection === 'daily-logs' && <DailyLogView onBack={onBack} />}
              {activeSection === 'teacher-dev' && <TeacherDevView onBack={onBack} />}
              {activeSection === 'classroom-tools' && <ClassroomToolsView onBack={onBack} />}
              {activeSection === 'admin-calendar' && <AdminCalendarView onBack={onBack} />}
              {activeSection === 'student-card' && <StudentCardView onBack={onBack} />}
              {activeSection === 'school-archive' && <SchoolArchiveView onBack={onBack} />}
              {activeSection === 'difficult-words' && <DifficultWordsView onBack={onBack} />}
              {activeSection === 'at-risk-warning' && <AtRiskWarningView onBack={onBack} />}
              {activeSection === 'qr-scanner' && <QRScannerView onBack={onBack} />}
              {activeSection === 'schedule' && <TeachingScheduleView onBack={onBack} />}
              {activeSection === 'parent-comm' && <ParentCommunicationView onBack={onBack} />}
              {activeSection === 'classroom-mgmt' && <ClassroomManagementView onBack={onBack} students={students} />}
              {activeSection === 'administration' && <AdministrationView onBack={onBack} students={students} />}
              {activeSection === 'resources' && <ResourceTrackingView onBack={onBack} />}
              {activeSection === 'egr-package' && <EGRPackageView onBack={onBack} />}
              {activeSection === 'egr-math' && <EarlyGradeMathView onBack={onBack} students={students} />}
              {activeSection === 'certificates' && <DigitalCertificateView onBack={onBack} students={students} />}
              {activeSection === 'seating-chart' && <SeatingChartView onBack={onBack} students={students} />}
              {activeSection === 'teaching-strategies' && <TeachingStrategiesView onBack={onBack} />}
              {activeSection === 'toolbox' && <TeacherToolboxView onBack={onBack} />}
              {activeSection === 'student-rewards' && <StudentRewardsView onBack={onBack} />}
              {activeSection === 'lesson-plan' && <LessonPlanForm onBack={onBack} />}
              {activeSection === 'absent-list' && <MonthlyAttendanceReport onBack={onBack} />}
              
              {activeSection === 'library' && (
                <GenericPDFArchiveView 
                  title="បណ្ណាល័យឌីជីថល"
                  description="ជ្រើសរើសកម្រិតថ្នាក់ដើម្បីមើលសៀវភៅ និងឯកសារជំនួយស្មារតី"
                  onBack={onBack} 
                  pdfs={libraryFiles}
                  onSavePDF={(pdf) => setLibraryFiles([...libraryFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setLibraryFiles(libraryFiles.filter(p => p.id !== id))}
                />
              )}
              {activeSection === 'materials' && (
                <GenericPDFArchiveView 
                  title="សម្ភារឧបទេស"
                  description="បណ្ដុំសម្ភារបង្រៀន និងរៀនសម្រាប់គ្រូ និងសិស្ស"
                  onBack={onBack} 
                  pdfs={teachingMaterialsFiles}
                  onSavePDF={(pdf) => setTeachingMaterialsFiles([...teachingMaterialsFiles, pdf as TeachingMaterialFile])}
                  onDeletePDF={(id) => setTeachingMaterialsFiles(teachingMaterialsFiles.filter(p => p.id !== id))}
                />
              )}
              {activeSection === 'pisa-test' && (
                <GenericPDFArchiveView 
                  title="PISA TEST"
                  description="បណ្តុំវិញ្ញាសារតេស្ត PISA សម្រាប់វាស់ស្ទង់សមត្ថភាពសិស្ស"
                  onBack={onBack} 
                  pdfs={pisaFiles}
                  onSavePDF={(pdf) => setPisaFiles([...pisaFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setPisaFiles(pisaFiles.filter(p => p.id !== id))}
                />
              )}
              {activeSection === 'sea-plm-test' && (
                <GenericPDFArchiveView 
                  title="SEA-PLM TEST"
                  description="បណ្តុំវិញ្ញាសារតេស្ត SEA-PLM សម្រាប់កម្រិតបឋមសិក្សា"
                  onBack={onBack} 
                  pdfs={seaPlmFiles}
                  onSavePDF={(pdf) => setSeaPlmFiles([...seaPlmFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setSeaPlmFiles(seaPlmFiles.filter(p => p.id !== id))}
                />
              )}
              {activeSection === 'homework' && (
                <GenericPDFArchiveView 
                  title="កិច្ចការផ្ទះ"
                  description="រៀបចំ និងដាក់កិច្ចការផ្ទះសម្រាប់សិស្សតាមកម្រិតថ្នាក់"
                  onBack={onBack} 
                  pdfs={homeworkFiles}
                  onSavePDF={(pdf) => setHomeworkFiles([...homeworkFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setHomeworkFiles(homeworkFiles.filter(p => p.id !== id))}
                />
              )}
              
              {!['attendance', 'student-management', 'score-analysis', 'grade-summary', 'daily-logs', 'teacher-dev', 'classroom-tools', 'admin-calendar', 'student-card', 'school-archive', 'difficult-words', 'at-risk-warning', 'qr-scanner', 'schedule', 'parent-comm', 'classroom-mgmt', 'administration', 'resources', 'egr-package', 'egr-math', 'certificates', 'seating-chart', 'teaching-strategies', 'toolbox', 'student-rewards', 'lesson-plan', 'absent-list', 'library', 'materials', 'pisa-test', 'sea-plm-test', 'homework'].includes(activeSection) && (
                <div className="text-center py-20 bg-white rounded-[3rem] shadow-xl border border-dashed border-slate-200">
                  <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black font-kantumruy">ផ្នែកនេះកំពុងអភិវឌ្ឍ...</h2>
                  <p className="text-slate-400 font-khmer mt-2">សូមជ្រើសរើសផ្នែកផ្សេងៗនៅលើផ្ទាំងដើម</p>
                  <button 
                    onClick={onBack} 
                    className="mt-8 px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
                  >
                    ត្រឡប់ទៅផ្ទាំងដើម
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="tabs"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="p-4 md:p-10"
            >
              {activeTab === 'home' && <HomeTab onSelectSection={setView} atRiskCount={atRiskCount} />}
              {activeTab === 'class' && <ClassTab onSelectSection={setView} />}
              {activeTab === 'ai' && <ClassroomToolsView onBack={() => setActiveTab('home')} />}
              {activeTab === 'library' && <LibraryTab onSelectSection={setView} />}
              {activeTab === 'more' && <MoreTab onSelectSection={setView} />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      {!activeSection && (
        <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-safe z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] text-xs font-semibold">
          <div className="flex flex-row justify-around items-center h-20 max-w-lg mx-auto px-2 relative font-khmer">
            <NavItem 
              icon={<Home />} 
              label="ទំព័រដើម" 
              isActive={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
            />
            <NavItem 
              icon={<Users />} 
              label="ថ្នាក់រៀន" 
              isActive={activeTab === 'class'} 
              onClick={() => setActiveTab('class')} 
            />
            
            {/* Center Floating AI Button */}
            <div className="relative -top-6 mx-2">
              <button
                onClick={() => setActiveTab('ai')}
                className={\`flex items-center justify-center w-16 h-16 rounded-full shadow-[0_10px_20px_rgba(99,102,241,0.4)] transition-transform active:scale-95 \${activeTab === 'ai' ? 'bg-indigo-700 scale-105' : 'bg-indigo-600 hover:bg-indigo-700'}\`}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </button>
            </div>

            <NavItem 
              icon={<BookOpen />} 
              label="បណ្ណាល័យ" 
              isActive={activeTab === 'library'} 
              onClick={() => setActiveTab('library')} 
            />
            <NavItem 
              icon={<Menu />} 
              label="ផ្សេងៗ" 
              isActive={activeTab === 'more'} 
              onClick={() => setActiveTab('more')} 
            />
          </div>
        </nav>
      )}`;

code = code.replace(mainRegex, newMain);

const footerRegex = /<footer className="p-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white\/80 backdrop-blur-md">([\s\S]*?)<\/footer>/;
code = code.replace(footerRegex, ``);

const dashboardRegex = /function Dashboard\(\{[\s\S]*?\}\) \{[\s\S]*?\}\n\nfunction MenuCard/m;

const newBottomComps = `
function NavItem({ icon, label, isActive, onClick }: { icon: React.ReactElement, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={\`flex flex-col items-center justify-center gap-1 w-16 transition-colors \${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}\`}>
      <div className={\`\${isActive ? 'bg-indigo-100 p-1.5 rounded-xl' : 'p-1.5'}\`}>
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <span className="text-[10px] whitespace-nowrap">{label}</span>
    </button>
  );
}

function HomeTab({ onSelectSection, atRiskCount }: { onSelectSection: (s: string) => void, atRiskCount: number }) {
  return (
    <div className="space-y-8 pb-10">
      {/* Quick Actions Grid */}
      <section>
        <h3 className="text-lg font-bold font-kantumruy text-slate-800 mb-4">សកម្មភាពរហ័ស</h3>
        <div className="grid grid-cols-2 gap-4">
          <MenuCard actionColor="bg-emerald-50 text-emerald-600 border-emerald-200" title="វត្តមានស្កេន (QR)" icon={<QrCode className="w-8 h-8" />} onClick={() => onSelectSection('attendance')} />
          <MenuCard actionColor="bg-indigo-50 text-indigo-600 border-indigo-200" title="ជំនួយការគ្រូ AI" icon={<Sparkles className="w-8 h-8" />} onClick={() => onSelectSection('classroom-tools')} />
          <MenuCard actionColor="bg-amber-50 text-amber-600 border-amber-200" title="តារាងសម្រង់ពិន្ទុ" icon={<FileSpreadsheet className="w-8 h-8" />} onClick={() => onSelectSection('grade-summary')} />
          <MenuCard actionColor="bg-teal-50 text-teal-600 border-teal-200" title="ទំនាក់ទំនងមាតាបិតា" icon={<PhoneCall className="w-8 h-8" />} onClick={() => onSelectSection('parent-comm')} />
        </div>
      </section>

      {/* Today's Overview Section */}
      <section>
        <h3 className="text-lg font-bold font-kantumruy text-slate-800 mb-4">ទិដ្ឋភាពទូទៅថ្ងៃនេះ</h3>
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectSection('schedule')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">កាលវិភាគបង្រៀន</h4>
                <p className="text-sm text-slate-500 mt-1">មើលកាលវិភាគសម្រាប់ថ្ងៃនេះ</p>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180" />
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectSection('lesson-plan')}>
             <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center">
                <BookText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">កិច្ចតែងការថ្មីៗ</h4>
                <p className="text-sm text-slate-500 mt-1">រៀបចំកិច្ចតែងការបង្រៀន</p>
              </div>
            </div>
             <ChevronLeft className="w-5 h-5 text-slate-300 rotate-180" />
          </div>
        </div>
      </section>

      {/* At-Risk Warning CTA */}
      {atRiskCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-rose-500 to-red-600 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-rose-200 text-white"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-8 h-8 animate-pulse text-white" />
          </div>
          <div className="flex-grow text-center md:text-left">
            <h4 className="text-lg font-bold font-kantumruy">សិស្សដែលត្រូវការជំនួយ ({atRiskCount})</h4>
            <p className="text-rose-100 text-sm mt-1">សូមពិនិត្យមើលបញ្ជីសិស្សដែលមានបំណងចង់ឱ្យជួយពង្រឹងសមត្ថភាព។</p>
          </div>
          <button 
            onClick={() => onSelectSection('at-risk-warning')}
            className="px-6 py-3 bg-white text-rose-600 rounded-xl font-bold hover:bg-rose-50 transition-colors w-full md:w-auto whitespace-nowrap"
          >
            ពិនិត្យមើល
          </button>
        </motion.div>
      )}
    </div>
  );
}

function ClassTab({ onSelectSection }: { onSelectSection: (s: string) => void }) {
  return (
    <div className="space-y-4 pb-10">
      <h3 className="text-xl font-bold font-kantumruy text-slate-800 mb-6">ថ្នាក់រៀន និងសិស្ស</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MenuCard title="បញ្ជីឈ្មោះសិស្ស" icon={<Users />} color="from-rose-500 to-rose-600" onClick={() => onSelectSection('student-management')} />
        <MenuCard title="សៀវភៅតាមដាន" icon={<ClipboardList />} color="from-amber-500 to-amber-600" onClick={() => onSelectSection('daily-logs')} />
        <MenuCard title="ប្រព័ន្ធរង្វាន់សិស្ស" icon={<Trophy />} color="from-yellow-400 to-yellow-500" onClick={() => onSelectSection('student-rewards')} />
        <MenuCard title="វិភាគពិន្ទុសិស្ស" icon={<BarChart3 />} color="from-sky-500 to-indigo-600" onClick={() => onSelectSection('score-analysis')} />
        <MenuCard title="ប្លង់ថ្នាក់រៀន" icon={<Grid3X3 />} color="from-teal-400 to-teal-500" onClick={() => onSelectSection('seating-chart')} />
        <MenuCard title="កិច្ចការផ្ទះសិស្ស" icon={<Edit3 />} color="from-orange-500 to-orange-600" onClick={() => onSelectSection('homework')} />
        <MenuCard title="គ្រប់គ្រងថ្នាក់រៀន" icon={<School />} color="from-cyan-500 to-cyan-600" onClick={() => onSelectSection('classroom-mgmt')} />
        <MenuCard title="បណ្ណសរសើរឌីជីថល" icon={<Award />} color="from-yellow-500 to-amber-600" onClick={() => onSelectSection('certificates')} />
      </div>
    </div>
  );
}

function LibraryTab({ onSelectSection }: { onSelectSection: (s: string) => void }) {
  return (
    <div className="space-y-4 pb-10">
      <h3 className="text-xl font-bold font-kantumruy text-slate-800 mb-6">បណ្ណាល័យ និងធនធាន</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MenuCard title="បណ្ណាល័យឌីជីថល" icon={<Library />} color="from-violet-500 to-violet-600" onClick={() => onSelectSection('library')} />
        <MenuCard title="កញ្ចប់អំណាន" icon={<Book />} color="from-indigo-400 to-indigo-500" onClick={() => onSelectSection('egr-package')} />
        <MenuCard title="កញ្ចប់គណិតវិទ្យា" icon={<Calculator />} color="from-orange-400 to-orange-500" onClick={() => onSelectSection('egr-math')} />
        <MenuCard title="វិធីសាស្រ្តបង្រៀន" icon={<Lightbulb />} color="from-fuchsia-500 to-fuchsia-600" onClick={() => onSelectSection('teaching-strategies')} />
        <MenuCard title="យុទ្ធវិធីបង្រៀន" icon={<Target />} color="from-purple-500 to-purple-600" onClick={() => onSelectSection('teaching-tactics')} />
        <MenuCard title="គាំទ្រសិស្សយឺត" icon={<HeartHandshake />} color="from-pink-500 to-pink-600" onClick={() => onSelectSection('at-risk-warning')} />
        <MenuCard title="PISA TEST" icon={<Activity />} color="from-rose-600 to-red-700" onClick={() => onSelectSection('pisa-test')} />
        <MenuCard title="SEA-PLM TEST" icon={<TrendingUp />} color="from-blue-500 to-indigo-600" onClick={() => onSelectSection('sea-plm-test')} />
        <MenuCard title="បញ្ជីពាក្យពិបាក" icon={<SpellCheck />} color="from-indigo-400 to-blue-500" onClick={() => onSelectSection('difficult-words')} />
        <MenuCard title="តេស្តស្តង់ដារ" icon={<ClipboardCheck />} color="from-rose-500 to-rose-700" onClick={() => onSelectSection('standardized-tests')} />
        <MenuCard title="សម្ភារឧបទេស" icon={<Layers />} color="from-teal-500 to-teal-600" onClick={() => onSelectSection('materials')} />
        <MenuCard title="សន្លឹកកិច្ចការ" icon={<FileEdit />} color="from-violet-500 to-violet-700" onClick={() => onSelectSection('worksheets')} />
      </div>
    </div>
  );
}

function MoreTab({ onSelectSection }: { onSelectSection: (s: string) => void }) {
  return (
    <div className="space-y-4 pb-10">
      <h3 className="text-xl font-bold font-kantumruy text-slate-800 mb-6">ផ្សេងៗ</h3>
      <div className="flex flex-col gap-3">
        <BannerItem title="រដ្ឋបាល & ឯកសារ" subtitle="គ្រប់គ្រងទិន្នន័យរដ្ឋបាល និងឯកសារសាលា" icon={<FileText />} onClick={() => onSelectSection('administration')} />
        <BannerItem title="សារពើភ័ណ្ឌ & ខ្ចីសង" subtitle="គ្រប់គ្រងសម្ភារៈ និងការខ្ចីសង" icon={<Package />} onClick={() => onSelectSection('inventory')} />
        <BannerItem title="អភិវឌ្ឍន៍វិជ្ជាជីវៈ" subtitle="វគ្គខ្លីៗ និងឯកសារអភិវឌ្ឍសមត្ថភាពគ្រូ" icon={<Briefcase />} onClick={() => onSelectSection('teacher-dev')} />
        <BannerItem title="សញ្ញាគ្រោះថ្នាក់" subtitle="ប្រកាសអាសន្ន និងសុវត្ថិភាព" icon={<ShieldAlert />} onClick={() => onSelectSection('danger-signs')} color="text-red-600 bg-red-50 border-red-100" />
      </div>
    </div>
  );
}

function BannerItem({ title, subtitle, icon, onClick, color = "text-slate-700 bg-white border-slate-100" }: { title: string, subtitle: string, icon: React.ReactElement, onClick: () => void, color?: string }) {
  return (
    <button onClick={onClick} className={\`w-full text-left p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all flex items-center gap-4 \${color}\`}>
      <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center">
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
      </div>
      <div>
        <h4 className="font-bold font-kantumruy">{title}</h4>
        <p className="text-sm mt-1 opacity-70">{subtitle}</p>
      </div>
      <ChevronLeft className="w-5 h-5 ml-auto opacity-50 rotate-180" />
    </button>
  );
}

function MenuCard
`;

code = code.replace(dashboardRegex, newBottomComps);

// Now change the MenuCard to support actionColor
const menuCardRegex = /function MenuCard\(\{ title, icon, color, onClick \}: \{ title: string, icon: React\.ReactElement, color: string, onClick: \(\) => void \}\) \{/;
code = code.replace(menuCardRegex, `function MenuCard({ title, icon, color, actionColor, onClick }: { title: string, icon: React.ReactElement, color?: string, actionColor?: string, onClick: () => void }) {`);

// change menucard body slightly
const menuCardBodyRegex = /className="glass-card relative group p-6 rounded-\[24px\] flex flex-col items-center justify-center text-center gap-5 transition-all duration-500 cursor-pointer overflow-hidden aspect-square w-full">([\s\S]*?)<\/motion.button>/;

const newMenuCardBody = `className={\`relative group \${actionColor ? 'p-4 rounded-3xl border ' + actionColor : 'glass-card p-6 rounded-[24px]'} flex flex-col items-center justify-center text-center \${actionColor ? 'gap-3 aspect-auto h-32' : 'gap-5 aspect-square'} transition-all duration-500 cursor-pointer overflow-hidden w-full\`}>
      
      {!actionColor && color && (
        <div className={\`absolute inset-0 bg-gradient-to-br \${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0\`}></div>
      )}
      {!actionColor && (
        <div className="absolute -bottom-4 -right-4 text-slate-900/5 group-hover:text-white/20 transition-colors z-0">
          {React.cloneElement(icon, { className: 'w-24 h-24' })}
        </div>
      )}
      
      <div className={\`relative z-10 \${actionColor ? '' : 'bg-slate-50 group-hover:bg-white/20 shadow-sm'} p-4 rounded-2xl transition-all duration-500 group-hover:scale-110\`}>
        {React.cloneElement(icon, { className: \`\${actionColor ? 'w-8 h-8' : 'w-7 h-7 text-indigo-500 group-hover:text-white transition-colors duration-500'}\` })}
      </div>
      
      <span className={\`relative z-10 font-bold font-kantumruy text-sm \${actionColor ? ' leading-tight' : 'text-slate-700 group-hover:text-white transition-colors duration-500 leading-tight'}\`}>
        {title}
      </span>
    </motion.button>`;

code = code.replace(menuCardBodyRegex, newMenuCardBody);

fs.writeFileSync(filePath, code);
