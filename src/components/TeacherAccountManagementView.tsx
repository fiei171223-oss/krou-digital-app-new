import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, UserPlus, KeyRound, Building2, Trash2, CheckCircle2, Copy } from 'lucide-react';

interface TeacherAccount {
  id: string;
  name: string;
  school: string;
  code: string;
  createdAt: string;
}

export default function TeacherAccountManagementView({ onBack }: { onBack: () => void }) {
  const [accounts, setAccounts] = useState<TeacherAccount[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newSchool, setNewSchool] = useState('');
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('teacher_accounts');
    if (data) {
      setAccounts(JSON.parse(data));
    }
  }, []);

  const saveAccounts = (newAccounts: TeacherAccount[]) => {
    setAccounts(newAccounts);
    localStorage.setItem('teacher_accounts', JSON.stringify(newAccounts));
  };

  const generateCode = () => {
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setNewCode(randomCode);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchool || !newName || !newCode) return;
    
    const newAcc: TeacherAccount = {
      id: Date.now().toString(),
      name: newName,
      school: newSchool,
      code: newCode,
      createdAt: new Date().toISOString()
    };
    
    saveAccounts([newAcc, ...accounts]);
    setShowAdd(false);
    setNewName('');
    setNewCode('');
  };

  const handleDelete = (id: string) => {
    if (confirm("តើអ្នកពិតជាចង់លុបគណនីគ្រូនេះមែនទេ?")) {
      saveAccounts(accounts.filter(a => a.id !== id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('បានចម្លងលេខកូដ!');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-bold bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" /> ត្រឡប់ក្រោយ
        </button>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors font-bold px-5 py-2.5 rounded-full shadow-md shadow-indigo-200"
        >
          <UserPlus className="w-5 h-5" /> បង្កើតគណនីគ្រូថ្មី
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-black text-slate-800 font-kantumruy leading-relaxed mb-6 flex items-center gap-3">
          <KeyRound className="w-6 h-6 text-indigo-500" /> គ្រប់គ្រងលេខកូដគ្រូបង្រៀន
        </h2>

        {showAdd && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            onSubmit={handleAdd}
            className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 items-end"
          >
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">ឈ្មោះសាលា</label>
              <input 
                value={newSchool} 
                onChange={e => setNewSchool(e.target.value)} 
                type="text" 
                placeholder="ឧ. សាលាបឋមសិក្សាព្រែកទាល់"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">ឈ្មោះគ្រូ</label>
              <input 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                type="text" 
                placeholder="នាមត្រកូល និងនាមខ្លួន"
                className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white" 
              />
            </div>
            <div>
              <label className="text-sm font-bold text-slate-700 mb-2 block">លេខកូដសម្ងាត់</label>
              <div className="flex gap-2">
                <input 
                  value={newCode} 
                  onChange={e => setNewCode(e.target.value)} 
                  type="text" 
                  placeholder="******"
                  className="w-full rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 bg-white font-bold tracking-widest text-indigo-700" 
                />
                <button type="button" onClick={generateCode} className="btn-secondary rounded-xl px-4 whitespace-nowrap bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200 transition-colors">
                  Generate
                </button>
              </div>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-2">
              <button type="button" onClick={() => setShowAdd(false)} className="px-5 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">បោះបង់</button>
              <button type="submit" className="px-5 py-2 font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center"><CheckCircle2 className="w-5 h-5 mr-2 inline"/> រក្សាទុកគណនី</button>
            </div>
          </motion.form>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-slate-500 text-sm">
                <th className="font-bold py-4 px-4 font-kantumruy">សាលារៀន</th>
                <th className="font-bold py-4 px-4 font-kantumruy">ឈ្មោះគ្រូ</th>
                <th className="font-bold py-4 px-4 font-kantumruy">កូដសម្ងាត់</th>
                <th className="font-bold py-4 px-4 font-kantumruy">កាលបរិច្ឆេទបង្កើត</th>
                <th className="font-bold py-4 px-4 font-kantumruy">កំណត់</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {accounts.length === 0 ? (
                <tr>
                   <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">មិនទាន់មានគណនីគ្រូនៅឡើយទេ, បង្កើតគណនីគ្រូឥឡូវនេះ។</td>
                </tr>
              ) : accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-2 text-slate-700 font-bold">
                      <Building2 className="w-4 h-4 text-slate-400" /> {acc.school}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-800">{acc.name}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-indigo-600 tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">{acc.code}</span>
                      <button onClick={() => copyToClipboard(acc.code)} className="text-slate-400 hover:text-indigo-600" title="ចម្លងលេខកូដ">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-500">
                    {new Date(acc.createdAt).toLocaleDateString('km-KH')}
                  </td>
                  <td className="py-4 px-4">
                    <button onClick={() => handleDelete(acc.id)} className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
