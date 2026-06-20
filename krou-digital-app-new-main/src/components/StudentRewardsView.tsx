import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  Star, 
  Award, 
  Trophy, 
  UserPlus, 
  Search,
  Sparkles,
  Heart,
  BookOpen,
  Users,
  Home,
  Camera,
  Upload,
  Calendar,
  Activity,
  Share2,
  Filter,
  Trash,
  Medal,
  ShieldCheck
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, where } from 'firebase/firestore';
import { Student, Grade, ScoreRecord } from '../types';

interface StudentRewardsViewProps {
  onBack: () => void;
}

const BADGES = [
  { id: 'clean_hero', name: 'វីរបុរសអនាម័យ', icon: <Medal className="w-4 h-4" />, category: 'cleanliness', color: 'bg-emerald-500' },
  { id: 'friend_hero', name: 'វីរបុរសមិត្តភាព', icon: <Heart className="w-4 h-4" />, category: 'friendliness', color: 'bg-rose-500' },
  { id: 'help_hero', name: 'វីរបុរសមានចិត្តមេត្តា', icon: <Sparkles className="w-4 h-4" />, category: 'helpingOthers', color: 'bg-amber-500' },
  { id: 'learn_hero', name: 'វីរបុរសចំណេះដឹង', icon: <BookOpen className="w-4 h-4" />, category: 'learningActivity', color: 'bg-blue-500' },
  { id: 'team_hero', name: 'វីរបុរសការងារក្រុម', icon: <Users className="w-4 h-4" />, category: 'groupWork', color: 'bg-indigo-500' },
  { id: 'home_hero', name: 'វីរបុរសទំនួលខុសត្រូវ', icon: <Home className="w-4 h-4" />, category: 'homework', color: 'bg-purple-500' },
];

export default function StudentRewardsView({ onBack }: StudentRewardsViewProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'leaderboard'>('list');
  const [leaderboardFilter, setLeaderboardFilter] = useState<'weekly' | 'monthly'>('weekly');
  const [newStudent, setNewStudent] = useState({
    name: '',
    grade: 1 as Grade,
    gender: 'male' as 'male' | 'female',
    photoUrl: ''
  });

  const [selectedStudentForHealth, setSelectedStudentForHealth] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'students'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentData);
    });

    const unsubScores = onSnapshot(collection(db, 'scores'), (snapshot) => {
      const scoreData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScoreRecord[];
      setScores(scoreData);
    });

    return () => { unsubscribe(); unsubScores(); };
  }, []);

  const totalPoints = (s: Student) => 
    (s.stars.cleanliness || 0) + (s.stars.friendliness || 0) + (s.stars.helpingOthers || 0) + 
    (s.stars.learningActivity || 0) + (s.stars.groupWork || 0) + (s.stars.homework || 0);

  const getAcademicScore = (studentId: string) => {
    const studentScores = scores.filter(s => s.studentId === studentId);
    if (studentScores.length === 0) return 0;
    // For simplicity, take the latest average
    const latest = studentScores.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
    return latest.average || 0;
  };

  const combinedLeaderboard = useMemo(() => {
    return [...students].map(s => {
      const behavior = totalPoints(s);
      const academic = getAcademicScore(s.id);
      return {
        ...s,
        behaviorPoints: behavior,
        academicPoints: academic,
        totalCombined: (behavior / 3) + academic // Weighted sum out of 20
      };
    }).sort((a, b) => b.totalCombined - a.totalCombined);
  }, [students, scores]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = true, studentId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('ទំហំរូបភាពធំពេក (អតិបរមា 2MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      if (isNew) {
        setNewStudent({ ...newStudent, photoUrl: base64String });
      } else if (studentId) {
        try {
          await updateDoc(doc(db, 'students', studentId), {
            photoUrl: base64String,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error updating photo: ", error);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddStudent = async () => {
    if (!newStudent.name) return;
    try {
      await addDoc(collection(db, 'students'), {
        ...newStudent,
        stars: { 
          cleanliness: 0, 
          friendliness: 0, 
          helpingOthers: 0, 
          learningActivity: 0, 
          groupWork: 0, 
          homework: 0 
        },
        badges: [],
        health: { height: 0, weight: 0, bmi: 0, vaccines: [] },
        updatedAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewStudent({ name: '', grade: 1, gender: 'male', photoUrl: '' });
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const updateStars = async (studentId: string, category: keyof Student['stars'], amount: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const newStars = { ...student.stars, [category]: Math.max(0, (student.stars[category] || 0) + amount) };
    
    const newBadges = [...(student.badges || [])];
    const badge = BADGES.find(b => b.category === category);
    if (badge && newStars[category] >= 5 && !newBadges.includes(badge.id)) {
      newBadges.push(badge.id);
    }

    try {
      await updateDoc(doc(db, 'students', studentId), {
        stars: newStars,
        badges: newBadges,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating stars: ", error);
    }
  };

  const handleUpdateHealth = async (studentId: string, health: Student['health']) => {
    try {
      await updateDoc(doc(db, 'students', studentId), {
        health,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating health: ", error);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សនេះមែនទេ?')) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (error) {
        console.error("Error deleting student: ", error);
      }
    }
  };

  const shareToTelegram = (student: Student) => {
    const points = totalPoints(student);
    const message = `🌟 របាយការណ៍កោតសរសើរសិស្សឆ្នើម 🌟\n\nសិស្សឈ្មោះ៖ ${student.name}\n${student.gender === 'male' ? 'មាន' : 'មាន'}អាកប្បកិរិយាល្អ និងខិតខំរៀនសូត្រក្នុងថ្នាក់។\n🎉 ទទួលបានពិន្ទុសរុប៖ ${points} ផ្កាយ\n🏅 មេដាយទទួលបាន៖ ${student.badges?.length || 0} មេដាយ\n\nសូមមាតាបិតាបន្តជួយលើកទឹកចិត្តកូនបន្ថែមទៀត! 🙏`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 min-h-screen pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-medium border border-slate-200 shadow-sm self-start"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
          ត្រឡប់ក្រោយ
        </button>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 flex gap-1">
            <button 
              onClick={() => setActiveTab('list')}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              បញ្ជីសិស្ស
            </button>
            <button 
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              តារាងកិត្តិយស
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកឈ្មោះសិស្ស..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-bold khmer-font"
          >
            <UserPlus className="w-5 h-5" />
            បន្ថែមសិស្ស
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">
          {activeTab === 'list' ? 'ប្រព័ន្ធផ្កាយលើកទឹកចិត្តសិស្ស' : 'តារាងកិត្តិយសសិស្សឆ្នើម'}
        </h2>
        <p className="text-slate-500 font-medium khmer-font">
          {activeTab === 'list' ? 'លើកទឹកចិត្តសិស្សតាមរយៈការផ្តល់ផ្កាយ និងមេដាយ' : 'ការបង្ហាញចំណាត់ថ្នាក់សិស្សឆ្នើមប្រចាំថ្នាក់'}
        </p>
      </div>

      {activeTab === 'list' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student) => (
              <motion.div
                layout
                key={student.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-[2rem] p-6 shadow-xl border border-slate-100 flex flex-col gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                      {student.photoUrl ? (
                        <img 
                          src={student.photoUrl} 
                          alt={student.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-5 h-5 text-white" />
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, false, student.id)}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 khmer-font">{student.name}</h3>
                      <p className="text-sm text-slate-500 khmer-font">ថ្នាក់ទី {student.grade} • {student.gender === 'male' ? 'ប្រុស' : 'ស្រី'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => shareToTelegram(student)}
                      className="p-2.5 bg-sky-50 text-sky-600 rounded-xl hover:bg-sky-100 transition-colors"
                      title="ផ្ញើរបាយការណ៍ទៅ Telegram"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setSelectedStudentForHealth(student.id)}
                      className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                      title="តាមដានសុខភាព"
                    >
                      <Activity className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student.id)}
                      className="p-2.5 text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <StarCategory 
                      title="សកម្មភាពរៀន (Learning)" 
                      stars={student.stars.learningActivity} 
                      onPlus={() => updateStars(student.id, 'learningActivity', 1)}
                      onMinus={() => updateStars(student.id, 'learningActivity', -1)}
                      color="text-blue-500"
                      bgColor="bg-blue-500"
                      icon={<BookOpen className="w-4 h-4" />}
                    />
                    <StarCategory 
                      title="សកម្មភាពក្រុម (Group Work)" 
                      stars={student.stars.groupWork} 
                      onPlus={() => updateStars(student.id, 'groupWork', 1)}
                      onMinus={() => updateStars(student.id, 'groupWork', -1)}
                      color="text-indigo-500"
                      bgColor="bg-indigo-500"
                      icon={<Users className="w-4 h-4" />}
                    />
                    <StarCategory 
                      title="កិច្ចការផ្ទះ (Homework)" 
                      stars={student.stars.homework} 
                      onPlus={() => updateStars(student.id, 'homework', 1)}
                      onMinus={() => updateStars(student.id, 'homework', -1)}
                      color="text-purple-500"
                      bgColor="bg-purple-500"
                      icon={<Home className="w-4 h-4" />}
                    />
                    <StarCategory 
                      title="ស្អាតស្អំ (Cleanliness)" 
                      stars={student.stars.cleanliness} 
                      onPlus={() => updateStars(student.id, 'cleanliness', 1)}
                      onMinus={() => updateStars(student.id, 'cleanliness', -1)}
                      color="text-emerald-500"
                      bgColor="bg-emerald-500"
                      icon={<Medal className="w-4 h-4" />}
                    />
                    <StarCategory 
                      title="រួសរាយ (Friendliness)" 
                      stars={student.stars.friendliness} 
                      onPlus={() => updateStars(student.id, 'friendliness', 1)}
                      onMinus={() => updateStars(student.id, 'friendliness', -1)}
                      color="text-rose-500"
                      bgColor="bg-rose-500"
                      icon={<Heart className="w-4 h-4" />}
                    />
                    <StarCategory 
                      title="ជួយមិត្តភក្តិ (Helping Others)" 
                      stars={student.stars.helpingOthers} 
                      onPlus={() => updateStars(student.id, 'helpingOthers', 1)}
                      onMinus={() => updateStars(student.id, 'helpingOthers', -1)}
                      color="text-amber-500"
                      bgColor="bg-amber-500"
                      icon={<Sparkles className="w-4 h-4" />}
                    />
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 h-fit">
                    <h4 className="text-sm font-bold text-slate-600 khmer-font flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      មេដាយដែលទទួលបាន ({student.badges?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {student.badges && student.badges.length > 0 ? (
                        student.badges.map(badgeId => {
                          const badge = BADGES.find(b => b.id === badgeId);
                          return (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              key={badgeId} 
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-[10px] sm:text-xs font-bold ${badge?.color || 'bg-indigo-500'}`}
                            >
                              {badge?.icon}
                              {badge?.name}
                            </motion.div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-slate-400 khmer-font italic">មិនទាន់មានមេដាយនៅឡើយ</p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-center gap-4 bg-white p-2 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setLeaderboardFilter('weekly')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${leaderboardFilter === 'weekly' ? 'bg-amber-100 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Calendar className="w-4 h-4" />
              ប្រចាំសប្តាហ៍
            </button>
            <button 
              onClick={() => setLeaderboardFilter('monthly')}
              className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${leaderboardFilter === 'monthly' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" />
              ប្រចាំខែ
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 tracking-wider khmer-font uppercase">ចំណាត់ថ្នាក់</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 tracking-wider khmer-font uppercase">សិស្ស</th>
                  <th className="px-8 py-5 text-center text-xs font-black text-slate-400 tracking-wider khmer-font uppercase">រៀនសូត្រ</th>
                  <th className="px-8 py-5 text-center text-xs font-black text-slate-400 tracking-wider khmer-font uppercase">សីលធម៌</th>
                  <th className="px-8 py-5 text-center text-xs font-black text-slate-400 tracking-wider khmer-font uppercase">ពិន្ទុសរុប</th>
                  <th className="px-8 py-5 text-center text-xs font-black text-slate-400 tracking-wider khmer-font uppercase">មេដាយ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {combinedLeaderboard.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full font-black text-xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {student.photoUrl ? (
                          <img src={student.photoUrl} className="w-12 h-12 rounded-xl object-cover" />
                        ) : (
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${student.gender === 'male' ? 'bg-blue-500' : 'bg-pink-500'}`}>
                            {student.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-base font-bold text-slate-800 khmer-font">{student.name}</p>
                          <p className="text-xs text-slate-400 khmer-font">ថ្នាក់ទី {student.grade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                       <span className="text-sm font-black text-indigo-600">{(student.academicPoints || 0).toFixed(1)}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                       <span className="text-sm font-black text-emerald-600">{(student.behaviorPoints || 0)}</span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-lg font-black gap-2 ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-slate-50 text-slate-600'}`}>
                        <Star className={`w-4 h-4 ${index < 3 ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        {(student.totalCombined || 0).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-lg font-black gap-2">
                        <Trophy className="w-4 h-4" />
                        {student.badges?.length || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedStudentForHealth && (
        <HealthModal 
          student={students.find(s => s.id === selectedStudentForHealth)!} 
          onClose={() => setSelectedStudentForHealth(null)}
          onUpdate={(health) => handleUpdateHealth(selectedStudentForHealth, health)}
        />
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full">
              <Plus className="w-6 h-6 rotate-45 text-slate-400" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 khmer-font mb-6">បន្ថែមសិស្សថ្មី</h3>
            <div className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {newStudent.photoUrl ? (
                    <img src={newStudent.photoUrl} className="w-24 h-24 rounded-3xl object-cover border-4 border-indigo-50 shadow-lg" />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-slate-100 flex items-center justify-center border-4 border-dashed border-slate-200">
                      <Camera className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                    />
                  </label>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 khmer-font">បន្ថែមរូបភាព (បើមាន)</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ឈ្មោះសិស្ស</label>
                <input 
                  type="text" 
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ភេទ</label>
                  <select 
                    value={newStudent.gender}
                    onChange={(e) => setNewStudent({...newStudent, gender: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  >
                    <option value="male">ប្រុស</option>
                    <option value="female">ស្រី</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ថ្នាក់ទី</label>
                  <select 
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({...newStudent, grade: parseInt(e.target.value) as Grade})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  >
                    {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <button 
                onClick={handleAddStudent}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font text-lg hover:bg-indigo-700 transition-all mt-4"
              >
                រក្សាទុក
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StarCategory({ title, stars, onPlus, onMinus, color, bgColor, icon }: { title: string, stars: number, onPlus: () => void, onMinus: () => void, color: string, bgColor: string, icon: React.ReactNode }) {
  const currentStars = stars || 0;
  const progress = (currentStars / 5) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-bold text-slate-600 khmer-font">{title}</label>
        <span className={`text-xs font-black ${color}`}>{currentStars}/5 ផ្កាយ</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-grow h-3 bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progress)}%` }}
            className={`absolute inset-y-0 left-0 ${bgColor} transition-all duration-500`}
          />
          {[1,2,3,4].map(i => (
            <div key={i} className="absolute inset-y-0 border-r border-white/20" style={{ left: `${i*20}%` }} />
          ))}
        </div>
        <div className="flex gap-1">
          <button onClick={onMinus} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all">
            <Plus className="w-4 h-4 rotate-45" />
          </button>
          <button onClick={onPlus} className={`w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:${bgColor} hover:text-white transition-all`}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      {currentStars >= 5 && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400"
        >
          <Award className={`w-3 h-3 ${color}`} />
          បានទទួលមេដាយ
        </motion.div>
      )}
    </div>
  );
}

function HealthModal({ student, onClose, onUpdate }: { student: Student, onClose: () => void, onUpdate: (health: Student['health']) => void }) {
  const [health, setHealth] = useState(student.health || { height: 0, weight: 0, bmi: 0, vaccines: [] });

  const calculateBMI = (h: number, w: number) => {
    if (!h || !w) return 0;
    const heightInMeters = h / 100;
    return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(1));
  };

  const handleUpdate = () => {
    const bmi = calculateBMI(health.height || 0, health.weight || 0);
    onUpdate({ ...health, bmi });
    onClose();
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi === 0) return { label: 'មិនទាន់មានទិន្នន័យ', color: 'text-slate-400', bg: 'bg-slate-50' };
    if (bmi < 15) return { label: 'ទម្ងន់ទាបខ្លាំង', color: 'text-rose-600', bg: 'bg-rose-50' };
    if (bmi < 18.5) return { label: 'ទម្ងន់ទាប', color: 'text-amber-600', bg: 'bg-amber-50' };
    if (bmi < 25) return { label: 'ធម្មតា', color: 'text-emerald-600', bg: 'bg-emerald-50' };
    return { label: 'លើសទម្ងន់', color: 'text-rose-600', bg: 'bg-rose-50' };
  };

  const bmiStatus = getBMIStatus(health.bmi || 0);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
          <Plus className="w-6 h-6 rotate-45 text-slate-400" />
        </button>
        <h3 className="text-2xl font-black text-slate-800 khmer-font mb-6 flex items-center gap-3">
          <Activity className="w-8 h-8 text-emerald-500" />
          តាមដានសុខភាព៖ {student.name}
        </h3>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">កម្ពស់ (cm)</label>
              <input 
                type="number" 
                value={health.height || ''}
                onChange={(e) => setHealth({ ...health, height: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none khmer-font"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ទម្ងន់ (kg)</label>
              <input 
                type="number" 
                value={health.weight || ''}
                onChange={(e) => setHealth({ ...health, weight: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none khmer-font"
              />
            </div>
          </div>

          <div className={`p-4 rounded-2xl ${bmiStatus.bg} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-bold text-slate-500 khmer-font">សន្ទស្សន៍ម៉ាសរាងកាយ (BMI)</p>
              <p className={`text-2xl font-black ${bmiStatus.color}`}>{health.bmi || 0}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full bg-white font-bold khmer-font shadow-sm ${bmiStatus.color}`}>
              {bmiStatus.label}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-600 khmer-font flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ស្ថានភាពវ៉ាក់សាំង
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {health.vaccines?.map((v, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="font-bold text-slate-700 khmer-font text-sm">{v.name}</div>
                  <div className="text-xs text-slate-400 khmer-font">{v.date}</div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold hover:bg-slate-50 transition-colors khmer-font mt-2">
                + បន្ថែមវ៉ាក់សាំង
              </button>
            </div>
          </div>

          <button 
            onClick={handleUpdate}
            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black khmer-font text-lg hover:bg-emerald-700 transition-all mt-4"
          >
            រក្សាទុកទិន្នន័យ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
