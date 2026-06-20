import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  BookOpen, 
  TrendingUp, 
  Search,
  BookMarked,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { DifficultWord, Student } from '../types';

interface DifficultWordsViewProps {
  onBack: () => void;
}

export default function DifficultWordsView({ onBack }: DifficultWordsViewProps) {
  const [words, setWords] = useState<DifficultWord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWord, setNewWord] = useState({
    studentId: '',
    word: '',
    context: ''
  });

  useEffect(() => {
    const unsubWords = onSnapshot(query(collection(db, 'difficult_words'), orderBy('date', 'desc')), snap => {
      setWords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as DifficultWord[]);
    });
    const unsubStudents = onSnapshot(collection(db, 'students'), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    return () => { unsubWords(); unsubStudents(); };
  }, []);

  const handleAddWord = async () => {
    if (!newWord.word || !newWord.studentId) return;
    try {
      await addDoc(collection(db, 'difficult_words'), {
        ...newWord,
        date: new Date().toISOString()
      });
      setNewWord({ studentId: '', word: '', context: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding word:", error);
    }
  };

  const handleDeleteWord = async (id: string) => {
    if (window.confirm('តើអ្នកចង់លុបពាក្យនេះមែនទេ?')) {
      await deleteDoc(doc(db, 'difficult_words', id));
    }
  };

  // Group by word to see frequency
  const wordFrequency = words.reduce((acc, curr) => {
    const word = curr.word.trim();
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedFrequency = Object.entries(wordFrequency)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  const filteredFrequency = sortedFrequency.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentName = (id: string) => students.find(s => s.id === id)?.name || 'មិនស្គាល់';

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

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកពាក្យ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md font-bold khmer-font"
          >
            <Plus className="w-5 h-5" />
            បន្ថែមពាក្យពិបាក
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">បញ្ជីពាក្យពិបាក (Khmer Vocabulary Tracker)</h2>
        <p className="text-slate-500 font-medium khmer-font">តាមដាន និងវិភាគពាក្យដែលសិស្សជួបការលំបាកសម្រាប់ការបង្រៀនពន្យល់បន្ថែម</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Frequency Table */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-2">
               <TrendingUp className="w-6 h-6 text-indigo-500" /> ភាពញឹកញាប់នៃពាក្យពិបាក
             </h3>
             <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-bold">តម្រៀបតាមចំនួនសិស្សលើកឡើង</span>
          </div>
          
          <div className="space-y-4">
            {filteredFrequency.length > 0 ? filteredFrequency.map((item, idx) => (
              <motion.div 
                key={item.word}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${item.count > 3 ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {item.count}
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-800 khmer-font">{item.word}</h4>
                    {item.count > 3 && (
                      <div className="flex items-center gap-1 text-[10px] text-rose-500 font-bold uppercase tracking-wider">
                        <AlertCircle className="w-3 h-3" /> ត្រូវការការពន្យល់លម្អិត
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {/* Context View Scroll or popup could go here */}
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-20 text-slate-400 khmer-font">មិនទាន់មានទិន្នន័យនៅឡើយ</div>
            )}
          </div>
        </div>

        {/* Recent Entries */}
        <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
          <h3 className="text-xl font-black text-slate-800 khmer-font mb-8 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-indigo-500" /> កត់ត្រាថ្មីៗតាមសិស្ស
          </h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {words.length > 0 ? words.map((word) => (
              <div key={word.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-black text-indigo-600 khmer-font">{getStudentName(word.studentId)}</span>
                  <button onClick={() => word.id && handleDeleteWord(word.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-lg font-black text-slate-800 khmer-font mb-2">« {word.word} »</p>
                {word.context && (
                  <div className="flex gap-2 items-start bg-slate-50 p-3 rounded-xl">
                    <MessageCircle className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <p className="text-xs text-slate-500 italic leading-relaxed">{word.context}</p>
                  </div>
                )}
                <div className="mt-2 text-[10px] text-slate-400 font-bold flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {new Date(word.date).toLocaleDateString('km-KH')}
                </div>
              </div>
            )) : (
              <div className="text-center py-20 text-slate-400 khmer-font">មិនទាន់មានការកត់ត្រា</div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl relative"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
              <Plus className="w-8 h-8 rotate-45 text-slate-400" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 khmer-font mb-6">បញ្ចូលពាក្យពិបាកថ្មី</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ជ្រើសរើសសិស្ស</label>
                <select 
                  value={newWord.studentId}
                  onChange={(e) => setNewWord({...newWord, studentId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font font-bold"
                >
                  <option value="">-- រើសសិស្ស --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (ថ្នាក់ទី {s.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ពាក្យដែលពិបាក</label>
                <input 
                  type="text" 
                  value={newWord.word}
                  onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                  placeholder="ឧ. បុព្វវិជ្ជា"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">បរិបទ ឬមូលហេតុ (បើមាន)</label>
                <textarea 
                  value={newWord.context}
                  onChange={(e) => setNewWord({...newWord, context: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                />
              </div>
              <button 
                onClick={handleAddWord}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font text-lg hover:bg-indigo-700 transition-all shadow-lg"
              >
                រក្សាទុកទិន្នន័យ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
