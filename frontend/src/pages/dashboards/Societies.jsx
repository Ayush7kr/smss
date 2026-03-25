import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, Filter, Calendar, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const Societies = () => {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSocieties();
  }, []);

  const fetchSocieties = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/superadmin/societies', { withCredentials: true });
      setSocieties(res.data);
    } catch (err) {
      console.error('Failed to fetch societies', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSocieties = societies.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.tenantId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Approved Societies</h1>
            <p className="text-muted-foreground mt-1">Manage all registered and active housing societies on the platform.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
               <input 
                  type="text" 
                  placeholder="Search societies..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
               />
            </div>
            <button className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-foreground transition-colors" title="Filter">
               <Filter size={20} />
            </button>
         </div>
      </div>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-card border border-border rounded-2xl glass shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                    <th className="py-4 px-6 font-medium">Society Name</th>
                    <th className="py-4 px-6 font-medium">Tenant ID</th>
                    <th className="py-4 px-6 font-medium">Subscription</th>
                    <th className="py-4 px-6 font-medium">Registered On</th>
                    <th className="py-4 px-6 font-medium text-right">Status</th>
                 </tr>
              </thead>
              <tbody>
                 {loading ? (
                    <tr>
                       <td colSpan="5" className="py-12 text-center text-muted-foreground animate-pulse">
                          Loading societies...
                       </td>
                    </tr>
                 ) : filteredSocieties.length === 0 ? (
                    <tr>
                       <td colSpan="5" className="py-12 text-center text-muted-foreground">
                          <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No societies found.</p>
                       </td>
                    </tr>
                 ) : (
                    filteredSocieties.map((society, idx) => (
                       <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={society.tenantId} 
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group"
                       >
                          <td className="py-4 px-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-foreground flex items-center justify-center font-bold border border-border/50 shadow-sm shrink-0">
                                   {society.name?.charAt(0) || 'S'}
                                </div>
                                <p className="font-bold text-foreground">{society.name}</p>
                             </div>
                          </td>
                          <td className="py-4 px-6 font-mono text-sm font-semibold">
                             {society.tenantId}
                          </td>
                          <td className="py-4 px-6">
                             <span className="text-xs px-2.5 py-1 bg-primary/10 text-primary rounded-full font-bold uppercase tracking-wider">
                                {society.subscriptionStatus || 'Trial'}
                             </span>
                          </td>
                          <td className="py-4 px-6">
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar size={14} />
                                {new Date(society.createdAt).toLocaleDateString()}
                             </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                             <span className="text-xs px-2.5 py-1 border border-green-500/20 bg-green-500/10 text-green-500 rounded-full font-bold inline-flex items-center gap-1.5">
                                <ShieldCheck size={12} />
                                Active
                             </span>
                          </td>
                       </motion.tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Societies;
