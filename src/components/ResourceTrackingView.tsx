import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Package, 
  BookOpen, 
  Plus, 
  Search, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Save, 
  RotateCcw,
  Book,
  Wrench,
  Boxes
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { InventoryItem, BookLending, Student } from '../types';

interface ResourceTrackingViewProps {
  onBack: () => void;
}

export default function ResourceTrackingView({ onBack }: ResourceTrackingViewProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'lending' | 'extra'>('inventory');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [lending, setLending] = useState<BookLending[]>([]);
  const [extraClasses, setExtraClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddLending, setShowAddLending] = useState(false);
  const [showAddExtra, setShowAddExtra] = useState(false);

  useEffect(() => {
    const unsubInv = onSnapshot(query(collection(db, 'inventory'), orderBy('name', 'asc')), snap => {
      setInventory(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as InventoryItem[]);
    });
    const unsubLending = onSnapshot(query(collection(db, 'book_lending'), orderBy('dateOut', 'desc')), snap => {
      setLending(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BookLending[]);
    });
    const unsubStudents = onSnapshot(query(collection(db, 'students'), orderBy('name', 'asc')), snap => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
    });
    const unsubExtra = onSnapshot(query(collection(db, 'extra_classes'), orderBy('date', 'desc')), snap => {
      setExtraClasses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubInv(); unsubLending(); unsubStudents(); unsubExtra(); };
  }, []);

  const handleAddInventory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      total: Number(formData.get('total')),
      available: Number(formData.get('total')),
      category: formData.get('category'),
    };
    await addDoc(collection(db, 'inventory'), data);
    setShowAddInventory(false);
  };

  const handleReturnResource = async (id: string, invId?: string) => {
    if (!confirm('បញ្ជាក់ការសងសម្ភារៈវិញ?')) return;
    await updateDoc(doc(db, 'book_lending', id), {
      status: 'returned',
      dateIn: new Date().toISOString()
    });
  };

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

        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            បញ្ជីសារពើភ័ណ្ឌ
          </button>
          <button 
            onClick={() => setActiveTab('lending')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'lending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            ខ្ចី/សងសម្ភារៈ
          </button>
          <button 
            onClick={() => setActiveTab('extra')}
            className={`px-6 py-2 rounded-xl font-black khmer-font text-sm transition-all ${activeTab === 'extra' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-indigo-600'}`}
          >
            បង្រៀនបន្ថែម
          </button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 khmer-font uppercase tracking-tight">គ្រប់គ្រងធនធាន និងសម្ភារៈក្នុងថ្នាក់</h2>
        <p className="text-slate-500 font-medium khmer-font">តាមដានសៀវភៅសិក្សាគោល និងសម្ភារៈឧបទេសផ្សេងៗ</p>
      </div>

      {activeTab === 'inventory' ? (
        <div className="space-y-8">
           <div className="flex justify-end">
              <button 
                onClick={() => setShowAddInventory(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
              >
                 <Plus className="w-5 h-5" /> បន្ថែមសម្ភារៈថ្មី
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {inventory.map(item => (
                <div key={item.id} className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-100 space-y-6 relative overflow-hidden group">
                   <div className="flex items-center gap-4">
                      <div className={`p-4 rounded-2xl ${item.category === 'textbook' ? 'bg-blue-50 text-blue-600' : item.category === 'equipment' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                         {item.category === 'textbook' ? <Book className="w-8 h-8" /> : item.category === 'equipment' ? <Wrench className="w-8 h-8" /> : <Boxes className="w-8 h-8" />}
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-slate-800 khmer-font">{item.name}</h4>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ចំនួនសរុប</p>
                         <p className="text-2xl font-black text-slate-800">{item.total}</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                         <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">នៅសល់</p>
                         <p className="text-2xl font-black text-emerald-700">{item.available}</p>
                      </div>
                   </div>

                   <button 
                     onClick={async () => { if(confirm('តើអ្នកចង់លុបទិន្នន័យនេះ?')) await deleteDoc(doc(db, 'inventory', item.id!)) }}
                     className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                   >
                      <Trash2 className="w-5 h-5" />
                   </button>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-end">
              <button 
                onClick={() => setShowAddLending(true)}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold khmer-font flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg"
              >
                 <BookOpen className="w-5 h-5" /> កត់ត្រាការខ្ចីថ្មី
              </button>
           </div>

           <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
              <div className="p-8 bg-slate-50 border-b border-slate-100">
                 <h3 className="text-xl font-black text-slate-800 khmer-font flex items-center gap-3">
                    <Clock className="w-6 h-6 text-indigo-600" /> ប្រវត្តិការខ្ចីសងសម្ភារៈ
                 </h3>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full">
                    <thead className="bg-slate-50/50">
                       <tr className="text-left border-b border-slate-100">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ឈ្មោះសិស្ស</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">សម្ភារៈ/សៀវភៅ</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ថ្ងៃខ្ចី</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">ស្ថានភាព</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">សកម្មភាព</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                       {lending.map(rec => (
                         <tr key={rec.id} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-8 py-4">
                               <div className="flex items-center gap-3">
                                  <User className="w-4 h-4 text-slate-300" />
                                  <span className="font-black text-slate-700 khmer-font">{rec.studentName}</span>
                               </div>
                            </td>
                            <td className="px-8 py-4 font-bold text-slate-600 khmer-font">{rec.bookTitle}</td>
                            <td className="px-8 py-4 text-xs font-bold text-slate-400 uppercase">{new Date(rec.dateOut).toLocaleDateString('km-KH')}</td>
                            <td className="px-8 py-4 text-center">
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black khmer-font ${rec.status === 'borrowed' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {rec.status === 'borrowed' ? 'កំពុងខ្ចី' : 'បានសងវិញ'}
                               </span>
                            </td>
                            <td className="px-8 py-4 text-right">
                               {rec.status === 'borrowed' && (
                                 <button 
                                   onClick={() => handleReturnResource(rec.id!)}
                                   className="text-indigo-600 hover:bg-indigo-50 px-4 py-1.5 rounded-lg font-black khmer-font text-xs transition-all"
                                 >
                                    សងវិញ
                                 </button>
                               )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {/* Add Modals */}
      {showAddInventory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10">
              <form onSubmit={handleAddInventory} className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800 khmer-font">បន្ថែមឈ្មោះសម្ភារៈ</h3>
                    <button type="button" onClick={() => setShowAddInventory(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Plus className="w-8 h-8 rotate-45 text-slate-400" /></button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest khmer-font">ឈ្មោះសម្ភារៈ</label>
                       <input name="name" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold khmer-font" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest khmer-font">ប្រភេទ</label>
                          <select name="category" className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold khmer-font">
                             <option value="textbook">សៀវភៅសិក្សាគោល</option>
                             <option value="equipment">ឧបករណ៍បង្រៀន</option>
                             <option value="stationary">សម្ភារៈបន្ទប់រៀន</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest khmer-font">ចំនួនសរុប</label>
                          <input name="total" type="number" required defaultValue="1" className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold" />
                       </div>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> រក្សាទុកក្នុងបញ្ជីសារពើភ័ណ្ឌ
                 </button>
              </form>
           </motion.div>
        </div>
      )}

      {showAddLending && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10">
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const sId = formData.get('studentId') as string;
                const student = students.find(s => s.id === sId);
                const data = {
                   studentId: sId,
                   studentName: student?.name || 'Unknown',
                   bookTitle: formData.get('bookTitle'),
                   dateOut: new Date().toISOString(),
                   status: 'borrowed'
                };
                await addDoc(collection(db, 'book_lending'), data);
                setShowAddLending(false);
              }} className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-800 khmer-font">កត់ត្រាការខ្ចីថ្មី</h3>
                    <button type="button" onClick={() => setShowAddLending(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><Plus className="w-8 h-8 rotate-45 text-slate-400" /></button>
                 </div>
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest khmer-font">ជ្រើសរើសសិស្ស</label>
                       <select name="studentId" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold khmer-font">
                          <option value="">-- រើសសិស្ស --</option>
                          {students.map(s => <option key={s.id} value={s.id}>{s.name} (ថ្នាក់ទី {s.grade})</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="block text-xs font-black text-slate-400 uppercase tracking-widest khmer-font">ឈ្មោះសៀវភៅ/សម្ភារៈ</label>
                       <input name="bookTitle" required className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border border-slate-100 font-bold khmer-font" />
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black khmer-font shadow-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" /> កត់ត្រាការខ្ចី
                 </button>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
