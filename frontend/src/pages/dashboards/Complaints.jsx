import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Search, Filter, MessageSquare, Plus, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const getStatusColor = (status) => {
  switch(status) {
    case 'Pending': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    case 'Assigned': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'In Progress': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'Completed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'Verified': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Escalated': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'Rejected by Vendor': return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'Reassigned': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
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

const getCountdown = (dueDate, status) => {
  if (!dueDate || status === 'Completed' || status === 'Verified' || status === 'Resolved') return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500 bg-red-500/10' };
  if (diffDays === 0) return { text: 'Due Today', color: 'text-orange-500 bg-orange-500/10' };
  if (diffDays <= 2) return { text: `${diffDays} days left`, color: 'text-yellow-500 bg-yellow-500/10' };
  return { text: `${diffDays} days left`, color: 'text-muted-foreground bg-muted' };
};

const Complaints = () => {
  const { user } = useContext(AuthContext);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ category: 'Maintenance', description: '', location: '', priority: 'Low' });
  const [submitting, setSubmitting] = useState(false);

  // Vendor assignment & rejection state
  const [isAssigning, setIsAssigning] = useState(null); // complaint object
  const [isRejecting, setIsRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [assignDueDate, setAssignDueDate] = useState('');
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
      const res = await api.get('/vendors/performance');
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

  const handleAction = async (complaintId, action, payload = {}) => {
    try {
      const res = await api.put(`/complaints/${complaintId}/${action}`, payload);
      setComplaints(complaints.map(c => c._id === complaintId ? res.data : c));
      
      if (action === 'reject') {
         setIsRejecting(null);
         setRejectReason('');
      }
    } catch (err) {
       console.error(`Failed to ${action}`, err);
       alert(`Failed to ${action}`);
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
    if (!assignDueDate) {
       alert('Please select a due date');
       return;
    }
    setAssigningLoading(true);
    try {
      const action = isAssigning.status === 'Pending' ? 'assign' : 'reassign';
      const res = await api.put(`/complaints/${complaintId}/${action}`, { vendorId, dueDate: assignDueDate });
      setComplaints(complaints.map(c => c._id === complaintId ? res.data : c));
      setIsAssigning(null);
      setAssignDueDate('');
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
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Complaints Hub</h1>
            <p className="text-muted-foreground mt-1">Review, assign, and resolve resident issues with deadlines.</p>
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
                 className="bg-card border border-border w-full max-w-2xl p-6 rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
               >
                  <h3 className="text-xl font-bold mb-2">Assign to Vendor</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set deadline and assign vendor for: <span className="text-foreground font-medium">{isAssigning.category}</span></p>
                  
                  <div className="mb-4">
                     <label className="block text-sm font-semibold mb-1">Task Deadline (Due Date)</label>
                     <input 
                        type="datetime-local" 
                        value={assignDueDate}
                        onChange={(e) => setAssignDueDate(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/50"
                     />
                  </div>

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
                           <div key={vendor._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                    {vendor.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm flex items-center gap-2">
                                       {vendor.name} 
                                       <span className="text-yellow-500 text-xs flex items-center gap-1">★ {vendor.rating?.toFixed(1) || '0.0'}</span>
                                    </p>
                                    <p className="text-xs text-muted-foreground">{vendor.serviceType || 'General Service'} • {vendor.phone}</p>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                 <div className="flex gap-2 text-xs text-muted-foreground">
                                    <span className="text-green-500">{vendor.completedOnTime || 0} On Time</span>
                                    <span className="text-red-500">{vendor.failedTasks || 0} Failed</span>
                                 </div>
                                 <button 
                                    onClick={() => handleAssignVendor(isAssigning._id, vendor._id)}
                                    disabled={assigningLoading || !assignDueDate}
                                    className="px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                 >
                                    Assign & Notify
                                 </button>
                              </div>
                           </div>
                        ))
                     )}
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-border">
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
         {isRejecting && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRejecting(null)} className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border w-full max-w-md p-6 rounded-2xl shadow-2xl relative z-10 flex flex-col">
                  <h3 className="text-xl font-bold mb-2 text-red-500">Reject Task</h3>
                  <p className="text-sm text-muted-foreground mb-4">Please provide a valid reason for missing or rejecting this task.</p>
                  
                  <textarea 
                     value={rejectReason}
                     onChange={(e) => setRejectReason(e.target.value)}
                     placeholder="State your reason here..."
                     className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm min-h-[100px] mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-y"
                     required
                  />

                  <div className="flex justify-end gap-3 pt-2">
                     <button onClick={() => setIsRejecting(null)} className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">Cancel</button>
                     <button 
                        onClick={() => handleAction(isRejecting._id, 'reject', { reason: rejectReason })}
                        disabled={!rejectReason.trim()}
                        className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600 disabled:opacity-50 transition-colors"
                     >
                        Submit Rejection
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
                     <label className="block text-sm font-medium mb-1">Location Details</label>
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
          className="bg-card border border-border rounded-2xl glass shadow-sm overflow-hidden overflow-x-auto pb-4"
       >
          <table className="w-full text-left border-collapse min-w-[1000px]">
             <thead>
                <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                   <th className="py-4 px-6 font-medium">Ticket / Issue</th>
                   <th className="py-4 px-6 font-medium">Assignment</th>
                   <th className="py-4 px-6 font-medium">Priority</th>
                   <th className="py-4 px-6 font-medium">Status & Deadline</th>
                   <th className="py-4 px-6 font-medium">Date Raised</th>
                   <th className="py-4 px-6 text-right font-medium">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-border/50">
                {filteredComplaints.length === 0 ? (
                   <tr>
                      <td colSpan="6" className="py-12 text-center text-muted-foreground">
                         <AlertCircle size={48} className="mx-auto mb-4 opacity-20" />
                         <p>No complaints match your search.</p>
                      </td>
                   </tr>
                ) : (
                   filteredComplaints.map((complaint, idx) => {
                      const countdown = getCountdown(complaint.dueDate, complaint.status);
                      return (
                      <motion.tr 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         key={complaint._id} 
                         className="hover:bg-muted/20 transition-colors group cursor-default"
                      >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                  {complaint._id.slice(-6).toUpperCase()}
                               </span>
                               <span className="text-xs font-bold text-foreground">{complaint.category}</span>
                            </div>
                            <p className="font-medium text-foreground line-clamp-2 max-w-sm">{complaint.description}</p>
                            {complaint.resolutionNotes && (
                               <div className="mt-1.5 p-2 bg-muted/50 rounded-lg text-xs border border-border/50">
                                  <span className="font-bold text-foreground">Note: </span>
                                  <span className="text-muted-foreground italic">{complaint.resolutionNotes}</span>
                               </div>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                               <span>Loc: {complaint.location || 'N/A'}</span>
                               {complaint.resident && (
                                  <>
                                     <span className="w-1 h-1 rounded-full bg-muted-foreground/50"></span>
                                     <span>{complaint.resident.name} (Flat {complaint.resident.flatNumber || 'Mngmt'})</span>
                                  </>
                               )}
                            </div>
                         </td>
                         <td className="py-4 px-6">
                            {complaint.assignedVendorId ? (
                               <div className="text-sm">
                                  <p className="font-semibold text-foreground flex items-center gap-1">
                                     {complaint.assignedVendorId.name} 
                                     {complaint.status === 'Completed' && <CheckCircle size={14} className="text-green-500" />}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{complaint.assignedVendorId.phone || 'No phone'}</p>
                               </div>
                            ) : (
                               <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Unassigned</span>
                            )}
                         </td>
                         <td className="py-4 px-6">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${getPriorityColor(complaint.priority)}`}>
                               {complaint.priority}
                            </span>
                         </td>
                         <td className="py-4 px-6">
                            <div className="flex flex-col items-start gap-1.5">
                               <span className={`text-xs px-2.5 py-1 border rounded-full font-bold inline-flex items-center gap-1.5 ${getStatusColor(complaint.status)}`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  {complaint.status}
                               </span>
                               {countdown && (
                                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${countdown.color}`}>
                                     <Clock size={10} /> {countdown.text}
                                  </span>
                               )}
                               {complaint.dueDate && (
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                     Due: {new Date(complaint.dueDate).toLocaleDateString()}
                                  </span>
                               )}
                            </div>
                         </td>
                         <td className="py-4 px-6 text-sm text-muted-foreground font-medium">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                         </td>
                         <td className="py-4 px-6 text-right align-top">
                             <div className="flex flex-col items-end gap-2">
                                {/* Admin Actions */}
                                {(user?.role === 'Society_Admin' || user?.role === 'Super_Admin') && (
                                   <>
                                     {(complaint.status === 'Pending' || complaint.status === 'Escalated' || complaint.status === 'Reassigned' || complaint.status === 'Rejected by Vendor') && (
                                        <button 
                                           onClick={() => setIsAssigning(complaint)}
                                           className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary hover:text-white transition-colors"
                                        >
                                           {complaint.status === 'Pending' ? 'Assign Vendor' : 'Reassign Vendor'}
                                        </button>
                                     )}
                                   </>
                                )}

                                {/* Resident Actions */}
                                {user?.role === 'Resident' && (
                                   <>
                                     {countdown && countdown.text === 'Overdue' && !['Completed', 'Escalated', 'Resolved'].includes(complaint.status) && (
                                        <button 
                                           onClick={() => handleAction(complaint._id, 'escalate')}
                                           className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors shadow-md animate-pulse"
                                        >
                                           Report Delay
                                        </button>
                                     )}
                                   </>
                                )}

                                {/* Vendor Actions */}
                                {user?.role === 'Vendor' && (
                                   <>
                                     {(complaint.status === 'Assigned' || complaint.status === 'Reassigned') && (
                                        <div className="flex flex-col gap-2 w-full items-end">
                                           <button 
                                              onClick={() => handleAction(complaint._id, 'start')}
                                              className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-md w-full text-center"
                                           >
                                              Start Work
                                           </button>
                                           <button 
                                              onClick={() => setIsRejecting(complaint)}
                                              className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs font-bold rounded-lg hover:bg-red-500 hover:text-white transition-colors w-full text-center"
                                           >
                                              Reject Task
                                           </button>
                                        </div>
                                     )}
                                     {complaint.status === 'In Progress' && (
                                        <button 
                                           onClick={() => handleAction(complaint._id, 'complete')}
                                           className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors shadow-md"
                                        >
                                           Mark Completed
                                        </button>
                                     )}
                                   </>
                                )}
                                
                             </div>
                         </td>
                      </motion.tr>
                   )})
                )}
             </tbody>
          </table>
       </motion.div>
    </div>
  );
};

export default Complaints;
