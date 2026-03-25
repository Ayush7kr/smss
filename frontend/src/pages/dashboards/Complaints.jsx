import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Search, Filter, MessageSquare, MoreVertical, Plus, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const getStatusColor = (status) => {
  switch(status) {
    case 'Pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Resolved': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getPriorityColor = (priority) => {
  switch(priority) {
    case 'High': return 'text-red-500 bg-red-500/10';
    case 'Medium': return 'text-yellow-500 bg-yellow-500/10';
    case 'Low': return 'text-blue-500 bg-blue-500/10';
    default: return 'text-muted-foreground bg-muted';
  }
};

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ category: 'Maintenance', description: '', location: '', priority: 'Low' });
  const [submitting, setSubmitting] = useState(false);

  // Vendor assignment state
  const [isAssigning, setIsAssigning] = useState(null); // complaint object
  const [vendors, setVendors] = useState([]);
  const [vendorSearch, setVendorSearch] = useState('');
  const [assigningLoading, setAssigningLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
    if (user?.role === 'Society_Admin' || user?.role === 'Super_Admin') {
      fetchVendors();
    }
  }, [user]);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/users/vendors');
      setVendors(res.data);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      console.error('Failed to get complaints', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/complaints', newTicket);
      setComplaints([res.data, ...complaints]);
      setIsCreating(false);
      setNewTicket({ category: 'Maintenance', description: '', location: '', priority: 'Low' });
    } catch (err) {
      console.error('Failed to create ticket', err);
      alert('Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignVendor = async (complaintId, vendorId) => {
    setAssigningLoading(true);
    try {
      const res = await api.put(`/complaints/${complaintId}`, { vendorId, status: 'Assigned' });
      setComplaints(complaints.map(c => c._id === complaintId ? res.data : c));
      setIsAssigning(null);
    } catch (err) {
      console.error('Failed to assign vendor', err);
      alert('Failed to assign vendor');
    } finally {
      setAssigningLoading(false);
    }
  };

  const filteredVendors = vendors.filter(v => 
    v.name?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    v.serviceType?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  const filteredComplaints = complaints.filter(c => 
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaints Hub</h1>
            <p className="text-muted-foreground mt-1">Review, assign, and resolve resident issues.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
               <input 
                  type="text" 
                  placeholder="Search tickets..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
               />
            </div>
            <button className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-foreground transition-colors" title="Filter">
               <Filter size={20} />
            </button>
            {user?.role === 'Resident' && (
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCreating ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isCreating ? 'Cancel' : <><Plus size={16} /> New Ticket</>}
              </button>
            )}
         </div>
      </div>

       <AnimatePresence>
         {isAssigning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setIsAssigning(null)}
                 className="absolute inset-0 bg-background/80 backdrop-blur-sm"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="bg-card border border-border w-full max-w-lg p-6 rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[80vh]"
               >
                  <h3 className="text-xl font-bold mb-2">Assign Vendor</h3>
                  <p className="text-sm text-muted-foreground mb-4">Select a vendor for: <span className="text-foreground font-medium">{isAssigning.category}</span></p>
                  
                  <div className="relative mb-4">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                     <input 
                        type="text" 
                        placeholder="Search vendors by name or service..." 
                        value={vendorSearch}
                        onChange={(e) => setVendorSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm"
                     />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                     {filteredVendors.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground italic">No matching vendors found.</p>
                     ) : (
                        filteredVendors.map(vendor => (
                           <div key={vendor._id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {vendor.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm">{vendor.name}</p>
                                    <p className="text-xs text-muted-foreground">{vendor.serviceType || 'General Service'} • {vendor.phone}</p>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => handleAssignVendor(isAssigning._id, vendor._id)}
                                 disabled={assigningLoading}
                                 className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90"
                              >
                                 Assign
                              </button>
                           </div>
                        ))
                     )}
                  </div>

                  <div className="flex justify-end mt-6">
                     <button 
                        onClick={() => setIsAssigning(null)}
                        className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg"
                     >
                        Cancel
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <AnimatePresence>
         {isCreating && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden"
            >
               <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select 
                           value={newTicket.category} 
                           onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                           className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                        >
                           <option value="Maintenance">Maintenance</option>
                           <option value="Plumbing">Plumbing</option>
                           <option value="Electrical">Electrical</option>
                           <option value="Security">Security</option>
                           <option value="Housekeeping">Housekeeping</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Priority</label>
                        <select 
                           value={newTicket.priority} 
                           onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                           className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                        >
                           <option value="Low">Low</option>
                           <option value="Medium">Medium</option>
                           <option value="High">High</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Location Details (e.g. Master Bedroom, Gym)</label>
                     <input 
                        type="text" 
                        value={newTicket.location} 
                        onChange={e => setNewTicket({...newTicket, location: e.target.value})}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium mb-1">Description</label>
                     <textarea 
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        placeholder="Describe the issue in detail..."
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg min-h-[100px] focus:outline-none focus:border-primary transition-colors resize-y"
                        required
                     />
                  </div>
                  <div className="flex justify-end">
                     <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                     >
                        {submitting ? 'Submitting...' : <><CheckCircle size={16} /> Submit Ticket</>}
                     </button>
                  </div>
               </form>
            </motion.div>
         )}
      </AnimatePresence>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-card border border-border rounded-2xl glass shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                    <th className="py-4 px-6 font-medium">Ticket ID</th>
                    <th className="py-4 px-6 font-medium">Issue Details</th>
                    <th className="py-4 px-6 font-medium">Priority</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                    <th className="py-4 px-6 font-medium">Date Raised</th>
                    <th className="py-4 px-6 font-medium text-right">Actions</th>
                 </tr>
              </thead>
              <tbody>
                 {filteredComplaints.length === 0 ? (
                    <tr>
                       <td colSpan="6" className="py-12 text-center text-muted-foreground">
                          <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No complaints match your search.</p>
                       </td>
                    </tr>
                 ) : (
                    filteredComplaints.map((complaint, idx) => (
                       <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={complaint.id} 
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group cursor-pointer"
                       >
                          <td className="py-4 px-6 font-mono text-sm font-semibold">{complaint._id.slice(-6).toUpperCase()}</td>
                           <td className="py-4 px-6">
                             <p className="font-bold text-foreground line-clamp-1">{complaint.description}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-semibold text-muted-foreground">{complaint.category}</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                <span className="text-xs text-muted-foreground">Loc: {complaint.location || 'N/A'}</span>
                                {complaint.resident && (
                                   <>
                                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                      <span className="text-xs text-muted-foreground">{complaint.resident.name} - Flat {complaint.resident.flatNumber || 'Mngmt'}</span>
                                   </>
                                )}
                             </div>
                             {complaint.vendor && (
                                <div className="mt-2 text-xs flex items-center gap-2 text-primary font-medium bg-primary/5 w-fit px-2 py-1 rounded">
                                   <CheckCircle size={12} />
                                   Assigned: {complaint.vendor.name} ({complaint.vendor.phone || 'No phone'})
                                </div>
                             )}
                          </td>
                          <td className="py-4 px-6">
                             <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getPriorityColor(complaint.priority)}`}>
                                {complaint.priority}
                             </span>
                          </td>
                          <td className="py-4 px-6">
                             <span className={`text-xs px-2.5 py-1 border rounded-full font-bold inline-flex items-center gap-1.5 ${getStatusColor(complaint.status)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {complaint.status}
                             </span>
                          </td>
                          <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                             {new Date(complaint.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 {(user?.role === 'Society_Admin' || user?.role === 'Super_Admin') && complaint.status === 'Pending' && (
                                    <button 
                                       onClick={(e) => { e.stopPropagation(); setIsAssigning(complaint); }}
                                       className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-all transition-colors"
                                    >
                                       Assign Vendor
                                    </button>
                                 )}
                                 <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Message Resident">
                                    <MessageSquare size={18} />
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
    </div>
  );
};

export default Complaints;
