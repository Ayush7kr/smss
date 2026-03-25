import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Truck, LogIn, Clock } from 'lucide-react';

const SecurityGuardDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Gate Dashboard</h1>
           <p className="text-muted-foreground mt-1">Monitor entry/exit and manage visitor logs.</p>
        </div>
        <button 
          onClick={() => navigate('/visitors')}
          className="bg-primary text-primary-foreground px-4 py-2 flex items-center gap-2 rounded-lg font-medium shadow-md hover:bg-primary/90 transition-all"
        >
           <LogIn size={18} /> New Visitor Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[
            { title: 'Current Visitors Inside', val: '12', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { title: 'Expected Deliveries', val: '5', icon: Truck, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { title: 'Entries Today', val: '43', icon: LogIn, color: 'text-green-500', bg: 'bg-green-500/10' },
            { title: 'Pending Approvals', val: '2', icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
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
         transition={{ delay: 0.4 }}
         className="bg-card border border-border p-6 rounded-2xl glass shadow-sm mt-8 relative overflow-hidden"
      >
         <h3 className="text-lg font-bold mb-6">Recent Gate Activity</h3>
         
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-lg">
                  <tr>
                     <th className="px-4 py-3 rounded-tl-lg">Visitor</th>
                     <th className="px-4 py-3">Flat</th>
                     <th className="px-4 py-3">Purpose</th>
                     <th className="px-4 py-3">Time</th>
                     <th className="px-4 py-3 rounded-tr-lg">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                  {/* Mock Activity Rows */}
                  {[
                     { name: 'Amazon Delivery', flat: 'B-304', purpose: 'Delivery', time: '10 mins ago', status: 'Inside', sCol: 'text-blue-500 bg-blue-500/10' },
                     { name: 'Ramesh (Plumber)', flat: 'A-101', purpose: 'Maintenance', time: '1 hr ago', status: 'Exited', sCol: 'text-muted-foreground bg-muted' },
                     { name: 'Uber Eats', flat: 'C-505', purpose: 'Delivery', time: 'Just now', status: 'Pending Approval', sCol: 'text-yellow-500 bg-yellow-500/10' },
                  ].map((row, i) => (
                     <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3">{row.flat}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.purpose}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.time}</td>
                        <td className="px-4 py-3">
                           <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.sCol}`}>{row.status}</span>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </motion.div>
    </div>
  );
};

export default SecurityGuardDashboard;
