import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AlertCircle, Wallet, Clock, CheckCircle2, UserCheck, Timer } from 'lucide-react';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const ResidentDashboard = () => {
  const [stats, setStats] = useState({
    myComplaints: 0,
    myPendingBills: 0,
    recentComplaints: [],
    upcomingVisitors: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="animate-pulse flex gap-4 h-32 w-full"><div className="flex-1 bg-muted rounded-2xl"></div></div>;

  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Welcome Home</h1>
         <p className="text-muted-foreground mt-1">Manage your flat, visitors, and society dues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex items-center gap-4"
        >
            <div className="p-4 rounded-xl bg-orange-500/10 text-orange-500">
               <Wallet size={24} />
            </div>
            <div>
               <p className="text-muted-foreground text-sm font-medium">Pending Dues</p>
               <h3 className="text-2xl font-bold text-foreground">{stats.myPendingBills} Bills</h3>
            </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex items-center gap-4"
        >
            <div className="p-4 rounded-xl bg-blue-500/10 text-blue-500">
               <AlertCircle size={24} />
            </div>
            <div>
               <p className="text-muted-foreground text-sm font-medium">Active Complaints</p>
               <h3 className="text-2xl font-bold text-foreground">{stats.myComplaints} Open</h3>
            </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm min-h-[300px]"
         >
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold">Recent Complaints</h3>
               <Link to="/complaints" className="text-sm text-primary hover:underline">View All</Link>
            </div>
            
            {!stats.recentComplaints || stats.recentComplaints.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <CheckCircle2 size={32} className="text-green-500 mb-2 opacity-50" />
                  <p>All good! No active complaints.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {stats.recentComplaints.map(complaint => (
                     <div key={complaint._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center"><Clock size={16}/></div>
                           <div>
                              <p className="text-sm font-medium">{complaint.description}</p>
                              <p className="text-xs text-muted-foreground">{complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                           complaint.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                           {complaint.status}
                        </span>
                     </div>
                  ))}
               </div>
            )}
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm min-h-[300px]"
         >
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-bold">Upcoming Visitors</h3>
               <Link to="/visitors" className="text-sm text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg">Pre-Approve Visitor</Link>
            </div>
            
            {!stats.upcomingVisitors || stats.upcomingVisitors.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center px-4">
                  <UserCheck size={32} className="mb-2 opacity-20" />
                  <p>No expected visitors for today.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {stats.upcomingVisitors.map(visitor => (
                     <div key={visitor._id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                              {visitor.name.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-medium">{visitor.name}</p>
                              <p className="text-xs text-muted-foreground text-primary italic font-medium">{visitor.purpose}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-semibold">
                           <Timer size={14} className="text-muted-foreground" />
                           {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           <span className={`ml-2 px-2 py-0.5 rounded-full ${
                              visitor.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                           }`}>
                              {visitor.status}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </motion.div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
