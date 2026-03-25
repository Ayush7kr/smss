import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, CreditCard, Activity, ArrowUpRight, CheckCircle, XCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({ societies: 5, activeUsers: 1204, revenue: 12500 });
  const [pendingSocieties, setPendingSocieties] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSociety, setNewSociety] = useState({ name: '', tenantId: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingSocieties();
  }, []);

  const fetchPendingSocieties = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/superadmin/societies/pending', { withCredentials: true });
      setPendingSocieties(res.data);
    } catch (err) {
      console.error('Error fetching pending societies:', err);
    }
  };

  const generateTenantId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleOpenModal = () => {
    setNewSociety({ name: '', tenantId: generateTenantId() });
    setShowAddModal(true);
  };

  const handleAction = async (tenantId, action) => {
    setActionLoading(tenantId);
    try {
      await axios.put(`http://localhost:5000/api/superadmin/societies/${tenantId}/${action}`, {}, { withCredentials: true });
      setPendingSocieties(prev => prev.filter(s => s.tenantId !== tenantId));
    } catch (err) {
      console.error(`Error ${action}ing society:`, err);
      alert(`Failed to ${action} society.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/superadmin/societies', newSociety, { withCredentials: true });
      if (res.status === 201) {
         setPendingSocieties([res.data, ...pendingSocieties]);
         setShowAddModal(false);
         setNewSociety({ name: '', tenantId: '' });
      }
    } catch (err) {
      console.error('Error creating society:', err);
      alert(err.response?.data?.message || 'Failed to create society');
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Platform Revenue',
      data: [3000, 4500, 4200, 7800, 9500, 12500],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const cards = [
    { title: 'Total Societies', value: stats.societies, icon: Building2, trend: '+2 this month' },
    { title: 'Active Users', value: stats.activeUsers.toLocaleString(), icon: Users, trend: '+12% this month' },
    { title: 'MRR', value: `$${stats.revenue}`, icon: CreditCard, trend: '+5.4% this month' },
    { title: 'System Uptime', value: '99.9%', icon: Activity, trend: 'All systems operational' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Super Admin Overview</h1>
            <p className="text-muted-foreground mt-1">Platform-wide statistics and management</p>
         </div>
         <button 
           onClick={handleOpenModal}
           className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <Building2 size={16} /> Add Society
         </button>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowAddModal(false)}
               className="absolute inset-0 bg-background/80 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl relative z-10"
             >
                <h3 className="text-xl font-bold mb-4">Add New Society</h3>
                <form onSubmit={handleCreateSociety} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium mb-1">Society Name</label>
                      <input 
                        type="text" 
                        value={newSociety.name}
                        onChange={(e) => setNewSociety({...newSociety, name: e.target.value})}
                        required
                        placeholder="e.g. Green Valley Apartments"
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                      />
                   </div>
                   <div>
                       <label className="block text-sm font-medium mb-1">Tenant ID</label>
                       <input 
                         type="text" 
                         value={newSociety.tenantId}
                         onChange={(e) => setNewSociety({...newSociety, tenantId: e.target.value.toUpperCase()})}
                         placeholder="e.g. GVALLEY"
                         className="w-full px-4 py-2 bg-background border border-border rounded-lg font-mono"
                       />
                       <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold text-primary italic">Auto-generated ID (You can customize it if you want)</p>
                    </div>
                   <div className="flex justify-end gap-3 mt-6">
                      <button 
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                      >
                         {isSubmitting ? 'Creating...' : 'Create Society'}
                      </button>
                   </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <card.icon size={20} />
              </div>
              <span className="text-xs font-medium text-green-500 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} /> {card.trend.split(' ')[0]}
              </span>
            </div>
            <h3 className="text-muted-foreground text-sm font-medium">{card.title}</h3>
            <p className="text-3xl font-bold mt-1 text-foreground">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm lg:col-span-2 flex flex-col h-[500px]"
         >
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold">Pending Society Approvals</h3>
               <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">{pendingSocieties.length} Pending</span>
            </div>
            
            {pendingSocieties.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                  <CheckCircle size={48} className="mb-4 text-green-500/50 opacity-50" />
                  <p>All societies have been reviewed.</p>
               </div>
            ) : (
               <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  <AnimatePresence>
                     {pendingSocieties.map((society) => (
                         <motion.div 
                            key={society.tenantId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col p-4 rounded-xl border border-border bg-background shadow-sm hover:shadow-md transition-shadow gap-4"
                         >
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 flex items-center justify-center text-white font-bold to-purple-600">
                                     {society.name.charAt(0)}
                                  </div>
                                  <div>
                                     <h4 className="font-bold text-base">{society.name}</h4>
                                     <p className="text-sm text-muted-foreground font-mono mt-0.5">ID: {society.tenantId}</p>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  {actionLoading === society.tenantId ? (
                                     <span className="text-sm text-muted-foreground animate-pulse px-4">Processing...</span>
                                  ) : (
                                     <>
                                        <button 
                                           onClick={() => handleAction(society.tenantId, 'approve')}
                                           disabled={!society.admin}
                                           className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                              !society.admin 
                                              ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50' 
                                              : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:scale-105 active:scale-95'
                                           }`}
                                           title={!society.admin ? "Waiting for Society Admin registration" : "Approve Society"}
                                        >
                                           <CheckCircle size={20} />
                                        </button>
                                        <button 
                                           onClick={() => handleAction(society.tenantId, 'reject')}
                                           className="w-10 h-10 rounded-full flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:scale-105 active:scale-95 transition-all"
                                           title="Reject Society"
                                        >
                                           <XCircle size={20} />
                                        </button>
                                     </>
                                  )}
                               </div>
                            </div>
                            
                            {society.admin ? (
                               <div className="bg-muted/30 p-3 rounded-lg flex items-center justify-between border border-border/50">
                                  <div>
                                     <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Proposed Admin</p>
                                     <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold">{society.admin.name}</span>
                                        <span className="text-xs text-muted-foreground">•</span>
                                        <span className="text-xs text-muted-foreground">{society.admin.email}</span>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Awaiting Admin Approval</span>
                                  </div>
                               </div>
                            ) : (
                               <div className="bg-orange-500/5 p-3 rounded-lg border border-orange-500/10">
                                  <p className="text-xs text-orange-500 font-medium">No admin user has registered for this society yet.</p>
                                </div>
                            )}
                         </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            )}
         </motion.div>
         
         <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex flex-col h-[500px]"
         >
            <h3 className="text-lg font-bold mb-4 flex-none">Revenue Growth</h3>
            <div className="flex-1 w-full relative min-h-[200px]">
               <Line data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
         </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
