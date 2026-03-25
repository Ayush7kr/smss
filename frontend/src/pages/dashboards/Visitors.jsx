import { useState, useEffect, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Search, Camera, LogOut, CheckCircle, XCircle, UserPlus } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import Webcam from "react-webcam";
import toast from 'react-hot-toast';

const getStatusColor = (status) => {
  switch(status) {
    case 'In Premises': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'Expected': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'Checked Out': return 'bg-green-500/10 text-green-500 border-green-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const Visitors = () => {
  const { user } = useContext(AuthContext);
  const [visitors, setVisitors] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTab, setActiveTab] = useState('logs'); // 'logs', 'create'
  
  // Guard - Manual Create
  const [newVisitor, setNewVisitor] = useState({ name: '', phone: '', purpose: '', flatNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const webcamRef = useRef(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    fetchVisitors();
    if (user?.role === 'Security_Guard') fetchResidents();
  }, [user]);

  const fetchVisitors = async () => {
    try {
      const res = await api.get('/visitors');
      setVisitors(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const fetchResidents = async () => {
    try {
      const res = await api.get('/users/residents');
      setResidents(res.data);
    } catch (err) { console.error(err); }
  };

  // Guard Manual Logging
  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhotoUrl(imageSrc);
    }
  };

  const handleCreateVisitor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/visitors', { ...newVisitor, photoUrl });
      toast.success("Visitor logged successfully");
      setVisitors([res.data, ...visitors]);
      setActiveTab('logs');
      setNewVisitor({ name: '', phone: '', purpose: '', flatNumber: '' });
      setPhotoUrl(null);
    } catch (err) {
      toast.error('Failed to log visitor. Check if flat number exists.');
    } finally { setSubmitting(false); }
  };

  const handleStatusUpdate = async (id, status, isExit = false) => {
    try {
      const payload = isExit ? { exitTime: new Date() } : { status };
      const res = await api.put(`/visitors/${id}`, payload);
      setVisitors(visitors.map(v => v._id === id ? res.data : v));
    } catch (err) { toast.error('Failed to update visitor'); }
  };

  const filteredVisitors = visitors.filter(v => 
    v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.resident?.flatNumber && v.resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Visitor Management</h1>
            <p className="text-muted-foreground mt-1">Real-time gate security and guest tracking log.</p>
         </div>
         {user?.role === 'Security_Guard' && (
            <div className="flex bg-muted p-1 rounded-xl">
               <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Logs</button>
               <button onClick={() => setActiveTab('create')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${activeTab === 'create' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}>Manual Log</button>
            </div>
         )}
         {user?.role === 'Resident' && (
            <div className="flex bg-muted p-1 rounded-xl">
               <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors bg-background shadow-sm text-foreground`}>My Visitors</button>
            </div>
         )}
      </div>

      <AnimatePresence mode="wait">
         {activeTab === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
               <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input type="text" placeholder="Search visitors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"/>
               </div>
               
               <div className="bg-card border border-border rounded-2xl glass shadow-sm overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                       <thead>
                          <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                             <th className="py-4 px-6 font-medium">Visitor Details</th>
                             <th className="py-4 px-6 font-medium">Visiting Host</th>
                             <th className="py-4 px-6 font-medium">Log Time</th>
                             <th className="py-4 px-6 font-medium">Status</th>
                             <th className="py-4 px-6 font-medium text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody>
                          {filteredVisitors.length === 0 ? (
                             <tr>
                                <td colSpan="5" className="py-12 text-center text-muted-foreground">
                                   <ShieldCheck size={48} className="mx-auto mb-4 opacity-20" />
                                   <p>No visitors log found.</p>
                                </td>
                             </tr>
                          ) : (
                             filteredVisitors.map((visitor, idx) => (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} key={visitor._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group">
                                   <td className="py-4 px-6">
                                      <div className="flex items-center gap-3">
                                         {visitor.photoUrl ? (
                                            <img src={visitor.photoUrl} alt="visitor" className="w-10 h-10 rounded-xl object-cover border border-border/50 shadow-sm shrink-0"/>
                                         ) : (
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 text-foreground flex items-center justify-center font-bold border border-border/50 shadow-sm shrink-0">
                                               {visitor.name?.charAt(0) || 'V'}
                                            </div>
                                         )}
                                         <div>
                                            <p className="font-bold text-foreground text-sm">{visitor.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                               <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{visitor.purpose || 'Guest'}</span>
                                            </div>
                                         </div>
                                      </div>
                                   </td>
                                   <td className="py-4 px-6 font-mono text-sm font-semibold">Flat {visitor.resident?.flatNumber || 'N/A'}</td>
                                   <td className="py-4 px-6">
                                      <p className="text-sm font-medium text-foreground">In: {new Date(visitor.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                      <p className="text-xs text-muted-foreground mt-0.5">Out: {visitor.exitTime ? new Date(visitor.exitTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--'}</p>
                                   </td>
                                   <td className="py-4 px-6">
                                      <span className={`text-xs px-2.5 py-1 border rounded-full font-bold inline-flex items-center gap-1.5 ${getStatusColor(visitor.status)}`}>
                                         <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_4px_currentColor]"></span>{visitor.status}
                                      </span>
                                   </td>
                                   <td className="py-4 px-6 text-right">
                                      <div className="flex items-center justify-end gap-2 pr-2">
                                         {user?.role === 'Security_Guard' && !visitor.exitTime && visitor.status !== 'Expected' && (
                                           <button onClick={() => handleStatusUpdate(visitor._id, null, true)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent" title="Log Exit">
                                              <LogOut size={18} />
                                           </button>
                                         )}
                                         {user?.role === 'Resident' && visitor.status === 'Pending' && (
                                           <>
                                             <button onClick={() => handleStatusUpdate(visitor._id, 'Approved')} className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg"><CheckCircle size={18} /></button>
                                             <button onClick={() => handleStatusUpdate(visitor._id, 'Rejected')} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><XCircle size={18} /></button>
                                           </>
                                         )}
                                      </div>
                                   </td>
                                </motion.tr>
                             ))
                          )}
                       </tbody>
                    </table>
                 </div>
               </div>
            </motion.div>
         )}

         {activeTab === 'create' && user?.role === 'Security_Guard' && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto">
               <div className="bg-card border border-border rounded-2xl shadow-sm p-8 glass grid grid-cols-1 md:grid-cols-2 gap-8">
                  <form onSubmit={handleCreateVisitor} className="space-y-4">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><UserPlus size={18} /> Manual Entry Registration</h3>
                     <input type="text" placeholder="Visitor Full Name" value={newVisitor.name} onChange={e => setNewVisitor({...newVisitor, name: e.target.value})} required className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-primary/50 text-sm font-medium"/>
                     <input type="tel" placeholder="Phone Number" value={newVisitor.phone} onChange={e => setNewVisitor({...newVisitor, phone: e.target.value})} required className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm" />
                     <select value={newVisitor.flatNumber} onChange={e => setNewVisitor({...newVisitor, flatNumber: e.target.value})} required className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium">
                        <option value="">Visiting Destination (Flat Unit)...</option>
                        {residents.map(r => (<option key={r._id} value={r.flatNumber}>{r.name} - Flat {r.flatNumber}</option>))}
                     </select>
                     <input type="text" placeholder="Purpose of Visit (e.g. Delivery)" value={newVisitor.purpose} onChange={e => setNewVisitor({...newVisitor, purpose: e.target.value})} required className="w-full px-4 py-2 bg-background border border-border rounded-xl text-sm" />
                     <button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground py-3 rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2">
                        {submitting ? 'Registering...' : 'Register Visitor Entry'}
                     </button>
                  </form>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-4 bg-muted/20 relative">
                     {photoUrl ? (
                        <>
                           <img src={photoUrl} className="rounded-xl w-full h-full object-cover shadow-sm mb-4" alt="Capture" />
                           <button onClick={() => setPhotoUrl(null)} className="absolute top-6 right-6 p-2 bg-background text-foreground rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"><XCircle size={18}/></button>
                        </>
                     ) : (
                        <>
                           <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ width: 1280, height: 720, facingMode: "user" }} className="rounded-xl w-full h-full object-cover shadow-sm mb-4 bg-black" />
                           <button type="button" onClick={capturePhoto} className="absolute bottom-6 bg-background text-foreground px-6 py-2 rounded-full font-bold shadow-xl border border-border flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                              <Camera size={18} /> Capture ID Photo
                           </button>
                        </>
                     )}
                  </div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
};

export default Visitors;
