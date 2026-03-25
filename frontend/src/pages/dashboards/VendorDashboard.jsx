// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Wrench } from 'lucide-react';

const VendorDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
         <h1 className="text-3xl font-bold tracking-tight">Vendor Portal</h1>
         <p className="text-muted-foreground mt-1">Manage and update your assigned tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
            { title: 'New Assignments', val: '2', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
            { title: 'In Progress', val: '1', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { title: 'Resolved Today', val: '3', icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
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
         className="bg-card border border-border p-6 rounded-2xl glass shadow-sm mt-8 relative overflow-hidden"
      >
         <h3 className="text-lg font-bold mb-6">Assigned Tasks</h3>
         
         <div className="grid grid-cols-1 gap-4">
            {/* Task Card Mockup */}
            <div className="border border-border/60 bg-muted/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500"></div>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <span className="bg-yellow-500/10 text-yellow-500 text-xs font-bold px-2 py-0.5 rounded">New Assignment</span>
                     <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded-full">High Priority</span>
                  </div>
                  <h4 className="font-semibold text-lg">Main Pipe Burst</h4>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                     Block A, Basement  •  Reported by Admin 1 hour ago
                  </p>
               </div>
               <div className="flex items-center gap-3 mt-4 md:mt-0">
                  <button className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
                     Start Work
                  </button>
               </div>
            </div>

            <div className="border border-border/60 bg-muted/20 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden group">
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
               <div>
                  <div className="flex items-center gap-3 mb-1">
                     <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-0.5 rounded">In Progress</span>
                  </div>
                  <h4 className="font-semibold text-lg">AC Not Cooling in Clubhouse</h4>
                  <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                     Clubhouse, Ground Floor  •  Started 3 hours ago
                  </p>
               </div>
               <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 mt-4 md:mt-0">
                  <button className="border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-all">
                     Add Note
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md">
                     Mark Resolved
                  </button>
               </div>
            </div>
         </div>
      </motion.div>
    </div>
  );
};

export default VendorDashboard;
