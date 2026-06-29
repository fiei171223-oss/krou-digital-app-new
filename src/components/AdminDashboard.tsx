import React, { useMemo } from 'react';
import { Users, School, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { stats, chartData } = useMemo(() => {
    // Read from local storage to get real teacher accounts
    const storedAccountsStr = localStorage.getItem('teacher_accounts');
    let accounts: any[] = [];
    if (storedAccountsStr) {
      try {
        accounts = JSON.parse(storedAccountsStr);
      } catch (e) {}
    }
    
    // We also need provinces, which aren't in TeacherAccount directly, but are entered on login.
    // However, since we don't have them in TeacherAccount, let's extract school and assume province is linked if they provided it,
    // or just rely on what is available in the data. LoginView seems to take provinceName, but TeacherAccount object only has school.
    // If province isn't stored in teacher_accounts, we can just extract from school or just leave it empty.
    const uniqueProvinces = [...new Set(accounts.map(a => a.province || 'មិនបញ្ជាក់').filter(Boolean))];
    const uniqueSchools = [...new Set(accounts.map(a => a.school).filter(Boolean))];
    
    // Revenue calculation
    // E.g., assume $15/month per paid user. Exclude 'សាលាបឋមសិក្សាព្រែកទាល់' if free.
    const paidUsers = accounts.filter(a => a.school.trim() !== 'សាលាបឋមសិក្សាព្រែកទាល់').length;
    const revenue = paidUsers * 15; 

    // Generate chart data by month
    const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];
    
    // Initialize current year monthly data to 0
    const currentYear = new Date().getFullYear();
    const monthlyData = months.map((m) => ({ name: m, users: 0 }));

    accounts.forEach(acc => {
      if (acc.createdAt) {
        const date = new Date(acc.createdAt);
        if (date.getFullYear() === currentYear) {
          monthlyData[date.getMonth()].users += 1;
        }
      }
    });
    
    // For cumulative users in the chart
    let cumulative = 0;
    const computedChartData = monthlyData.map(m => {
      cumulative += m.users;
      return { ...m, users: cumulative };
    });

    return {
      stats: {
        totalUsers: accounts.length,
        provinces: uniqueProvinces,
        schools: uniqueSchools,
        revenue: revenue,
      },
      chartData: computedChartData
    };
  }, []);

  return (
    <div className="w-full bg-slate-900 rounded-3xl p-6 md:p-10 mb-10 shadow-2xl relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-amber-500/20 rounded-2xl">
            <TrendingUp className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: '"Khmer Mool1", Moul' }}>
            ផ្ទាំងគ្រប់គ្រងទិន្នន័យ (ADMIN)
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Users Card */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">+12%</span>
            </div>
            <h3 className="text-slate-400 text-sm font-bold mb-1">អ្នកប្រើប្រាស់សរុប</h3>
            <p className="text-3xl font-black text-white">{stats.totalUsers.toLocaleString()}</p>
          </div>

          {/* Revenue Card */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-emerald-400 text-sm font-bold bg-emerald-400/10 px-2 py-1 rounded-lg">+8%</span>
            </div>
            <h3 className="text-slate-400 text-sm font-bold mb-1">ប្រាក់ចំណូលសរុប</h3>
            <p className="text-3xl font-black text-emerald-400">${stats.revenue.toLocaleString()}</p>
          </div>

          {/* Provinces Card */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <MapPin className="w-6 h-6 text-rose-400" />
              </div>
              <span className="text-slate-400 text-sm font-bold">{stats.provinces.length} ខេត្ត</span>
            </div>
            <h3 className="text-slate-400 text-sm font-bold mb-3">ខេត្ត/រាជធានី</h3>
            <div className="flex flex-wrap gap-2">
              {stats.provinces.slice(0, 3).map((prov, i) => (
                <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md">{prov}</span>
              ))}
              {stats.provinces.length > 3 && (
                <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md">+{stats.provinces.length - 3} ទៀត</span>
              )}
            </div>
          </div>

          {/* Schools Card */}
          <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <School className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-slate-400 text-sm font-bold">{stats.schools.length} សាលា</span>
            </div>
            <h3 className="text-slate-400 text-sm font-bold mb-3">សាលារៀន</h3>
            <div className="flex flex-wrap gap-2">
              {stats.schools.slice(0, 2).map((school, i) => (
                <span key={i} className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md">{school}</span>
              ))}
              {stats.schools.length > 2 && (
                <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-1 rounded-md">+{stats.schools.length - 2} ទៀត</span>
              )}
            </div>
          </div>

        </div>

        {/* Chart Section */}
        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6">ក្រាបអ្នកប្រើប្រាស់</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#818cf8' }}
                />
                <Area type="monotone" dataKey="users" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
