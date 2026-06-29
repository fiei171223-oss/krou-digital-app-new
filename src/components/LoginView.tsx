import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, QrCode, ShieldCheck, User, Building2, UserCircle, KeyRound, LogIn, CalendarDays, Wallet, CheckCircle2, MapPin } from 'lucide-react';

import { QRCodeSVG } from 'qrcode.react';

// Pricing Plans
const PLANS = [
  { id: 1, months: 1, price: 2, label: '១ ខែ' },
  { id: 6, months: 6, price: 10, label: '៦ ខែ' },
  { id: 12, months: 12, price: 20, label: '១២ ខែ' }
];

export default function LoginView({ onLogin }: { onLogin: () => void }) {
  const [activeTab, setActiveTab] = useState<'admin' | 'teacher'>('teacher');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  
  // Admin details
  const adminName = "ណុះ សើហ្វីអ៊ី";
  const ADMIN_PIN = "168168"; // The special PIN code

  // Teacher details
  const [provinceName, setProvinceName] = useState('');
  const [schoolName, setSchoolName] = useState('សាលាបឋមសិក្សាព្រែកទាល់');
  const [teacherName, setTeacherName] = useState('');
  const [teacherCode, setTeacherCode] = useState('');

  // Admin Avatar
  const [adminAvatar, setAdminAvatar] = useState<string | null>(() => localStorage.getItem('admin_avatar'));

  // Teacher Avatar
  const [teacherAvatar, setTeacherAvatar] = useState<string | null>(() => localStorage.getItem('teacher_avatar'));

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAdminAvatar(result);
        localStorage.setItem('admin_avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTeacherAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setTeacherAvatar(result);
        localStorage.setItem('teacher_avatar', result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Subscription state
  const [showSubscription, setShowSubscription] = useState(false);
  const [trialStatus, setTrialStatus] = useState({ isExpired: false, daysLeft: 30 });
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Basic auto-login logic if already authenticated
    const authStatus = localStorage.getItem('app_auth_status');
    if (authStatus === 'true') {
      onLogin();
    }
  }, [onLogin]);

  // Handle Admin PIN pad clicks
  const handleAdminPinClick = (digit: string) => {
    if (!adminAvatar) {
      setError('សូមដាក់រូបថតមុនពេលបញ្ចូលលេខកូដ!');
      return;
    }
    
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError('');
      
      if (newPin.length === 6) {
        if (newPin === ADMIN_PIN) {
          // Success Admin Login
          localStorage.setItem('app_auth_status', 'true');
          localStorage.setItem('adminName', adminName);
          localStorage.removeItem('teacherName');
          onLogin();
        } else {
          // Error
          setError('លេខកូដមិនត្រឹមត្រូវទេ!');
          setTimeout(() => setPin(''), 800);
        }
      }
    }
  };

  const handleAdminDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  // Handle Teacher Login
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provinceName || !schoolName || !teacherName || !teacherCode || !teacherAvatar) {
      setError('សូមបំពេញព័ត៌មាននិងដាក់រូបថតឲ្យបានគ្រប់គ្រាន់!');
      return;
    }

    // Verify Teacher Credentials or Auto-register
    const storedAccounts = localStorage.getItem('teacher_accounts');
    let accounts: any[] = [];
    if (storedAccounts) {
      try {
        accounts = JSON.parse(storedAccounts);
      } catch (e) {}
    }

    // Find matching teacher
    const existingTeacher = accounts.find((a: any) => 
      a.school.trim() === schoolName.trim() && 
      a.name.trim() === teacherName.trim()
    );

    if (existingTeacher) {
      if (existingTeacher.code !== teacherCode) {
        setError('លេខកូដសម្ងាត់មិនត្រឹមត្រូវទេ!');
        return;
      }
    } else {
      // Auto-register new teacher
      const newTeacher = {
        id: Date.now().toString(),
        name: teacherName.trim(),
        school: schoolName.trim(),
        province: provinceName.trim(),
        code: teacherCode,
        createdAt: new Date().toISOString()
      };
      accounts.push(newTeacher);
      localStorage.setItem('teacher_accounts', JSON.stringify(accounts));
    }
    
    // Check subscription logic
    const isFreeSchool = schoolName.trim() === 'សាលាបឋមសិក្សាព្រែកទាល់';
    
    if (isFreeSchool) {
      // Free unlimited access
      localStorage.setItem('app_auth_status', 'true');
      localStorage.setItem('user_province', provinceName);
      localStorage.setItem('user_school', schoolName);
      localStorage.setItem('user_teacher', teacherName);
      localStorage.removeItem('adminName');
      onLogin();
    } else {
      // Handling trial and subscription for other schools
      const schoolKey = `school_reg_${schoolName}`;
      let regDate = localStorage.getItem(schoolKey);
      
      if (!regDate) {
        const today = new Date().toISOString();
        localStorage.setItem(schoolKey, today);
        regDate = today;
      }
      
      const subKey = `school_sub_${schoolName}`;
      const subDate = localStorage.getItem(subKey);
      
      // Calculate trial
      const startDate = new Date(regDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const hasActiveSub = subDate && new Date(subDate) > now;
      
      // Save teacher details for all these paths
      localStorage.setItem('user_province', provinceName);
      localStorage.setItem('user_school', schoolName);
      localStorage.setItem('user_teacher', teacherName);
      localStorage.removeItem('adminName');
      
      if (hasActiveSub) {
        // Active subscription
        localStorage.setItem('app_auth_status', 'true');
        onLogin();
      } else if (diffDays <= 30) {
        // Trial active
        setTrialStatus({ isExpired: false, daysLeft: 30 - diffDays });
        setShowSubscription(true); // Show trial alert before letting them in
      } else {
        // Trial expired, prompt payment
        setTrialStatus({ isExpired: true, daysLeft: 0 });
        setShowSubscription(true);
      }
    }
  };

  const handleSimulatePayment = () => {
    if (!selectedPlan) return;
    setPaymentSuccess(true);
    
    setTimeout(() => {
      // Add months to subscription
      const plan = PLANS.find(p => p.id === selectedPlan)!;
      const expireDate = new Date();
      expireDate.setMonth(expireDate.getMonth() + plan.months);
      
      localStorage.setItem(`school_sub_${schoolName}`, expireDate.toISOString());
      localStorage.setItem('app_auth_status', 'true');
      onLogin();
    }, 2000);
  };

  const handleContinueTrial = () => {
    localStorage.setItem('app_auth_status', 'true');
    onLogin();
  };

  if (showSubscription) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-khmer selection:bg-indigo-100 selection:text-indigo-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
        >
          {/* Decals */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="relative z-10 text-center">
            {trialStatus.isExpired ? (
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarDays className="w-8 h-8" />
              </div>
            )}
            
            <h2 className="text-2xl font-black font-kantumruy leading-relaxed mb-2">
              {trialStatus.isExpired ? "ជម្រើសបង់ប្រាក់ប្រើប្រាស់" : "អ្នកកំពុងប្រើប្រាស់កញ្ចប់សាកល្បង"}
            </h2>
            <p className="text-slate-500 mt-2 mb-6 font-medium">
              សាលា {schoolName}
              {!trialStatus.isExpired && <span className="block text-green-600 mt-1">នៅសល់ពេលសាកល្បង {trialStatus.daysLeft} ថ្ងៃទៀត</span>}
            </p>

            {/* Plans List */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {PLANS.map((plan) => (
               <button
                 key={plan.id}
                 onClick={() => { setSelectedPlan(plan.id); setShowPaymentQR(false); }}
                 className={`p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-1
                   ${selectedPlan === plan.id 
                     ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' 
                     : 'border-slate-100 bg-white text-slate-600 hover:border-slate-300'}`}
               >
                 <span className="text-sm font-bold">{plan.label}</span>
                 <span className="text-xl font-black">${plan.price}</span>
               </button>
              ))}
            </div>

            {selectedPlan && !showPaymentQR && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setShowPaymentQR(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 mb-4 transition-all"
              >
                <Wallet className="w-5 h-5" />
                ទូទាត់ប្រាក់តាមរយៈម៉ាស៊ីន ATM ឬ ACLEDA QR
              </motion.button>
            )}

            {showPaymentQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-4 flex flex-col items-center"
              >
                {!paymentSuccess ? (
                  <>
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                      alt="ACLEDA QR" 
                      className="w-48 h-48 rounded-xl bg-white p-2 shadow-sm mb-4 border border-blue-100" 
                    />
                    <div className="text-sm text-slate-600 mb-4 bg-blue-50 px-4 py-2 rounded-lg text-center w-full">
                      សូមស្កេន QR កូដ ACLEDA ខាងលើដើម្បិទូទាត់ប្រាក់ <br/>
                      <span className="font-bold text-blue-700 text-lg">${PLANS.find(p=>p.id===selectedPlan)?.price}.00</span>
                    </div>
                    {/* Mock payment button for demo purposes */}
                    <button 
                      onClick={handleSimulatePayment}
                      className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold hover:bg-blue-200 active:scale-95 transition-all"
                    >
                      បន្លំថាបានបង់ប្រាក់ជោគជ័យរួច (Demo)
                    </button>
                  </>
                ) : (
                  <div className="text-green-600 flex flex-col items-center py-6">
                    <CheckCircle2 className="w-16 h-16 mb-4 animate-bounce" />
                    <span className="font-black text-xl font-kantumruy">ការទូទាត់ជោគជ័យ!</span>
                    <span className="text-sm mt-2 font-medium">សូមរង់ចាំបន្តិច...</span>
                  </div>
                )}
              </motion.div>
            )}

            {!trialStatus.isExpired && !showPaymentQR && (
              <button 
                onClick={handleContinueTrial}
                className="mt-2 text-indigo-600 font-bold hover:underline text-sm"
              >
                បន្តប្រើប្រាស់ការសាកល្បងសិន (Continue Trial) →
              </button>
            )}
            
            {trialStatus.isExpired && (
             <button 
                onClick={() => { setShowSubscription(false); setError(''); setPin(''); }}
                className="mt-6 text-slate-400 font-bold hover:underline text-sm"
              >
                ← ត្រឡប់ក្រោយ
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-khmer selection:bg-indigo-100 selection:text-indigo-900">
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden"
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* Tabs */}
        <div className="relative z-10 flex p-1 bg-slate-100 rounded-xl mb-8">
          <button 
            onClick={() => { setActiveTab('teacher'); setError(''); }}
            className={`flex-1 py-2 text-sm font-bold font-kantumruy rounded-lg transition-all ${
              activeTab === 'teacher' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            គណនីគ្រូ
          </button>
          <button 
            onClick={() => { setActiveTab('admin'); setError(''); setPin(''); }}
            className={`flex-1 py-2 text-sm font-bold font-kantumruy rounded-lg transition-all ${
              activeTab === 'admin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ADMIN
          </button>
        </div>

        <div className="relative z-10 flex flex-col items-center w-full">
          {error && (
            <div className="w-full bg-red-50 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-6 text-center border border-red-100">
              {error}
            </div>
          )}

          {activeTab === 'teacher' ? (
            // ==================== TEACHER LOGIN ====================
            <form onSubmit={handleTeacherLogin} className="w-full flex flex-col gap-4">
              <h2 className="text-xl font-black font-kantumruy leading-relaxed text-slate-800 text-center mb-4">ចូលគណនីគ្រូ</h2>

              {/* Teacher Avatar Upload */}
              <div className="relative w-28 h-28 mb-4 mx-auto group">
                {teacherAvatar ? (
                  <>
                    <div className="absolute -inset-3 rounded-full blur-lg opacity-70 bg-yellow-400"></div>
                    <div className="absolute -inset-1.5 rounded-full border-[3px] border-t-transparent border-b-transparent animate-[spin_4s_linear_infinite] z-0 border-yellow-400"></div>
                    <div className="absolute -inset-1.5 rounded-full border-[3px] border-l-transparent border-r-transparent animate-[spin_3s_linear_infinite_reverse] z-0 opacity-50 border-yellow-300"></div>
                    <div className="relative z-10 w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center border-[2px] border-white shadow-2xl overflow-hidden">
                      <img src={teacherAvatar} alt="Teacher" className="w-full h-full object-cover" />
                    </div>
                  </>
                ) : (
                  <div className="w-28 h-28 bg-indigo-50 rounded-full flex flex-col items-center justify-center shadow-inner border-2 border-dashed border-indigo-300 hover:bg-indigo-100 transition-colors cursor-pointer overflow-hidden relative group">
                    <User className="w-8 h-8 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-indigo-600 font-bold whitespace-nowrap">ដាក់រូបថត</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleTeacherAvatarUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 pl-1"><MapPin className="w-3.5 h-3.5"/> ឈ្មោះខេត្ត</label>
                <select 
                  value={provinceName} 
                  onChange={(e) => setProvinceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all text-sm font-bold"
                >
                  <option value="">ជ្រើសរើសខេត្ត...</option>
                  <option value="ភ្នំពេញ">រាជធានីភ្នំពេញ</option>
                  <option value="បន្ទាយមានជ័យ">បន្ទាយមានជ័យ</option>
                  <option value="បាត់ដំបង">បាត់ដំបង</option>
                  <option value="កំពង់ចាម">កំពង់ចាម</option>
                  <option value="កំពង់ឆ្នាំង">កំពង់ឆ្នាំង</option>
                  <option value="កំពង់ស្ពឺ">កំពង់ស្ពឺ</option>
                  <option value="កំពង់ធំ">កំពង់ធំ</option>
                  <option value="កំពត">កំពត</option>
                  <option value="កណ្តាល">កណ្តាល</option>
                  <option value="កែប">កែប</option>
                  <option value="កោះកុង">កោះកុង</option>
                  <option value="ក្រចេះ">ក្រចេះ</option>
                  <option value="មណ្ឌលគិរី">មណ្ឌលគិរី</option>
                  <option value="ឧត្តរមានជ័យ">ឧត្តរមានជ័យ</option>
                  <option value="ប៉ៃលិន">ប៉ៃលិន</option>
                  <option value="ព្រះសីហនុ">ព្រះសីហនុ</option>
                  <option value="ព្រះវិហារ">ព្រះវិហារ</option>
                  <option value="ព្រៃវែង">ព្រៃវែង</option>
                  <option value="ពោធិ៍សាត់">ពោធិ៍សាត់</option>
                  <option value="រតនគិរី">រតនគិរី</option>
                  <option value="សៀមរាប">សៀមរាប</option>
                  <option value="ស្ទឹងត្រែង">ស្ទឹងត្រែង</option>
                  <option value="ស្វាយរៀង">ស្វាយរៀង</option>
                  <option value="តាកែវ">តាកែវ</option>
                  <option value="ត្បូងឃ្មុំ">ត្បូងឃ្មុំ</option>
                  <option value="ផ្សេងៗ">ផ្សេងៗ...</option>
                </select>
                {provinceName === 'ផ្សេងៗ' && (
                  <input 
                    type="text"
                    placeholder="វាយបញ្ចូលឈ្មោះខេត្តរបស់អ្នក"
                    onChange={(e) => setProvinceName(e.target.value)}
                    className="w-full mt-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all text-sm font-bold"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 pl-1"><Building2 className="w-3.5 h-3.5"/> ឈ្មោះសាលា</label>
                <select 
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all text-sm font-bold"
                >
                  <option value="សាលាបឋមសិក្សាព្រែកទាល់">សាលាបឋមសិក្សាព្រែកទាល់</option>
                  <option value="សាលាបឋមសិក្សាមិត្តភាព">សាលាបឋមសិក្សាមិត្តភាព</option>
                  <option value="សាលាផ្សេងៗទៀត...">បញ្ចូលឈ្មោះសាលាផ្សេងៗ...</option>
                </select>
                {schoolName === 'សាលាផ្សេងៗទៀត...' && (
                  <input 
                    type="text"
                    placeholder="វាយបញ្ចូលឈ្មោះសាលារបស់អ្នក"
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full mt-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all text-sm font-bold"
                  />
                )}
                {schoolName === 'សាលាបឋមសិក្សាព្រែកទាល់' && (
                  <p className="text-[11px] text-green-600 font-bold mt-1.5 ml-1">✓ កញ្ចប់គាំទ្រឥតគិតថ្លៃ ១០០% រហូត</p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 pl-1"><User className="w-3.5 h-3.5"/> ឈ្មោះគ្រូ</label>
                <input 
                  type="text" 
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="នាមត្រកូល និងនាមខ្លួន"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center gap-1.5 pl-1"><KeyRound className="w-3.5 h-3.5"/> លេខកូដ</label>
                <input 
                  type="password" 
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  placeholder="******"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 outline-none transition-all text-xl tracking-[0.3em] font-black text-center"
                />
              </div>

              <button 
                type="submit"
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold font-kantumruy flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-indigo-600/20"
              >
                ចូលប្រព័ន្ធ <LogIn className="w-5 h-5"/>
              </button>
            </form>
          ) : (
            // ==================== ADMIN LOGIN ====================
            <div className="flex flex-col items-center w-full">
              <div className="relative w-28 h-28 mb-6 mx-auto group">
                {adminAvatar ? (
                  <>
                    <div className="absolute -inset-3 rounded-full blur-lg opacity-70 bg-amber-500"></div>
                    <div className="absolute -inset-1.5 rounded-full border-[3px] border-t-transparent border-b-transparent animate-[spin_4s_linear_infinite] z-0 border-amber-400"></div>
                    <div className="absolute -inset-1.5 rounded-full border-[3px] border-l-transparent border-r-transparent animate-[spin_3s_linear_infinite_reverse] z-0 opacity-50 border-amber-300"></div>
                    <div className="relative z-10 w-28 h-28 bg-slate-800 rounded-full flex items-center justify-center border-[2px] border-white shadow-2xl overflow-hidden">
                      <img src={adminAvatar} alt="Admin" className="w-full h-full object-cover" />
                    </div>
                  </>
                ) : (
                  <div className="w-28 h-28 bg-violet-50 rounded-full flex flex-col items-center justify-center shadow-inner border-2 border-dashed border-violet-300 hover:bg-violet-100 transition-colors cursor-pointer overflow-hidden relative group">
                    <User className="w-8 h-8 text-violet-400 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] text-violet-600 font-bold whitespace-nowrap">ដាក់រូបថត</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>

              <h2 className="text-xl font-black leading-relaxed text-slate-800 mb-1 text-center" style={{ fontFamily: '"Kh Muol Pali", Moul' }}>អ្នកគ្រប់គ្រង</h2>
              <p className="text-violet-600 font-bold mt-2 mb-8 flex items-center gap-2 text-sm bg-violet-50 px-4 py-1.5 rounded-full w-max mx-auto" style={{ fontFamily: '"Khmer Mool1", Moul' }}>
                <User className="w-4 h-4" /> {adminName}
              </p>

              {!showQR ? (
                <>
                  {/* PIN Display */}
                  <div className="flex gap-3 mb-8">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div 
                        key={index}
                        className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                          error ? 'bg-red-400' :
                          pin.length > index ? 'bg-violet-600 scale-125' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Number Pad for Admin */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mx-auto">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <button
                        key={num}
                        onClick={() => handleAdminPinClick(num.toString())}
                        className="h-14 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 text-slate-700 text-xl font-bold rounded-2xl transition-all active:scale-95"
                      >
                        {num}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setShowQR(true)}
                      className="h-14 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xl rounded-2xl flex items-center justify-center transition-all active:scale-95"
                    >
                      <QrCode className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => handleAdminPinClick('0')}
                      className="h-14 bg-slate-50 hover:bg-violet-50 hover:text-violet-700 text-slate-700 text-xl font-bold rounded-2xl transition-all active:scale-95"
                    >
                      0
                    </button>
                    
                    <button
                      onClick={handleAdminDelete}
                      disabled={pin.length === 0}
                      className="h-14 bg-slate-50 hover:bg-slate-100 text-slate-500 text-xl rounded-2xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                      aria-label="Delete"
                    >
                       ⌫
                    </button>
                  </div>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="bg-white border-2 border-dashed border-violet-200 rounded-xl flex flex-col items-center justify-center p-6 relative overflow-hidden group hover:border-violet-400 transition-colors">
                    <QRCodeSVG 
                      value={JSON.stringify({ role: 'admin', name: adminName, auth: 'valid' })}
                      size={160}
                      level={"Q"}
                      includeMargin={false}
                      fgColor="#6d28d9"
                    />
                    <div className="mt-4 text-sm text-center font-bold text-violet-600">ស្កេន QR កាតសម្គាល់ខ្លួន <br/> (សម្រាប់ ADMIN)</div>
                  </div>
                  <button 
                    onClick={() => setShowQR(false)}
                    className="text-slate-500 text-sm font-bold hover:text-violet-700 transition-colors"
                  >
                    ← ត្រឡប់ទៅវាយលេខកូដវិញ
                  </button>
                </motion.div>
              )}
            </div>
          )}

        </div>
      </motion.div>

      <div className="mt-8 text-center text-slate-400 text-xs flex items-center gap-2">
        <Lock className="w-3.5 h-3.5" /> ប្រព័ន្ធគ្រប់គ្រងសាលារៀនវៃឆ្លាត • V 1.0.0
      </div>
    </div>
  );
}
