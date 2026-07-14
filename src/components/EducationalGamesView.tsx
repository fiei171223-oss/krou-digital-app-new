import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Gamepad2, 
  Sparkles, 
  Trophy, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Award, 
  Volume2, 
  Plus, 
  Trash2, 
  HelpCircle, 
  Play,
  Users,
  Timer
} from 'lucide-react';

interface GameItem {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category: string;
}

const defaultGames: GameItem[] = [
  {
    id: '1',
    question: 'តើពាក្យ "សាលារៀន" មានប៉ុន្មានព្យាង្គ?',
    options: ['២ ព្យាង្គ', '៣ ព្យាង្គ', '៤ ព្យាង្គ', '១ ព្យាង្គ'],
    correctAnswer: 1,
    explanation: 'សា-លា-រៀន មាន ៣ ព្យាង្គ។',
    category: 'ភាសាខ្មែរ'
  },
  {
    id: '2',
    question: 'តើ ១៥ + ២៨ ស្មើនឹងប៉ុន្មាន?',
    options: ['៣៥', '៤៣', '៤២', '៤៥'],
    correctAnswer: 1,
    explanation: '១៥ + ២៨ = ៤៣',
    category: 'គណិតវិទ្យា'
  },
  {
    id: '3',
    question: 'តើរាជធានីនៃព្រះរាជាណាចក្រកម្ពុជាមានឈ្មោះអ្វី?',
    options: ['ខេត្តសៀមរាប', 'ខេត្តបាត់ដំបង', 'រាជធានីភ្នំពេញ', 'ខេត្តកំពង់ចាម'],
    correctAnswer: 2,
    explanation: 'រាជធានីភ្នំពេញ ជារាជធានីនៃប្រទេសកម្ពុជា។',
    category: 'សិក្សាសង្គម'
  },
  {
    id: '4',
    question: 'តើរូបមន្តក្រឡាផ្ទៃចតុកោណកែងស្មើនឹងអ្វី?',
    options: ['បណ្តោយ + ទទឹង', 'បណ្តោយ × ទទឹង', '(បណ្តោយ + ទទឹង) × ២', 'បណ្តោយ × បណ្តោយ'],
    correctAnswer: 1,
    explanation: 'ក្រឡាផ្ទៃចតុកោណកែង = បណ្តោយ × ទទឹង',
    category: 'គណិតវិទ្យា'
  },
  {
    id: '5',
    question: 'តើព្យញ្ជនៈខ្មែរមានប៉ុន្មានតួ?',
    options: ['២៧ តួ', '៣០ តួ', '៣៣ តួ', '២៤ តួ'],
    correctAnswer: 2,
    explanation: 'ព្យញ្ជនៈខ្មែរមាន ៣៣ តួ (ក ដល់ អ)។',
    category: 'ភាសាខ្មែរ'
  }
];

export default function EducationalGamesView({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<'quiz' | 'teams' | 'custom'>('quiz');
  const [games, setGames] = useState<GameItem[]>(defaultGames);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);

  // Team Scoreboard state for live classroom competition
  const [teamA, setTeamA] = useState(0);
  const [teamB, setTeamB] = useState(0);
  const [teamC, setTeamC] = useState(0);

  // New Custom Question Form
  const [newQuestion, setNewQuestion] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [newOpt3, setNewOpt3] = useState('');
  const [newOpt4, setNewOpt4] = useState('');
  const [correctIdx, setCorrectIdx] = useState(0);
  const [category, setCategory] = useState('ភាសាខ្មែរ');

  const currentGame = games[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    setShowResult(true);
    if (idx === currentGame.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < games.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setGameFinished(true);
    }
  };

  const handleRestartGame = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setGameFinished(false);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion || !newOpt1 || !newOpt2) return;
    const added: GameItem = {
      id: Date.now().toString(),
      question: newQuestion,
      options: [newOpt1, newOpt2, newOpt3 || 'ជម្រើសគ', newOpt4 || 'ជម្រើសឃ'],
      correctAnswer: correctIdx,
      category
    };
    setGames([...games, added]);
    setNewQuestion('');
    setNewOpt1('');
    setNewOpt2('');
    setNewOpt3('');
    setNewOpt4('');
    setActiveTab('quiz');
    handleRestartGame();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-[2rem] p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
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
                ផ្នែកផែនការ និងការបង្រៀន
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-moul mt-2 tracking-wide flex items-center gap-3">
              <Gamepad2 className="w-8 h-8" /> ល្បែងសិក្សា និងសំណួរចម្លើយ
            </h1>
            <p className="text-orange-100 text-sm mt-1 font-kantumruy">
              បង្កើតបរិយាកាសរីករាយ និងជំរុញការចូលរួមរបស់សិស្សក្នុងថ្នាក់រៀន
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-black/20 p-1.5 rounded-2xl backdrop-blur-md z-10 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'quiz' ? 'bg-white text-orange-600 shadow-lg' : 'text-white/80 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" /> លេងសំណួរចម្លើយ
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'teams' ? 'bg-white text-orange-600 shadow-lg' : 'text-white/80 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> ពិន្ទុក្រុម
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'custom' ? 'bg-white text-orange-600 shadow-lg' : 'text-white/80 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" /> បង្កើតសំណួរ
          </button>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {!gameFinished ? (
              <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-100 relative overflow-hidden">
                {/* Progress bar */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-xl bg-orange-100 text-orange-700 font-bold text-sm">
                      {currentGame?.category}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">
                      សំណួរទី {currentIndex + 1} / {games.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-xl">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span className="font-black text-amber-700 text-base">{score} ពិន្ទុ</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-2 rounded-full mb-8 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-full transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / games.length) * 100}%` }}
                  />
                </div>

                {/* Question Title */}
                <div className="text-center py-8 px-4 bg-orange-50/50 rounded-3xl border border-orange-100/60 mb-8">
                  <h2 className="text-xl md:text-3xl font-black font-kantumruy text-slate-800 leading-relaxed">
                    {currentGame?.question}
                  </h2>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentGame?.options.map((option, idx) => {
                    let btnStyle = "bg-slate-50 border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300";
                    if (selectedOption !== null) {
                      if (idx === currentGame.correctAnswer) {
                        btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20";
                      } else if (idx === selectedOption) {
                        btnStyle = "bg-rose-500 border-rose-600 text-white";
                      } else {
                        btnStyle = "bg-slate-100 border-slate-200 text-slate-400 opacity-60";
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        whileHover={selectedOption === null ? { scale: 1.02 } : {}}
                        whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                        onClick={() => handleSelectOption(idx)}
                        className={`p-6 rounded-2xl border-2 font-bold text-lg text-left transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <div className="flex items-center gap-4">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                            selectedOption !== null && idx === currentGame.correctAnswer ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                          }`}>
                            {['ក', 'ខ', 'គ', 'ឃ'][idx]}
                          </span>
                          <span>{option}</span>
                        </div>
                        {selectedOption !== null && idx === currentGame.correctAnswer && (
                          <CheckCircle2 className="w-6 h-6 text-white shrink-0" />
                        )}
                        {selectedOption === idx && idx !== currentGame.correctAnswer && (
                          <XCircle className="w-6 h-6 text-white shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation / Next Button */}
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-500 block mb-1">ពន្យល់ចម្លើយ៖</span>
                      <p className="font-bold text-slate-800">{currentGame?.explanation || 'ចម្លើយត្រឹមត្រូវ!'}</p>
                    </div>
                    <button
                      onClick={handleNextQuestion}
                      className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all active:scale-95 whitespace-nowrap w-full md:w-auto text-center"
                    >
                      {currentIndex < games.length - 1 ? 'សំណួរបន្ទាប់' : 'មើលលទ្ធផលសរុប'}
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-10 text-center shadow-xl border border-slate-100 max-w-2xl mx-auto space-y-6">
                <div className="w-24 h-24 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Award className="w-14 h-14" />
                </div>
                <h2 className="text-3xl font-black font-moul text-slate-800">អបអរសាទរ! បញ្ចប់ការលេង</h2>
                <p className="text-slate-500 text-lg font-kantumruy">
                  អ្នកទទួលបានពិន្ទុ <span className="font-black text-orange-600 text-2xl">{score}</span> លើ <span className="font-bold text-slate-800">{games.length}</span> សំណួរ
                </p>
                <div className="pt-4 flex justify-center gap-4">
                  <button
                    onClick={handleRestartGame}
                    className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" /> លេងម្តងទៀត
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'teams' && (
          <motion.div
            key="teams"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-100"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black font-kantumruy text-slate-800">ក្ដារពិន្ទុប្រកួតប្រជែងជាក្រុមក្នុងថ្នាក់</h2>
              <p className="text-slate-500 text-sm mt-1">ចែកសិស្សជាក្រុម ដើម្បីប្រកួតប្រជែងឆ្លើយសំណួរក្នុងមេរៀន</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Team A */}
              <div className="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-rose-500 text-white rounded-2xl font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-rose-500/30">
                  ក
                </div>
                <h3 className="font-black text-xl text-rose-800 font-kantumruy">ក្រុមទី ១ (រំដួល)</h3>
                <div className="text-5xl font-black text-rose-600 py-4 font-mono">{teamA}</div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setTeamA(Math.max(0, teamA - 10))}
                    className="px-4 py-2 bg-white border border-rose-200 rounded-xl font-bold text-rose-600 hover:bg-rose-100"
                  >
                    -១០
                  </button>
                  <button
                    onClick={() => setTeamA(teamA + 10)}
                    className="px-6 py-2 bg-rose-500 text-white rounded-xl font-bold shadow-md hover:bg-rose-600"
                  >
                    +១០
                  </button>
                </div>
              </div>

              {/* Team B */}
              <div className="bg-indigo-50/70 border-2 border-indigo-200 rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-indigo-500 text-white rounded-2xl font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
                  ខ
                </div>
                <h3 className="font-black text-xl text-indigo-800 font-kantumruy">ក្រុមទី ២ (ចំប៉ី)</h3>
                <div className="text-5xl font-black text-indigo-600 py-4 font-mono">{teamB}</div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setTeamB(Math.max(0, teamB - 10))}
                    className="px-4 py-2 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-600 hover:bg-indigo-100"
                  >
                    -១០
                  </button>
                  <button
                    onClick={() => setTeamB(teamB + 10)}
                    className="px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold shadow-md hover:bg-indigo-600"
                  >
                    +១០
                  </button>
                </div>
              </div>

              {/* Team C */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 rounded-3xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl font-black text-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                  គ
                </div>
                <h3 className="font-black text-xl text-emerald-800 font-kantumruy">ក្រុមទី ៣ (ម្លិះ)</h3>
                <div className="text-5xl font-black text-emerald-600 py-4 font-mono">{teamC}</div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setTeamC(Math.max(0, teamC - 10))}
                    className="px-4 py-2 bg-white border border-emerald-200 rounded-xl font-bold text-emerald-600 hover:bg-emerald-100"
                  >
                    -១០
                  </button>
                  <button
                    onClick={() => setTeamC(teamC + 10)}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold shadow-md hover:bg-emerald-600"
                  >
                    +១០
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => { setTeamA(0); setTeamB(0); setTeamC(0); }}
                className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
              >
                កំណត់ពិន្ទុឡើងវិញ (Reset All)
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'custom' && (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-100 max-w-3xl mx-auto"
          >
            <h2 className="text-2xl font-black font-kantumruy text-slate-800 mb-6">បង្កើតសំណួរល្បែងថ្មី</h2>
            <form onSubmit={handleAddQuestion} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ប្រធានបទ / មុខវិជ្ជា</label>
                <input
                  type="text"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">សំណួរ</label>
                <textarea
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="បញ្ចូលសំណួរនៅទីនេះ..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-orange-500 h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ជម្រើស ក (០)</label>
                  <input
                    type="text"
                    value={newOpt1}
                    onChange={e => setNewOpt1(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ជម្រើស ខ (១)</label>
                  <input
                    type="text"
                    value={newOpt2}
                    onChange={e => setNewOpt2(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ជម្រើស គ (២)</label>
                  <input
                    type="text"
                    value={newOpt3}
                    onChange={e => setNewOpt3(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ជម្រើស ឃ (៣)</label>
                  <input
                    type="text"
                    value={newOpt4}
                    onChange={e => setNewOpt4(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">ចម្លើយដែលត្រឹមត្រូវ</label>
                <select
                  value={correctIdx}
                  onChange={e => setCorrectIdx(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-orange-500"
                >
                  <option value={0}>ជម្រើស ក</option>
                  <option value={1}>ជម្រើស ខ</option>
                  <option value={2}>ជម្រើស គ</option>
                  <option value={3}>ជម្រើស ឃ</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-5 h-5" /> បន្ថែមសំណួរចូលក្នុងល្បែង
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
