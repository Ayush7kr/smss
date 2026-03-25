import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Wrench } from 'lucide-react';
import api from '../../utils/api';

const getCountdown = (dueDate, status) => {
  if (!dueDate || ['Completed', 'Verified', 'Resolved'].includes(status)) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'Overdue', color: 'text-red-500 bg-red-500/10' };
  if (diffDays === 0) return { text: 'Due Today', color: 'text-orange-500 bg-orange-500/10' };
  if (diffDays <= 2) return { text: `${diffDays} days left`, color: 'text-yellow-500 bg-yellow-500/10' };
  return { text: `${diffDays} days left`, color: 'text-muted-foreground bg-muted' };
};

const VendorDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/complaints');
      // Vendors only get their assigned complaints
      setTasks(data);
    } catch (err) {
      console.error('Failed to get tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (taskId, action) => {
    try {
      const res = await api.put(`/complaints/${taskId}/${action}`);
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      alert(`Failed to ${action} task`);
      console.error(err);
    }
  };

  const activeTasks = tasks.filter(t => ['Assigned', 'Reassigned', 'In Progress', 'Escalated'].includes(t.status));
  const newAssignments = tasks.filter(t => ['Assigned', 'Reassigned'].includes(t.status)).length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const resolved = tasks.filter(t => ['Completed', 'Verified', 'Resolved'].includes(t.status)).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Vendor Portal</h1>
         <p className="text-muted-foreground mt-1">Manage, update, and track your assigned maintenance tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
            { title: 'New Assignments', val: newAssignments, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { title: 'In Progress', val: inProgress, icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { title: 'Completed', val: resolved, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
         ].map((card, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-card border border-border p-6 rounded-2xl glass shadow-sm flex items-center gap-4"
             >
               <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
                 <card.icon size={24} />
               </div>
               <div>
                 <p className="text-muted-foreground text-sm font-medium">{card.title}</p>
                 <h3 className="text-2xl font-bold text-foreground">{card.val}</h3>
               </div>
             </motion.div>
         ))}
      </div>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3 }}
         className="bg-card border border-border p-6 rounded-2xl glass shadow-sm mt-8 relative overflow-hidden min-h-[400px]"
      >
         <h3 className="text-xl font-bold mb-6">Active Tasks Queue</h3>
         
         {loading ? (
             <div className="animate-pulse space-y-4">
                 <div className="h-24 bg-muted/30 rounded-xl"></div>
                 <div className="h-24 bg-muted/30 rounded-xl"></div>
             </div>
         ) : activeTasks.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                 <CheckCircle size={48} className="mb-4 opacity-20 text-green-500" />
                 <p className="text-lg font-medium">No active tasks right now!</p>
                 <p className="text-sm">You are all caught up.</p>
             </div>
         ) : (
             <div className="grid grid-cols-1 gap-4">
                {activeTasks.map((task, idx) => {
                   const countdown = getCountdown(task.dueDate, task.status);
                   const isNew = ['Assigned', 'Reassigned'].includes(task.status);
                   const isProgress = task.status === 'In Progress';
                   const isEscalated = task.status === 'Escalated';

                   let barColor = 'bg-blue-500';
                   if (isNew) barColor = 'bg-yellow-500';
                   if (isEscalated) barColor = 'bg-red-500';

                   return (
                      <motion.div 
                         initial={{ opacity: 0, x: -10 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: idx * 0.1 }}
                         key={task._id} 
                         className="border border-border/60 bg-muted/10 hover:bg-muted/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group transition-colors"
                      >
                         <div className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`}></div>
                         
                         <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                               <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                   isNew ? 'bg-yellow-500/10 text-yellow-500' : 
                                   isEscalated ? 'bg-red-500/10 text-red-500' : 
                                   'bg-blue-500/10 text-blue-500'
                               }`}>
                                  {task.status}
                               </span>
                               {countdown && (
                                   <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${countdown.color} flex items-center gap-1`}>
                                      <Clock size={10} /> {countdown.text}
                                   </span>
                               )}
                               {task.priority === 'High' && (
                                  <span className="text-xs text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-semibold bg-red-500/5">High Priority</span>
                               )}
                            </div>
                            <h4 className="font-semibold text-lg max-w-lg line-clamp-1" title={task.description}>{task.description}</h4>
                            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1 flex-wrap">
                               {task.category}  •  {task.location || 'N/A'}  •  
                               {task.resident && <span className="font-medium text-foreground">{task.resident.name} (Flat {task.resident.flatNumber})</span>}
                            </p>
                         </div>

                         <div className="flex items-center justify-end gap-3 mt-4 md:mt-0 min-w-[120px]">
                            {isNew && (
                               <button 
                                  onClick={() => handleAction(task._id, 'start')}
                                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] active:scale-95"
                               >
                                  Start Work
                               </button>
                            )}
                            {isProgress && (
                               <button 
                                  onClick={() => handleAction(task._id, 'complete')}
                                  className="w-full md:w-auto bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] active:scale-95"
                               >
                                  Mark Completed
                               </button>
                            )}
                         </div>
                      </motion.div>
                   )
                })}
             </div>
         )}
      </motion.div>
    </div>
  );
};

export default VendorDashboard;
