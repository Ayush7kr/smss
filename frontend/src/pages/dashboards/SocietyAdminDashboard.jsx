import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Users, AlertCircle, Wallet, ShieldCheck, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import api from '../../utils/api';
import 'chart.js/auto';

const SocietyAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalResidents: 0,
    pendingComplaints: 0,
    todaysVisitors: 0,
    totalBillsPaid: 0,
    totalBillsPending: 0
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

  const chartData = {
    labels: ['Plumbing', 'Electrical', 'Housekeeping', 'Security'],
    datasets: [{
      label: 'Complaints by Category',
      data: [12, 19, 3, 5], // Example default data
      backgroundColor: 'rgba(79, 70, 229, 0.6)',
      borderRadius: 4,
    }]
  };

  const cards = [
    { title: 'Total Residents', value: stats.totalResidents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Pending Complaints', value: stats.pendingComplaints, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { title: 'Pending Bills', value: stats.totalBillsPending, icon: Wallet, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Todays Visitors', value: stats.todaysVisitors, icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10' }
  ];

  if (loading) return <div className="animate-pulse flex gap-4 h-32 w-full"><div className="flex-1 bg-muted rounded-2xl"></div></div>;

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Society Overview</h1>
         <p className="text-muted-foreground mt-1">Manage everything in your society from one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm h-[350px]"
         >
            <h3 className="text-lg font-bold mb-4">Complaint Distribution</h3>
            <div className="h-[250px] w-full">
               <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
         </motion.div>
         
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm"
         >
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-4">
               {/* Activity Feed Placeholder */}
               <div className="flex gap-4 relative pb-4 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Users size={16}/></div>
                  <div>
                    <p className="text-sm font-medium">New Resident Onboarded</p>
                    <p className="text-xs text-muted-foreground">Flat A-102 • 2 hours ago</p>
                  </div>
               </div>
               <div className="flex gap-4 relative pb-4 border-b border-border/50">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center"><AlertCircle size={16}/></div>
                  <div>
                    <p className="text-sm font-medium">Plumbing issue raised</p>
                    <p className="text-xs text-muted-foreground">Flat B-405 • 3 hours ago</p>
                  </div>
               </div>
               <div className="flex gap-4 relative pb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center"><ShieldCheck size={16}/></div>
                  <div>
                    <p className="text-sm font-medium">Visitor Approved</p>
                    <p className="text-xs text-muted-foreground">Delivery for Flat C-201 • 5 hours ago</p>
                  </div>
               </div>
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
                         <th className="pb-3 px-4 font-medium">Details</th>
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
                            <td className="py-4 px-4 text-muted-foreground text-sm">
                               {user.flatNumber && <span className="block">Flat: {user.flatNumber}</span>}
                               {user.phone && <span className="block">{user.phone}</span>}
                            </td>
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
