import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  Book, 
  Video, 
  FileText, 
  Link as LinkIcon, 
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Award,
  Globe,
  Download,
  Calendar,
  Layers
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { ProfessionalDev } from '../types';

interface TeacherDevViewProps {
  onBack: () => void;
}

export default function TeacherDevView({ onBack }: TeacherDevViewProps) {
  const [resources, setResources] = useState<ProfessionalDev[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProfessionalDev['category'] | 'all'>('all');

  const [newResource, setNewResource] = useState({
    title: '',
    category: 'teaching_method' as ProfessionalDev['category'],
    type: 'pdf' as 'pdf' | 'video' | 'link' | 'text',
    content: '',
    tags: [] as string[]
  });

  useEffect(() => {
    const q = query(collection(db, 'professionalDev'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setResources(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProfessionalDev[]);
    });
    return () => unsubscribe();
  }, []);

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.content) return;
    try {
      await addDoc(collection(db, 'professionalDev'), {
        ...newResource,
        author: 'គ្រូបង្រៀន', // Should ideally be from auth
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      setNewResource({
        title: '',
        category: 'teaching_method',
        type: 'pdf',
        content: '',
        tags: []
      });
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('តើអ្នកចង់លុបធនធាននេះមែនទេ?')) {
      await deleteDoc(doc(db, 'professionalDev', id));
    }
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = activeCategory === 'all' || res.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="ស្វែងរកធនធានមេរៀន..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none w-full sm:w-64"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 font-bold khmer-font"
          >
            <Plus className="w-5 h-5" />
            បន្ថែមឯកសារ
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font">បណ្ណាល័យអភិវឌ្ឍន៍វិជ្ជាជីវៈគ្រូបង្រៀន</h2>
        <p className="text-slate-500 font-medium khmer-font">ប្រព័ន្ធផ្ទុកនូវវិធីសាស្ត្របង្រៀន ឯកសារយោង និងការចែករំលែកចំណេះដឹង</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'all', label: 'ទាំងអស់', icon: <Layers className="w-4 h-4" /> },
          { id: 'teaching_method', label: 'វិធីសាស្ត្របង្រៀន', icon: <Book className="w-4 h-4" /> },
          { id: 'research', label: 'ការស្រាវជ្រាវ', icon: <Globe className="w-4 h-4" /> },
          { id: 'experience', label: 'បទពិសោធន៍', icon: <Award className="w-4 h-4" /> },
          { id: 'policy', label: 'លិខិតបទដ្ឋាន', icon: <FileText className="w-4 h-4" /> },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeCategory === cat.id 
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-indigo-50 border border-slate-200'
            }`}
          >
            {cat.icon}
            <span className="khmer-font">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => (
          <motion.div 
            key={res.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-3xl p-6 shadow-xl border border-slate-100 hover:border-indigo-100 transition-all flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-2xl ${
                res.type === 'video' ? 'bg-rose-50 text-rose-500' :
                res.type === 'pdf' ? 'bg-emerald-50 text-emerald-500' :
                res.type === 'link' ? 'bg-sky-50 text-sky-500' : 'bg-slate-50 text-slate-500'
              }`}>
                {res.type === 'video' ? <Video className="w-6 h-6" /> :
                 res.type === 'pdf' ? <FileText className="w-6 h-6" /> :
                 res.type === 'link' ? <LinkIcon className="w-6 h-6" /> : <Book className="w-6 h-6" />}
              </div>
              <button 
                onClick={() => handleDelete(res.id!)}
                className="p-2 text-slate-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <h4 className="text-lg font-black text-slate-800 khmer-font mb-2 leading-tight group-hover:text-indigo-600 transition-colors">
              {res.title}
            </h4>
            
            <p className="text-slate-500 text-sm khmer-font mb-6 line-clamp-3">
              {res.content}
            </p>

            <div className="mt-auto space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {res.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full khmer-font italic">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 khmer-font">
                  <Calendar className="w-3 h-3" />
                  {res.createdAt ? new Date(res.createdAt).toLocaleDateString('km-KH') : ''}
                </div>
                <a 
                  href={res.content.startsWith('http') ? res.content : '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline khmer-font"
                >
                  ចូលមើល
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-xl w-full shadow-2xl relative"
          >
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full">
              <Plus className="w-6 h-6 rotate-45 text-slate-400" />
            </button>
            <h3 className="text-2xl font-black text-slate-800 khmer-font mb-6">បន្ថែមធនធានមេរៀន</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ចំណងជើង</label>
                <input 
                  type="text" 
                  value={newResource.title}
                  onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  placeholder="ស្វែងយល់អំពី..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ប្រភេទធនធាន</label>
                  <select 
                    value={newResource.category}
                    onChange={(e) => setNewResource({...newResource, category: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  >
                    <option value="teaching_method">វិធីសាស្ត្របង្រៀន</option>
                    <option value="research">ការស្រាវជ្រាវ</option>
                    <option value="experience">បទពិសោធន៍</option>
                    <option value="policy">លិខិតបទដ្ឋាន</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ប្រភេទឯកសារ</label>
                  <select 
                    value={newResource.type}
                    onChange={(e) => setNewResource({...newResource, type: e.target.value as any})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  >
                    <option value="pdf">ឯកសារ (PDF/Doc)</option>
                    <option value="video">វីដេអូ</option>
                    <option value="link">តំណភ្ជាប់ (Link)</option>
                    <option value="text">អត្ថបទ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">មាតិកា/តំណភ្ជាប់</label>
                <textarea 
                  value={newResource.content}
                  onChange={(e) => setNewResource({...newResource, content: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  placeholder="ពិពណ៌នាអំពីឯកសារ ឬដាក់តំណភ្ជាប់ទីនេះ..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 khmer-font">ស្លាក (បំបែកដោយក្បៀស)</label>
                <input 
                  type="text" 
                  value={newResource.tags.join(', ')}
                  onChange={(e) => setNewResource({...newResource, tags: e.target.value.split(',').map(t => t.trim())})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none khmer-font"
                  placeholder="វិធីសាស្ត្រ, ចំណេះដឹង, ..."
                />
              </div>

              <button 
                onClick={handleAddResource}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font text-lg hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
              >
                <Save className="w-5 h-5" />
                រក្សាទុកធនធាន
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function Save({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  );
}
