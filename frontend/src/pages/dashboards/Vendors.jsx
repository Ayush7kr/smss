import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Search, Filter, Phone, Star, History, X, Clock, MapPin } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const getStatusColor = (status) => {
  switch(status) {
    case 'Available': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'On Site': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Unavailable': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorHistory, setVendorHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      // Calls the performance endpoint which already sorts by rating
      const res = await api.get('/vendors/performance');
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVendorHistory = async (vendor) => {
    setSelectedVendor(vendor);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/complaints/vendor/${vendor._id}/history`);
      setVendorHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendor Directory</h1>
            <p className="text-muted-foreground mt-1">Manage external contractors and performance statistics.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
               <input 
                  type="text" 
                  placeholder="Search vendors..." 
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
           <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                 <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                    <th className="py-4 px-6 font-medium">Vendor Details</th>
                    <th className="py-4 px-6 font-medium">Service Category</th>
                    <th className="py-4 px-6 font-medium">Performance Metrics</th>
                    <th className="py-4 px-6 font-medium">Rating</th>
                    <th className="py-4 px-6 font-medium text-right">Contact Info</th>
                 </tr>
              </thead>
              <tbody>
                 {filteredVendors.length === 0 ? (
                    <tr>
                       <td colSpan="5" className="py-12 text-center text-muted-foreground">
                          <Wrench size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No vendors found.</p>
                       </td>
                    </tr>
                 ) : (
                    filteredVendors.map((vendor, idx) => (
                       <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={vendor._id} 
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group"
                       >
                          <td className="py-4 px-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-foreground flex items-center justify-center font-bold border border-border/50 shadow-sm shrink-0">
                                   {vendor.name?.charAt(0) || 'V'}
                                </div>
                                <div>
                                   <p className="font-bold text-foreground">{vendor.name}</p>
                                   <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {vendor._id.slice(-6).toUpperCase()}</p>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 px-6">
                             <span className="text-sm font-medium bg-muted px-2 py-1 rounded-md text-foreground">{vendor.serviceType || 'General Service'}</span>
                          </td>
                          <td className="py-4 px-6">
                             <div className="flex flex-col gap-1">
                                <div className="text-xs font-semibold flex items-center justify-between w-32">
                                   <span className="text-muted-foreground">Tasks:</span> 
                                   <span className="text-foreground">{vendor.totalTasksAssigned || 0}</span>
                                </div>
                                <div className="text-[11px] flex items-center justify-between w-32 border-t border-border/50 pt-1">
                                   <span className="text-green-500">On Time:</span> 
                                   <span className="font-medium text-green-500">{vendor.completedOnTime || 0}</span>
                                </div>
                                <div className="text-[11px] flex items-center justify-between w-32 border-t border-border/50 pt-1">
                                   <span className="text-orange-500">Late:</span> 
                                   <span className="font-medium text-orange-500">{vendor.completedLate || 0}</span>
                                </div>
                                <div className="text-[11px] flex items-center justify-between w-32 border-t border-border/50 pt-1">
                                   <span className="text-red-500">Failed/Escalated:</span> 
                                   <span className="font-medium text-red-500">{vendor.failedTasks || 0}</span>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 px-6 flex flex-col justify-center gap-1">
                             <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={16} className="fill-current" />
                                <span className="text-base font-bold text-foreground">
                                   {vendor.rating ? vendor.rating.toFixed(1) : '0.0'}
                                </span>
                             </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                             <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-xs text-muted-foreground mr-2 font-mono">{vendor.phone || 'N/A'}</div>
                                <button 
                                   onClick={() => fetchVendorHistory(vendor)}
                                   className="p-2 text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-border shadow-sm" 
                                   title="View Task History"
                                >
                                   <History size={14} />
                                </button>
                                <button className="p-2 text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-lg transition-colors border border-transparent shadow-sm" title="Call Vendor">
                                   <Phone size={14} />
                                </button>
                             </div>
                          </td>
                       </motion.tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </motion.div>
      
      {/* History Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedVendor(null)}
               className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-card border border-border w-full max-w-2xl p-6 rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
            >
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
                        {selectedVendor.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold">{selectedVendor.name} - Task History</h3>
                        <p className="text-sm text-muted-foreground">{selectedVendor.serviceType || 'General Service'}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedVendor(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                     <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                  {historyLoading ? (
                     <div className="py-20 text-center text-muted-foreground animate-pulse">Loading history...</div>
                  ) : vendorHistory.length === 0 ? (
                     <div className="py-20 text-center text-muted-foreground italic">No tasks assigned to this vendor yet.</div>
                  ) : (
                     vendorHistory.map(task => (
                        <div key={task._id} className="p-4 rounded-xl border border-border bg-muted/20">
                           <div className="flex justify-between items-start mb-2">
                              <div>
                                 <p className="font-bold text-sm">{task.category}</p>
                                 <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                 task.status === 'Resolved' || task.status === 'Verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                 task.status === 'Rejected by Vendor' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                              }`}>
                                 {task.status}
                              </span>
                           </div>
                           <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin size={10} /> {task.location}</span>
                              <span className="flex items-center gap-1"><Clock size={10} /> {new Date(task.createdAt).toLocaleDateString()}</span>
                              {task.resident && <span>Resident: {task.resident.name}</span>}
                           </div>
                           {task.status === 'Rejected by Vendor' && task.resolutionNotes && (
                              <div className="mt-2 p-2 bg-red-500/5 rounded text-[10px] text-red-500 italic border border-red-500/10">
                                 Reason for rejection: {task.resolutionNotes}
                              </div>
                           )}
                        </div>
                     ))
                  )}
               </div>
               
               <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                  <div>Total Tasks: <span className="text-foreground font-bold">{vendorHistory.length}</span></div>
                  <button onClick={() => setSelectedVendor(null)} className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-bold rounded-lg transition-colors">Close</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendors;
