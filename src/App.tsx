/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppHeader from './components/AppHeader';
import { 
  FileText, 
  Gamepad2, 
  BookOpen, 
  Library, 
  BarChart3, 
  School,
  ChevronLeft,
  GraduationCap,
  Save,
  CheckCircle2,
  Layers,
  Book,
  Activity,
  Search,
  Target,
  Edit3,
  Calendar,
  Sparkles,
  RefreshCw,
  Download,
  Plus,
  Info,
  ClipboardList,
  Layout,
  TrendingUp,
  Award,
  Trophy,
  CalendarCheck,
  Trash2,
  Users,
  UserX,
  IdCard,
  QrCode,
  MessageSquare,
  Timer as TimerIcon,
  CheckSquare,
  Package,
  AlertTriangle,
  RotateCw,
  Zap,
  Calculator,
  BookText,
  Grid3X3,
  BookCopy,
  PenTool,
  Wrench,
  Home,
  FileSpreadsheet,
  Lightbulb,
  HeartHandshake,
  SpellCheck,
  ShieldAlert,
  PhoneCall,
  Briefcase,
  ClipboardCheck,
  FileEdit,
  Menu,
  Presentation
} from 'lucide-react';
import { db, auth } from './lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Grade, Student, AttendanceRecord, ScoreRecord, DailyLog, LessonPlanPDF, LibraryFile, TeachingMaterialFile } from './types';

// Importing Views
import AttendanceView from './components/AttendanceView';
import StudentManagementView from './components/StudentManagementView';
import ScoreAnalysisView from './components/ScoreAnalysisView';
import GradeSummaryView from './components/GradeSummaryView';
import DailyLogView from './components/DailyLogView';
import TeacherDevView from './components/TeacherDevView';
import ClassroomToolsView from './components/ClassroomToolsView';
import AdminCalendarView from './components/AdminCalendarView';
import StudentCardView from './components/StudentCardView';
import SchoolArchiveView from './components/SchoolArchiveView';
import DifficultWordsView from './components/DifficultWordsView';
import AtRiskWarningView from './components/AtRiskWarningView';
import QRScannerView from './components/QRScannerView';
import StudentQRView from './components/StudentQRView';
import TeachingScheduleView from './components/TeachingScheduleView';
import ParentCommunicationView from './components/ParentCommunicationView';
import ClassroomManagementView from './components/ClassroomManagementView';
import AdministrationView from './components/AdministrationView';
import ResourceTrackingView from './components/ResourceTrackingView';
import EGRPackageView from './components/EGRPackageView';
import EarlyGradeMathView from './components/EarlyGradeMathView';
import DigitalCertificateView from './components/DigitalCertificateView';
import SeatingChartView from './components/SeatingChartView';
import TeachingStrategiesView from './components/TeachingStrategiesView';
import TeacherToolboxView from './components/TeacherToolboxView';
import StudentRewardsView from './components/StudentRewardsView';
import LessonPlanForm from './components/LessonPlanForm';
import GenericPDFArchiveView from './components/GenericPDFArchiveView';
import MonthlyAttendanceReport from './components/MonthlyAttendanceReport';
import AdminDashboard from './components/AdminDashboard';
import LoginView from './components/LoginView';
import TeacherAccountManagementView from './components/TeacherAccountManagementView';
import { KeyRound } from 'lucide-react';

import InstructionGuideModal from './components/InstructionGuideModal';
import { HelpCircle } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<string>('dashboard');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [seenGuides, setSeenGuides] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('seenGuides');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const handleCloseGuide = () => {
    setShowGuide(false);
  };

  useEffect(() => {
    if (isAuthenticated && view !== 'dashboard' && !seenGuides[view]) {
      setShowGuide(true);
      const newSeen = { ...seenGuides, [view]: true };
      setSeenGuides(newSeen);
      localStorage.setItem('seenGuides', JSON.stringify(newSeen));
    }
  }, [view, isAuthenticated, seenGuides]);

  const onBack = () => setView('dashboard');
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [atRiskCount, setAtRiskCount] = useState(0);

  // PDF States (Mocked or persisted in Firestore if preferred, but usually handled in views)
  const [lessonPlanPDFs, setLessonPlanPDFs] = useState<LessonPlanPDF[]>([]);
  const [libraryFiles, setLibraryFiles] = useState<LibraryFile[]>([]);
  const [teachingMaterialsFiles, setTeachingMaterialsFiles] = useState<TeachingMaterialFile[]>([]);
  const [pisaFiles, setPisaFiles] = useState<LibraryFile[]>([]);
  const [seaPlmFiles, setSeaPlmFiles] = useState<LibraryFile[]>([]);
  const [homeworkFiles, setHomeworkFiles] = useState<LibraryFile[]>([]);

  // Firestore Listeners
  useEffect(() => {
    const unsubStudents = onSnapshot(query(collection(db, 'students'), orderBy('name', 'asc')), (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    
    const unsubAttendance = onSnapshot(collection(db, 'attendance'), (snap) => {
      setAttendance(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AttendanceRecord[]);
    });

    const unsubScores = onSnapshot(query(collection(db, 'scores'), orderBy('createdAt', 'desc')), (snap) => {
      setScores(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ScoreRecord[]);
    });

    const unsubLogs = onSnapshot(collection(db, 'daily_logs'), (snap) => {
      setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DailyLog[]);
    });

    const unsubLessonPlans = onSnapshot(collection(db, 'lesson_plans_pdfs'), (snap) => {
      setLessonPlanPDFs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LessonPlanPDF[]);
    });

    const unsubLibrary = onSnapshot(collection(db, 'library_files'), (snap) => {
      setLibraryFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LibraryFile[]);
    });

    const unsubTeaching = onSnapshot(collection(db, 'teaching_materials'), (snap) => {
      setTeachingMaterialsFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TeachingMaterialFile[]);
    });

    const unsubPisa = onSnapshot(collection(db, 'pisa_files'), (snap) => {
      setPisaFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LibraryFile[]);
    });

    const unsubSeaPlm = onSnapshot(collection(db, 'seaplm_files'), (snap) => {
      setSeaPlmFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LibraryFile[]);
    });

    const unsubHomework = onSnapshot(collection(db, 'homework_files'), (snap) => {
      setHomeworkFiles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LibraryFile[]);
    });

    return () => {
      unsubStudents();
      unsubAttendance();
      unsubScores();
      unsubLogs();
      unsubLessonPlans();
      unsubLibrary();
      unsubTeaching();
      unsubPisa();
      unsubSeaPlm();
      unsubHomework();
    };
  }, []);

  // Update at-risk count
  useEffect(() => {
    const count = students.filter(s => {
      const studentScores = scores.filter(sc => sc.studentId === s.id);
      if (studentScores.length === 0) return false;
      const recentScore = studentScores[0];
      return (recentScore.reading < 5 || recentScore.math?.operations < 5);
    }).length;
    setAtRiskCount(count);
  }, [students, scores]);



  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('app_auth_status');
    localStorage.removeItem('admin_auth');
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  const isAdmin = !!localStorage.getItem('adminName');

  return (
    <div className="min-h-screen mesh-pastel-bg flex flex-col font-khmer text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <AppHeader onLogout={handleLogout} />
      
      <main className="flex-grow p-4 md:p-10 max-w-[1400px] mx-auto w-full print:p-0 print:max-w-none">
        <AnimatePresence mode="wait">
          {view === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {isAdmin && <AdminDashboard />}
              <Dashboard setView={setView} atRiskCount={atRiskCount} />
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'attendance' && <AttendanceView onBack={onBack} />}
              {view === 'student-management' && <StudentManagementView onBack={onBack} />}
              {view === 'score-analysis' && <ScoreAnalysisView onBack={onBack} />}
              {view === 'grade-summary' && <GradeSummaryView onBack={onBack} students={students} />}
              {view === 'daily-logs' && <DailyLogView onBack={onBack} />}
              {view === 'teacher-dev' && <TeacherDevView onBack={onBack} />}
              {view === 'classroom-tools' && <ClassroomToolsView onBack={onBack} />}
              {view === 'admin-calendar' && <AdminCalendarView onBack={onBack} />}
              {view === 'student-card' && <StudentCardView onBack={onBack} />}
              {view === 'school-archive' && <SchoolArchiveView onBack={onBack} />}
              {view === 'difficult-words' && <DifficultWordsView onBack={onBack} />}
              {view === 'at-risk-warning' && <AtRiskWarningView onBack={onBack} />}
              {view === 'qr-scanner' && <QRScannerView onBack={onBack} />}
              {view === 'student-qr' && <StudentQRView onBack={onBack} students={students} />}
              {view === 'schedule' && <TeachingScheduleView onBack={onBack} />}
              {view === 'parent-comm' && <ParentCommunicationView onBack={onBack} />}
              {view === 'classroom-mgmt' && <ClassroomManagementView onBack={onBack} students={students} />}
              {view === 'administration' && <AdministrationView onBack={onBack} students={students} />}
              {view === 'teacher-accounts' && <TeacherAccountManagementView onBack={onBack} />}
              {view === 'resources' && <ResourceTrackingView onBack={onBack} />}
              {view === 'egr-package' && <EGRPackageView onBack={onBack} />}
              {view === 'egr-math' && <EarlyGradeMathView onBack={onBack} students={students} />}
              {view === 'certificates' && <DigitalCertificateView onBack={onBack} students={students} />}
              {view === 'seating-chart' && <SeatingChartView onBack={onBack} students={students} />}
              {view === 'teaching-strategies' && <TeachingStrategiesView onBack={onBack} />}
              {view === 'toolbox' && <TeacherToolboxView onBack={onBack} />}
              {view === 'student-rewards' && <StudentRewardsView onBack={onBack} />}
              {view === 'lesson-plan' && <LessonPlanForm onBack={onBack} />}
              {view === 'absent-list' && <MonthlyAttendanceReport onBack={onBack} />}
              
              {view === 'library' && (
                <GenericPDFArchiveView 
                  title="បណ្ណាល័យឌីជីថល"
                  description="ជ្រើសរើសកម្រិតថ្នាក់ដើម្បីមើលសៀវភៅ និងឯកសារជំនួយស្មារតី"
                  onBack={onBack} 
                  pdfs={libraryFiles}
                  onSavePDF={(pdf) => setLibraryFiles([...libraryFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setLibraryFiles(libraryFiles.filter(p => p.id !== id))}
                />
              )}
              {view === 'materials' && (
                <GenericPDFArchiveView 
                  title="សម្ភារឧបទេស"
                  description="បណ្ដុំសម្ភារបង្រៀន និងរៀនសម្រាប់គ្រូ និងសិស្ស"
                  onBack={onBack} 
                  pdfs={teachingMaterialsFiles}
                  onSavePDF={(pdf) => setTeachingMaterialsFiles([...teachingMaterialsFiles, pdf as TeachingMaterialFile])}
                  onDeletePDF={(id) => setTeachingMaterialsFiles(teachingMaterialsFiles.filter(p => p.id !== id))}
                />
              )}
               {view === 'pisa-test' && (
                <GenericPDFArchiveView 
                  title="PISA TEST"
                  description="បណ្តុំវិញ្ញាសារតេស្ត PISA សម្រាប់វាស់ស្ទង់សមត្ថភាពសិស្ស"
                  onBack={onBack} 
                  pdfs={pisaFiles}
                  onSavePDF={(pdf) => setPisaFiles([...pisaFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setPisaFiles(pisaFiles.filter(p => p.id !== id))}
                />
              )}
              {view === 'sea-plm-test' && (
                <GenericPDFArchiveView 
                  title="SEA-PLM TEST"
                  description="បណ្តុំវិញ្ញាសារតេស្ត SEA-PLM សម្រាប់កម្រិតបឋមសិក្សា"
                  onBack={onBack} 
                  pdfs={seaPlmFiles}
                  onSavePDF={(pdf) => setSeaPlmFiles([...seaPlmFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setSeaPlmFiles(seaPlmFiles.filter(p => p.id !== id))}
                />
              )}
              {view === 'homework' && (
                <GenericPDFArchiveView 
                  title="កិច្ចការផ្ទះ"
                  description="រៀបចំ និងដាក់កិច្ចការផ្ទះសម្រាប់សិស្សតាមកម្រិតថ្នាក់"
                  onBack={onBack} 
                  pdfs={homeworkFiles}
                  onSavePDF={(pdf) => setHomeworkFiles([...homeworkFiles, pdf as LibraryFile])}
                  onDeletePDF={(id) => setHomeworkFiles(homeworkFiles.filter(p => p.id !== id))}
                />
              )}
              
              {!['dashboard', 'attendance', 'student-management', 'score-analysis', 'grade-summary', 'daily-logs', 'teacher-dev', 'classroom-tools', 'admin-calendar', 'student-card', 'school-archive', 'difficult-words', 'at-risk-warning', 'qr-scanner', 'schedule', 'parent-comm', 'classroom-mgmt', 'administration', 'resources', 'egr-package', 'egr-math', 'certificates', 'seating-chart', 'teaching-strategies', 'toolbox', 'student-rewards', 'lesson-plan', 'absent-list', 'library', 'materials', 'pisa-test', 'sea-plm-test', 'homework'].includes(view) && (
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
          )}
        </AnimatePresence>
      </main>

      {/* Instruction Guide Modal */}
      <InstructionGuideModal 
        isOpen={showGuide} 
        onClose={handleCloseGuide} 
        currentView={view} 
      />

      <footer className="p-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white/80 backdrop-blur-md">
        <p className="font-kantumruy">&copy; {new Date().getFullYear()} ប្រព័ន្ធគ្រប់គ្រងថ្នាក់រៀនឆ្លាតវៃ</p>
        <p className="mt-2 text-xs opacity-60">រចនាសម្រាប់គ្រូបង្រៀនកម្ពុជា</p>
      </footer>

    </div>
  );
}


function Dashboard({ setView, atRiskCount }: { setView: (view: string) => void, atRiskCount: number }) {
  return (
    <div className="space-y-12">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-2xl border border-white/60 rounded-[2rem] p-6 md:p-10 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row items-center justify-center gap-6">
        {/* 7 Colors Background Blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-rose-300/50 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300/50 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-80 h-80 bg-cyan-300/50 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-96 h-96 bg-amber-300/50 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute top-[20%] left-[30%] w-[28rem] h-[28rem] bg-emerald-300/40 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-[10%] right-[30%] w-72 h-72 bg-blue-300/50 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[40%] w-80 h-80 bg-orange-300/50 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Glossy overlay */}
        <div className="absolute inset-0 bg-white/30 z-0 pointer-events-none"></div>

        <div className="relative z-10 w-full text-center py-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl md:text-4xl font-black font-moul tracking-wider leading-loose flex flex-wrap items-center justify-center gap-3 md:gap-4 py-2">
            <img 
              src="https://img.icons8.com/color/96/teacher.png" 
              alt="Teacher Icon" 
              className="w-10 h-10 md:w-14 md:h-14 shrink-0 drop-shadow-md hover:scale-105 transition-transform" 
            />
            <span className="text-slate-800 drop-shadow-sm">សូមស្វាគមន៍មកកាន់ </span> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-900 drop-shadow-sm pb-2 pt-1 px-1">គ្រូបង្រៀនឌីជីថល</span>
          </h1>
        </div>
      </div>

      {/* At-Risk Warning */}
      {atRiskCount > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-[2rem] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-left"
        >
          <div className="flex gap-4 items-center w-full">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="flex-grow">
              <h3 className="text-red-800 font-bold font-kantumruy text-base sm:text-lg leading-snug">មានសិស្សប្រឈមចំនួន {atRiskCount} នាក់</h3>
              <p className="text-red-600 text-xs sm:text-sm mt-1 sm:mt-0">សិស្សទាមទារការយកចិត្តទុកដាក់ និងជំនួយបន្ថែមជាបន្ទាន់។</p>
            </div>
          </div>
          <button 
            onClick={() => setView('at-risk-warning')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shrink-0 w-full sm:w-auto text-sm sm:text-base mt-2 sm:mt-0 whitespace-nowrap"
          >
            ពិនិត្យមើល
          </button>
        </motion.div>
      )}

      {/* 1. Class & Student Management */}
      <section className="bg-indigo-50/50 border border-indigo-100/50 rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold mb-4 sm:mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">
          <Users className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-indigo-600" /> ១. ផ្នែកគ្រប់គ្រងថ្នាក់រៀន និងសិស្ស
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <MenuCard title="បញ្ជីឈ្មោះសិស្ស" icon={<Users />} color="indigo" onClick={() => setView('student-management')} />
          <MenuCard title="QR សិស្ស" icon={<QrCode />} color="purple" onClick={() => setView('student-qr')} />
          <MenuCard title="វត្តមានស្កេន (QR)" icon={<QrCode />} color="emerald" onClick={() => setView('qr-scanner')} />
          <MenuCard title="គ្រប់គ្រងថ្នាក់រៀន" icon={<School />} color="sky" onClick={() => setView('classroom-mgmt')} />
          <MenuCard title="ប្លង់ថ្នាក់រៀន" icon={<Grid3X3 />} color="teal" onClick={() => setView('seating-chart')} />
          <MenuCard title="ទំនាក់ទំនងមាតាបិតា" icon={<PhoneCall />} color="pink" onClick={() => setView('parent-comm')} />
        </div>
      </section>

      {/* 2. Instructional Planning & Tools */}
      <section className="bg-amber-50/50 border border-amber-100/50 rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold mb-4 sm:mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">
          <BookText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-amber-600" /> ២. ផ្នែកផែនការ និងការបង្រៀនប្រចាំថ្ងៃ
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <MenuCard title="បង្កើតកិច្ចតែងការ" icon={<BookText />} color="amber" onClick={() => setView('lesson-plan')} />
          <MenuCard title="ជំនួយការគ្រូ AI" icon={<Sparkles />} color="violet" onClick={() => setView('classroom-tools')} />
          <MenuCard title="កាលវិភាគបង្រៀន" icon={<Calendar />} color="cyan" onClick={() => setView('schedule')} />
          <MenuCard title="វិធីសាស្ត្របង្រៀន" icon={<Lightbulb />} color="fuchsia" onClick={() => setView('teaching-strategies')} />
          <MenuCard title="សម្ភារឧបទេស" icon={<Layers />} color="green" onClick={() => setView('materials')} />
        </div>
      </section>

      {/* 3. Assessment & Analytics */}
      <section className="bg-sky-50/50 border border-sky-100/50 rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold mb-4 sm:mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">
          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-sky-600" /> ៣. ផ្នែកវាយតម្លៃ និងលទ្ធផលសិក្សា
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <MenuCard title="តារាងសម្រង់ពិន្ទុ" icon={<FileSpreadsheet />} color="blue" onClick={() => setView('grade-summary')} />
          <MenuCard title="វិភាគពិន្ទុសិស្ស" icon={<BarChart3 />} color="orange" onClick={() => setView('score-analysis')} />
          <MenuCard title="សៀវភៅតាមដាន" icon={<ClipboardList />} color="lime" onClick={() => setView('daily-logs')} />
          <MenuCard title="បណ្ណសរសើរឌីជីថល" icon={<Award />} color="yellow" onClick={() => setView('certificates')} />
          <MenuCard title="ប្រព័ន្ធរង្វាន់សិស្ស" icon={<Trophy />} color="purple" onClick={() => setView('student-rewards')} />
        </div>
      </section>

      {/* 4. Learning Resources & Intervention */}
      <section className="bg-violet-50/50 border border-violet-100/50 rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold mb-4 sm:mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">
          <Library className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-violet-600" /> ៤. ផ្នែកធនធានសិក្សា និងកញ្ចប់គាំទ្រ
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <MenuCard title="បណ្ណាល័យឌីជីថល" icon={<BookOpen />} color="rose" onClick={() => setView('library')} />
          <MenuCard title="កញ្ចប់អំណាន" icon={<Book />} color="red" onClick={() => setView('egr-package')} />
          <MenuCard title="កញ្ចប់គណិតវិទ្យា" icon={<Calculator />} color="zinc" onClick={() => setView('egr-math')} />
          <MenuCard title="គាំទ្រសិស្សរៀនយឺត" icon={<ShieldAlert />} color="slate" onClick={() => setView('at-risk-warning')} />
          <MenuCard title="បញ្ជីពាក្យពិបាក" icon={<SpellCheck />} color="stone" onClick={() => setView('difficult-words')} />
          <MenuCard title="តេស្ត PISA" icon={<Activity />} color="gray" onClick={() => setView('pisa-test')} />
          <MenuCard title="តេស្ត SEA-PLM" icon={<TrendingUp />} color="neutral" onClick={() => setView('sea-plm-test')} />
        </div>
      </section>
      
      {/* 5. Administration & Logistics */}
      <section className="bg-slate-100 border border-slate-200/50 rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold mb-4 sm:mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-slate-600" /> ៥. ផ្នែករដ្ឋបាល ភស្តុភារ និងសុវត្ថិភាព
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <MenuCard title="រដ្ឋបាល & ឯកសារ" icon={<FileText />} color="indigo2" onClick={() => setView('administration')} />
          <MenuCard title="គណនីគ្រូ (បញ្ជាក់អត្តសញ្ញាណ)" icon={<KeyRound />} color="cyan2" onClick={() => setView('teacher-accounts')} />
          <MenuCard title="សារពើភ័ណ្ឌ & ខ្ចីសង" icon={<Package />} color="sky2" onClick={() => setView('inventory')} />
          <MenuCard title="សញ្ញាគ្រោះថ្នាក់" icon={<ShieldAlert />} color="pink2" onClick={() => setView('danger-signs')} />
        </div>
      </section>

      {/* 6. Professional Development */}
      <section className="bg-teal-50/50 border border-teal-100/50 rounded-[2rem] p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <h2 className="text-lg md:text-xl font-bold mb-4 sm:mb-5 text-slate-800 flex items-center gap-3 font-kantumruy tracking-tight">
          <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-teal-600" /> ៦. ផ្នែកអភិវឌ្ឍន៍វិជ្ជាជីវៈ
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          <MenuCard title="អភិវឌ្ឍន៍វិជ្ជាជីវៈ" icon={<Briefcase />} color="emerald2" onClick={() => setView('teacher-dev')} />
        </div>
      </section>
    </div>
  );
}

function MenuCard({ title, icon, color, onClick }: { title: string, icon: React.ReactElement, color: string, onClick: () => void }) {
  const colorMap: Record<string, { bg: string, text: string, iconBg: string, iconColor: string, hoverBorder: string, hoverShadow: string }> = {
    "indigo": { bg: "bg-indigo-50/80", text: "text-indigo-800", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", hoverBorder: "hover:border-indigo-200", hoverShadow: "hover:shadow-indigo-500/10" },
    "emerald": { bg: "bg-emerald-50/80", text: "text-emerald-800", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", hoverBorder: "hover:border-emerald-200", hoverShadow: "hover:shadow-emerald-500/10" },
    "sky": { bg: "bg-sky-50/80", text: "text-sky-800", iconBg: "bg-sky-100", iconColor: "text-sky-600", hoverBorder: "hover:border-sky-200", hoverShadow: "hover:shadow-sky-500/10" },
    "teal": { bg: "bg-teal-50/80", text: "text-teal-800", iconBg: "bg-teal-100", iconColor: "text-teal-600", hoverBorder: "hover:border-teal-200", hoverShadow: "hover:shadow-teal-500/10" },
    "pink": { bg: "bg-pink-50/80", text: "text-pink-800", iconBg: "bg-pink-100", iconColor: "text-pink-600", hoverBorder: "hover:border-pink-200", hoverShadow: "hover:shadow-pink-500/10" },
    "amber": { bg: "bg-amber-50/80", text: "text-amber-800", iconBg: "bg-amber-100", iconColor: "text-amber-600", hoverBorder: "hover:border-amber-200", hoverShadow: "hover:shadow-amber-500/10" },
    "violet": { bg: "bg-violet-50/80", text: "text-violet-800", iconBg: "bg-violet-100", iconColor: "text-violet-600", hoverBorder: "hover:border-violet-200", hoverShadow: "hover:shadow-violet-500/10" },
    "cyan": { bg: "bg-cyan-50/80", text: "text-cyan-800", iconBg: "bg-cyan-100", iconColor: "text-cyan-600", hoverBorder: "hover:border-cyan-200", hoverShadow: "hover:shadow-cyan-500/10" },
    "fuchsia": { bg: "bg-fuchsia-50/80", text: "text-fuchsia-800", iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600", hoverBorder: "hover:border-fuchsia-200", hoverShadow: "hover:shadow-fuchsia-500/10" },
    "green": { bg: "bg-green-50/80", text: "text-green-800", iconBg: "bg-green-100", iconColor: "text-green-600", hoverBorder: "hover:border-green-200", hoverShadow: "hover:shadow-green-500/10" },
    "blue": { bg: "bg-blue-50/80", text: "text-blue-800", iconBg: "bg-blue-100", iconColor: "text-blue-600", hoverBorder: "hover:border-blue-200", hoverShadow: "hover:shadow-blue-500/10" },
    "orange": { bg: "bg-orange-50/80", text: "text-orange-800", iconBg: "bg-orange-100", iconColor: "text-orange-600", hoverBorder: "hover:border-orange-200", hoverShadow: "hover:shadow-orange-500/10" },
    "lime": { bg: "bg-lime-50/80", text: "text-lime-800", iconBg: "bg-lime-100", iconColor: "text-lime-600", hoverBorder: "hover:border-lime-200", hoverShadow: "hover:shadow-lime-500/10" },
    "yellow": { bg: "bg-yellow-50/80", text: "text-yellow-800", iconBg: "bg-yellow-100", iconColor: "text-yellow-600", hoverBorder: "hover:border-yellow-200", hoverShadow: "hover:shadow-yellow-500/10" },
    "purple": { bg: "bg-purple-50/80", text: "text-purple-800", iconBg: "bg-purple-100", iconColor: "text-purple-600", hoverBorder: "hover:border-purple-200", hoverShadow: "hover:shadow-purple-500/10" },
    "rose": { bg: "bg-rose-50/80", text: "text-rose-800", iconBg: "bg-rose-100", iconColor: "text-rose-600", hoverBorder: "hover:border-rose-200", hoverShadow: "hover:shadow-rose-500/10" },
    "red": { bg: "bg-red-50/80", text: "text-red-800", iconBg: "bg-red-100", iconColor: "text-red-600", hoverBorder: "hover:border-red-200", hoverShadow: "hover:shadow-red-500/10" },
    "zinc": { bg: "bg-zinc-50/80", text: "text-zinc-800", iconBg: "bg-zinc-100", iconColor: "text-zinc-600", hoverBorder: "hover:border-zinc-200", hoverShadow: "hover:shadow-zinc-500/10" },
    "slate": { bg: "bg-slate-50/80", text: "text-slate-800", iconBg: "bg-slate-100", iconColor: "text-slate-600", hoverBorder: "hover:border-slate-200", hoverShadow: "hover:shadow-slate-500/10" },
    "stone": { bg: "bg-stone-50/80", text: "text-stone-800", iconBg: "bg-stone-100", iconColor: "text-stone-600", hoverBorder: "hover:border-stone-200", hoverShadow: "hover:shadow-stone-500/10" },
    "gray": { bg: "bg-gray-50/80", text: "text-gray-800", iconBg: "bg-gray-100", iconColor: "text-gray-600", hoverBorder: "hover:border-gray-200", hoverShadow: "hover:shadow-gray-500/10" },
    "neutral": { bg: "bg-neutral-50/80", text: "text-neutral-800", iconBg: "bg-neutral-100", iconColor: "text-neutral-600", hoverBorder: "hover:border-neutral-200", hoverShadow: "hover:shadow-neutral-500/10" },
    "indigo2": { bg: "bg-indigo-100/60", text: "text-indigo-900", iconBg: "bg-indigo-200", iconColor: "text-indigo-700", hoverBorder: "hover:border-indigo-300", hoverShadow: "hover:shadow-indigo-600/10" },
    "cyan2": { bg: "bg-cyan-100/60", text: "text-cyan-900", iconBg: "bg-cyan-200", iconColor: "text-cyan-700", hoverBorder: "hover:border-cyan-300", hoverShadow: "hover:shadow-cyan-600/10" },
    "sky2": { bg: "bg-sky-100/60", text: "text-sky-900", iconBg: "bg-sky-200", iconColor: "text-sky-700", hoverBorder: "hover:border-sky-300", hoverShadow: "hover:shadow-sky-600/10" },
    "pink2": { bg: "bg-pink-100/60", text: "text-pink-900", iconBg: "bg-pink-200", iconColor: "text-pink-700", hoverBorder: "hover:border-pink-300", hoverShadow: "hover:shadow-pink-600/10" },
    "emerald2": { bg: "bg-emerald-100/60", text: "text-emerald-900", iconBg: "bg-emerald-200", iconColor: "text-emerald-700", hoverBorder: "hover:border-emerald-300", hoverShadow: "hover:shadow-emerald-600/10" }
  };

  const mapped = colorMap[color] || { bg: "bg-slate-50/80", text: "text-slate-800", iconBg: "bg-slate-200", iconColor: "text-slate-600", hoverBorder: "hover:border-slate-300", hoverShadow: "hover:shadow-slate-500/10" };
  const { bg, text, iconBg, iconColor, hoverBorder, hoverShadow } = mapped;

  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`border border-transparent ${bg} ${hoverBorder} shadow-sm hover:shadow-lg ${hoverShadow} relative group p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col items-start justify-between text-left gap-3 sm:gap-4 transition-all duration-300 cursor-pointer overflow-hidden aspect-[4/3] sm:aspect-auto sm:h-36 w-full`}
    >
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-[1rem] flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${iconBg} ${iconColor} shadow-sm`}>
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { 
          className: "w-5 h-5 sm:w-6 sm:h-6 stroke-[2px]" 
        })}
      </div>

      <div className="w-full">
        <h3 className={`text-xs sm:text-sm font-black ${text} font-kantumruy leading-snug line-clamp-2 transition-colors duration-300`}>
          {title}
        </h3>
      </div>
    </motion.button>
  );
}
