import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, Wallet, ShieldCheck, CheckCircle2, XCircle, Clock, TrendingUp, Star } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import api from '../../utils/api';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
        <p className="font-bold text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SocietyAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalResidents: 0, pendingComplaints: 0, todaysVisitors: 0, totalBillsPaid: 0, totalBillsPending: 0,
    avgResolutionTimeDays: 0, percentOnTime: 0, overdueComplaintsCount: 0, paymentSuccessRate: 0,
    complaintStatusDistribution: [], complaintsByCategory: [], monthlyRevenue: [], vendorPerformance: [], recentActivity: []
  });
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, pendingRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/users/pending')
        ]);
        setStats(statsRes.data);
        setPendingUsers(pendingRes.data);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleStatusUpdate = async (userId, status) => {
    try {
      await api.put(`/users/${userId}/status`, { status });
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const cards = [
    { title: 'Total Residents', value: stats.totalResidents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Open Complaints', value: stats.pendingComplaints, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Todays Visitors', value: stats.todaysVisitors, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' },
    { title: 'Avg Resolution Time', value: `${stats.avgResolutionTimeDays?.toFixed(1) || 0}D`, icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { title: 'On-Time Completion', value: `${stats.percentOnTime?.toFixed(0) || 0}%`, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { title: 'Payment Success Rate', value: `${stats.paymentSuccessRate?.toFixed(0) || 0}%`, icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10' }
  ];

  // Map monthly revenue nicely
  const revenueData = stats.monthlyRevenue?.map(item => ({
    name: monthNames[item._id.month - 1],
    Revenue: item.revenue
  })) || [];

  const categoryData = stats.complaintsByCategory?.map(item => ({
    name: item._id,
    Complaints: item.count
  })) || [];

  const pieData = stats.complaintStatusDistribution?.map(item => ({
    name: item._id,
    value: item.count
  })) || [];

  if (loading) return <div className="animate-pulse flex gap-4 h-32 w-full"><div className="flex-1 bg-muted rounded-2xl"></div></div>;

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Society Analytics</h1>
         <p className="text-muted-foreground mt-1">Deep insights and metrics for your community.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-card border border-border p-5 rounded-2xl glass shadow-sm flex flex-col items-start gap-4 hover:shadow-md hover:border-border/80 transition-all cursor-default"
          >
            <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={20} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Line Chart - Revenue */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm col-span-1 lg:col-span-2 h-[350px] flex flex-col"
         >
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
               <TrendingUp size={18} className="text-primary" /> Monthly Revenue Trend
            </h3>
            <div className="flex-1 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                     <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                     <Tooltip content={<CustomTooltip />} />
                     <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }} activeDot={{ r: 6, fill: '#3b82f6' }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </motion.div>
         
         {/* Pie Chart - Status */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex flex-col"
         >
            <h3 className="text-lg font-bold mb-4">Complaint Status</h3>
            <div className="flex-1 w-full min-h-[250px] relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Tooltip content={<CustomTooltip />} />
                     <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-3xl font-bold">{pieData.reduce((a, b) => a + b.value, 0)}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
               </div>
            </div>
         </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Bar Chart - Categories */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm col-span-1 lg:col-span-2 h-[350px] flex flex-col"
         >
            <h3 className="text-lg font-bold mb-4">Complaints By Category</h3>
            <div className="flex-1 w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                     <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                     <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155' }} />
                     <Bar dataKey="Complaints" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Vendor Performance Panel */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex flex-col"
         >
            <div className="flex justify-between items-center mb-4">
               <h3 className="text-lg font-bold">Top Vendors</h3>
               <Star size={18} className="text-yellow-500 fill-yellow-500" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
               {stats.vendorPerformance?.map(vendor => (
                  <div key={vendor._id} className="p-3 bg-muted/30 border border-border rounded-xl flex items-center justify-between hover:bg-muted/50 transition-colors">
                     <div>
                        <p className="text-sm font-bold">{vendor.name}</p>
                        <p className="text-xs text-muted-foreground">{vendor.completedOnTime} on-time | {vendor.failedTasks} failed</p>
                     </div>
                     <div className="text-right">
                        <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-lg text-sm">
                           {vendor.rating.toFixed(1)} <Star size={12} className="fill-yellow-500" />
                        </div>
                     </div>
                  </div>
               ))}
               {(!stats.vendorPerformance || stats.vendorPerformance.length === 0) && (
                  <p className="text-sm text-center text-muted-foreground py-4">No vendor data available.</p>
               )}
            </div>
         </motion.div>
      </div>

       {/* Pending Approvals Section */}
       {pendingUsers.length > 0 && (
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="bg-card border border-border p-6 rounded-2xl glass shadow-sm mt-6"
          >
             <h3 className="text-lg font-bold mb-4">Pending Approvals</h3>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-border/50 text-muted-foreground text-sm">
                         <th className="pb-3 px-4 font-medium">Name</th>
                         <th className="pb-3 px-4 font-medium">Role</th>
                         <th className="pb-3 px-4 font-medium">Email</th>
                         <th className="pb-3 px-4 font-medium text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {pendingUsers.map(user => (
                         <tr key={user._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="py-4 px-4 font-medium">{user.name}</td>
                            <td className="py-4 px-4">
                               <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-semibold">
                                  {user.role}
                               </span>
                            </td>
                            <td className="py-4 px-4 text-muted-foreground text-sm">{user.email}</td>
                            <td className="py-4 px-4 text-right">
                               <div className="flex justify-end gap-2">
                                  <button onClick={() => handleStatusUpdate(user._id, 'Approved')} className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all" title="Approve">
                                     <CheckCircle2 size={18} />
                                  </button>
                                  <button onClick={() => handleStatusUpdate(user._id, 'Rejected')} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Reject">
                                     <XCircle size={18} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </motion.div>
       )}
    </div>
  );
};

export default SocietyAdminDashboard;
