import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Clock, CheckCircle } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create Notice Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newNotice, setNewNotice] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (error) {
      console.error('Failed to load notices', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async (e) => {
    e.preventDefault();
    if (!newNotice.title || !newNotice.content) return;
    
    setSubmitting(true);
    try {
      const res = await api.post('/notices', newNotice);
      setNotices([res.data, ...notices]);
      setNewNotice({ title: '', content: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create notice', error);
      alert('Failed to post notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (error) {
       console.error('Failed to delete notice', error);
    }
  };

  if (loading) {
    return (
       <div className="flex items-center justify-center p-12 h-[400px]">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
       </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Notice Board</h1>
            <p className="text-muted-foreground mt-1">Official announcements and updates from the Society Admin.</p>
         </div>
         {user?.role === 'Society_Admin' && (
            <button 
               onClick={() => setIsCreating(!isCreating)}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCreating ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
               }`}
            >
               {isCreating ? 'Cancel' : <><Plus size={16} /> Post Notice</>}
            </button>
         )}
      </div>

      {user?.role === 'Society_Admin' && (
         <AnimatePresence>
            {isCreating && (
               <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden"
               >
                  <form onSubmit={handleCreateNotice} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Notice Title</label>
                        <input 
                           type="text" 
                           value={newNotice.title}
                           onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                           placeholder="e.g. Scheduled Water Maintenance"
                           className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary transition-colors"
                           required
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Detailed Content</label>
                        <textarea 
                           value={newNotice.content}
                           onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                           placeholder="Provide all necessary details here..."
                           className="w-full px-4 py-2 bg-background border border-border rounded-lg min-h-[120px] focus:outline-none focus:border-primary transition-colors resize-y"
                           required
                        />
                     </div>
                     <div className="flex justify-end">
                        <button 
                           type="submit" 
                           disabled={submitting}
                           className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-50"
                        >
                           {submitting ? 'Posting...' : <><CheckCircle size={16} /> Publish Notice</>}
                        </button>
                     </div>
                  </form>
               </motion.div>
            )}
         </AnimatePresence>
      )}

      {notices.length === 0 ? (
         <div className="bg-card border border-border rounded-2xl glass p-12 flex flex-col items-center justify-center text-muted-foreground shadow-sm">
            <Megaphone size={48} className="mb-4 opacity-20" />
            <h3 className="text-xl font-bold text-foreground mb-1">No Active Notices</h3>
            <p>There are no announcements to display at this time.</p>
         </div>
      ) : (
         <div className="space-y-4">
            <AnimatePresence>
               {notices.map((notice, idx) => (
                  <motion.div
                     key={notice._id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: idx * 0.1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow relative group"
                  >
                     {user?.role === 'Society_Admin' && (
                        <button 
                           onClick={() => handleDeleteNotice(notice._id)}
                           className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                           title="Delete Notice"
                        >
                           <Trash2 size={18} />
                        </button>
                     )}
                     
                     <div className="flex items-start gap-4">
                        <div className="mt-1 p-3 bg-blue-500/10 text-blue-500 rounded-full shrink-0">
                           <Megaphone size={20} />
                        </div>
                        <div className="flex-1 pr-6">
                           <h3 className="text-xl font-bold text-foreground leading-tight">{notice.title}</h3>
                           <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                              <span className="flex items-center gap-1">
                                 <Clock size={12} />
                                 {new Date(notice.createdAt).toLocaleDateString('en-US', { 
                                    month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                 })}
                              </span>
                              <span className="bg-muted px-2 py-0.5 rounded-full border border-border/50">
                                 Posted by: {notice.authorName}
                              </span>
                           </div>
                           <div className="mt-4 text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                              {notice.content}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>
      )}
    </div>
  );
};

export default NoticeBoard;
