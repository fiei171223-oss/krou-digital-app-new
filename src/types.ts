export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Methodology {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface StepContent {
  teacherActivity: string;
  content: string;
  studentActivity: string;
}

export interface LessonPlan {
  grade: Grade;
  chapter: string;
  chapterTitle: string;
  lesson: string;
  lessonTitle: string;
  subject: string;
  methodology: string;
  strategy: string;
  subTitle: string;
  objectives: {
    knowledge: string;
    skills: string;
    attitude: string;
  };
  materials: {
    teacher: string;
    student: string;
  };
  duration: number;
  date: string;
  lessonContent: {
    text: string;
  };
  steps: {
    step1: StepContent;
    step2: StepContent;
    step3: StepContent;
    step4: StepContent;
    step5: StepContent;
  };
  references?: string;
  teachingMethods?: string;
  location?: string;
  taughtBy?: string;
  schoolLogo?: string;
}

export interface LessonPlanPDF {
  id: string;
  title: string;
  grade: Grade;
  subject: string;
  date: string;
  fileName: string;
  fileData: string; // Base64
}

export interface LibraryFile {
  id: string;
  title: string;
  grade: Grade;
  subject: string;
  date: string;
  fileName: string;
  fileData: string; // Base64
}

export interface TeachingMaterialFile {
  id: string;
  title: string;
  grade: Grade;
  subject: string;
  date: string;
  fileName: string;
  fileData: string; // Base64
}

export interface PisaExercise {
  id: string;
  title: string;
  question: string;
  image: string | null;
  options?: { id: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  grade?: Grade;
  date: string;
}

export interface SeaPlmExercise {
  id: string;
  title: string;
  question: string;
  image: string | null;
  correctAnswer: string;
  explanation: string;
  date: string;
}

export interface Worksheet {
  id: string;
  title: string;
  grade: Grade;
  subject: string;
  lesson: string;
  date: string;
  fileName: string;
  fileData: string; // Base64 or URL
}

export interface Homework {
  id: string;
  title: string;
  grade: Grade;
  subject: string;
  lesson: string;
  dueDate: string;
  description: string;
  status: 'assigned' | 'completed';
  studentSubmissions: StudentSubmission[];
}

export interface StudentSubmission {
  id: string;
  studentName: string;
  submissionDate: string;
  imageData: string; // Base64
}

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName: string;
  grade: Grade;
  date: string;
  status: 'present' | 'absent' | 'late' | 'permission';
  timestamp?: number;
}

export interface SlowLearner {
  id: string;
  studentName: string;
  grade: Grade;
  gender: 'male' | 'female';
  weakSubjects: string[];
  notes: string;
  progress: string;
}

export interface StudentStars {
  cleanliness: number;
  friendliness: number;
  helpingOthers: number;
  learningActivity: number;
  groupWork: number;
  homework: number;
}

export interface Vaccine {
  name: string;
  date: string;
  nextDate?: string;
}

export interface StudentHealth {
  height?: number;
  weight?: number;
  bmi?: number;
  vaccines?: Vaccine[];
}

export interface Student {
  id: string;
  rollNumber?: string;
  name: string;
  nameLatin?: string;
  grade: Grade;
  gender: 'male' | 'female' | 'ប្រុស' | 'ស្រី' | 'ស' | 'ប';
  dob?: string;
  age?: number;
  pob?: string;
  address?: string;
  village?: string;
  district?: string;
  province?: string;
  fatherName?: string;
  fatherJob?: string;
  motherName?: string;
  motherJob?: string;
  status?: 'active' | 'inactive';
  // Status categories
  isNew?: boolean;
  isRepeater?: boolean;
  isOrphan?: boolean;
  isPoor?: boolean;
  isDisabled?: boolean;
  stars: StudentStars;
  badges: string[];
  photoUrl?: string;
  health?: StudentHealth;
  emergencyContact?: string;
  familyStatus?: string;
  parentTelegramId?: string;
  academicYear?: string;
  strengths?: string;
  weaknesses?: string;
  updatedAt?: string;
}

export interface ScheduleEntry {
  id?: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  time: string;
  subject: string;
  grade: string;
}

export interface CommunicationNotice {
  id?: string;
  title: string;
  message: string;
  photoUrl?: string;
  date: string;
  recipients: string[]; // ['grade-1', 'all', studentId]
}

export interface ChecklistItem {
  id?: string;
  task: string;
  completed: boolean;
  dueDate?: string;
  category: 'teaching' | 'admin' | 'finance';
}

export interface TeacherEvent {
  id?: string;
  title: string;
  description: string;
  date: string;
  type: 'meeting' | 'holiday' | 'admin' | 'exam';
}

export interface ScoreRecord {
  id?: string;
  studentId: string;
  studentName: string;
  // Specific Subjects
  reading: number;
  writing: number;
  math: {
    numbers: number;
    operations: number;
    geometry: number;
    algebra: number;
    statistics: number;
  };
  science: number;
  socialStudies: number;
  arts: number;
  pe: number;
  health: number;
  lifeSkills: number;
  total?: number;
  average?: number;
  gradeKhmer?: string;
  gradeLatin?: string;
  month: string;
  year: number;
  gradeValue: Grade;
  category: 'monthly' | 'semester' | 'assignment';
  createdAt: string;
}

export interface ReadingRecord {
  id?: string;
  studentId: string;
  bookTitle: string;
  level: 'A' | 'B' | 'C' | 'D' | 'E';
  date: string;
  status: 'reading' | 'completed';
}

export interface DifficultWord {
  id?: string;
  studentId: string;
  word: string;
  context?: string;
  date: string;
}

export interface BookLending {
  id?: string;
  studentId: string;
  studentName: string;
  bookTitle: string;
  dateOut: string;
  dateIn?: string;
  status: 'borrowed' | 'returned';
}

export interface AdminTask {
  id?: string;
  title: string;
  isDone: boolean;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

export interface CalendarEvent {
  id?: string;
  title: string;
  date: string;
  type: 'holiday' | 'meeting' | 'exam' | 'other';
  color?: string;
}

export interface Lesson {
  subject: string;
  topic: string;
}

export interface HomeworkAssignment {
  task: string;
  deadline: string;
}

export interface DailyLog {
  id?: string;
  studentId: string;
  date: string;
  learningActivity: string;
  groupWork: string;
  homeworkStatus: 'not_assigned' | 'pending' | 'completed';
  behaviorNote: string;
  parentSignature: boolean;
  updatedAt?: string;
}

export interface ProfessionalDev {
  id?: string;
  title: string;
  category: 'teaching_method' | 'research' | 'experience' | 'policy';
  type: 'pdf' | 'video' | 'link' | 'text';
  content: string;
  author: string;
  tags: string[];
  createdAt?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: 'holiday' | 'technical_meeting' | 'inspection' | 'ceremony' | 'other';
}

export interface ReadingBook {
  id: string;
  title: string;
  level: string;
  category: string;
  coverUrl?: string;
  contentUrl: string;
}

export interface ParentCommunication {
  id: string;
  studentId: string;
  type: 'telegram' | 'notification' | 'meeting';
  message: string;
  date: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface MediaResource {
  id: string;
  title: string;
  type: 'image' | 'video' | 'audio' | 'flashcard';
  category: string;
  url: string;
  tags: string[];
}

export interface TeacherReward {
  id: string;
  studentId: string;
  type: 'medal' | 'star' | 'badge';
  reason: string;
  points: number;
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  total: number;
  available: number;
  category: 'textbook' | 'equipment' | 'stationary';
}

export interface TeacherSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periods: {
    time: string;
    subject: string;
    grade: Grade;
  }[];
}

export interface ErrorAnalysis {
  id: string;
  subject: string;
  topic: string;
  failedPercentage: number;
  commonMistakes: string[];
  recommendation: string;
  date: string;
}

export interface MathMaterial {
  id?: string;
  name: string;
  total: number;
  status: 'good' | 'damaged' | 'lost' | 'ក្នុងស្ថានភាពល្អ' | 'ខូចខាត' | 'បាត់បង់';
  notes?: string;
  category: string;
}

export interface MathAssessment {
  id?: string;
  studentId: string;
  studentName: string;
  date: string;
  numberRecognition: number;
  calculation: number;
  placeValue: number;
  wordProblem: number;
  level: 'low' | 'medium' | 'high';
}

export interface Certificate {
  id?: string;
  studentId: string;
  studentName: string;
  date: string;
  awardType: string;
  teacherSignature?: string;
  templateId: string;
}

export interface SeatingChart {
  id?: string;
  name: string;
  rows: number;
  cols: number;
  layoutType?: 'traditional' | 'groups' | 'exam';
  studentPositions: Record<string, string>; // "row-col" -> studentId
  updatedAt: string;
}

export interface TeachingStrategy {
  id: string;
  name: string;
  purpose: string;
  description: string;
  steps: string[];
  materials: string[];
  category: 'active' | 'management' | 'reading' | 'math' | 'engagement' | 'phase' | 'assessment';
  subject?: string[];
  icon: string;
  videoUrl?: string;
  pdfUrl?: string;
}

export interface StrategyImplementation {
  id?: string;
  strategyId: string;
  strategyName: string;
  date: string;
  effectiveness: number;
  reflection: string;
  engagementLevel: 'low' | 'medium' | 'high';
  grade?: Grade;
  subject?: string;
}

export interface ClassInfo {
  schoolName: string;
  grade: string;
  academicYear: string;
  teacherName: string;
}


