import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Search, Filter, Download, DollarSign, Plus, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';

const getStatusColor = (status) => {
  switch(status) {
    case 'Pending': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'Paid': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'Overdue': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const Billing = () => {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newBill, setNewBill] = useState({ residentId: '', amount: '', description: '', month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, residentsRes] = await Promise.all([
        api.get('/billing'),
        user?.role === 'Society_Admin' ? api.get('/users/residents') : Promise.resolve({ data: [] })
      ]);
      setBills(billsRes.data);
      if (user?.role === 'Society_Admin') setResidents(residentsRes.data);
    } catch (err) {
      console.error('Failed to fetch billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/billing', newBill);
      // Re-fetch to populate resident data completely
      fetchData();
      setIsCreating(false);
      setNewBill({ residentId: '', amount: '', description: '', month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }), dueDate: '' });
    } catch (err) {
      console.error('Failed to create bill', err);
      alert('Failed to generate bill');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayBill = async (id) => {
    try {
      const res = await api.put(`/billing/${id}/pay`, { paymentMethod: 'Online Portal' });
      setBills(bills.map(b => b._id === id ? res.data : b));
    } catch (err) {
      console.error('Failed to pay bill', err);
      alert('Payment failed');
    }
  };

  const filteredInvoices = bills.filter(i => 
    i.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (i.resident?.flatNumber && i.resident.flatNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Invoices</h1>
            <p className="text-muted-foreground mt-1">Track maintenance charges, fines, and payment records.</p>
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
               <input 
                  type="text" 
                  placeholder="Search invoices..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
               />
            </div>
            <button className="p-2 border border-border rounded-lg bg-card hover:bg-muted text-foreground transition-colors" title="Filter">
               <Filter size={20} />
            </button>
            {user?.role === 'Society_Admin' && (
              <button 
                onClick={() => setIsCreating(!isCreating)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isCreating ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isCreating ? 'Cancel' : <><Plus size={16} /> Generate Invoice</>}
              </button>
            )}
         </div>
      </div>

      <AnimatePresence>
         {isCreating && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: 'auto' }}
               exit={{ opacity: 0, height: 0 }}
               className="bg-card border border-border rounded-xl p-6 shadow-sm overflow-hidden"
            >
               <form onSubmit={handleCreateBill} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Select Resident</label>
                        <select 
                           value={newBill.residentId} 
                           onChange={e => setNewBill({...newBill, residentId: e.target.value})}
                           required
                           className="w-full px-4 py-2 bg-background border border-border rounded-lg"
                        >
                           <option value="">-- Select Resident --</option>
                           {residents.map(r => (
                              <option key={r._id} value={r._id}>
                                Flat {r.flatNumber} - {r.name}
                              </option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                        <input type="number" min="0" value={newBill.amount} onChange={e => setNewBill({...newBill, amount: e.target.value})} required className="w-full px-4 py-2 bg-background border border-border rounded-lg" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Description / Bill Type</label>
                        <input type="text" value={newBill.description} onChange={e => setNewBill({...newBill, description: e.target.value})} placeholder="e.g. Monthly Maintenance" required className="w-full px-4 py-2 bg-background border border-border rounded-lg" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <input type="date" value={newBill.dueDate} onChange={e => setNewBill({...newBill, dueDate: e.target.value})} required className="w-full px-4 py-2 bg-background border border-border rounded-lg" />
                     </div>
                  </div>
                  <div className="flex justify-end mt-4">
                     <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                        {submitting ? 'Generating...' : 'Generate Invoice'}
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
                    <th className="py-4 px-6 font-medium">Invoice ID</th>
                    <th className="py-4 px-6 font-medium">Flat Unit</th>
                    <th className="py-4 px-6 font-medium">Type</th>
                    <th className="py-4 px-6 font-medium">Amount</th>
                    <th className="py-4 px-6 font-medium">Due Date</th>
                    <th className="py-4 px-6 font-medium">Status</th>
                    <th className="py-4 px-6 font-medium text-right">Download</th>
                 </tr>
              </thead>
              <tbody>
                 {filteredInvoices.length === 0 ? (
                    <tr>
                       <td colSpan="7" className="py-12 text-center text-muted-foreground">
                          <Wallet size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No invoices match your search.</p>
                       </td>
                    </tr>
                 ) : (
                    filteredInvoices.map((invoice, idx) => (
                       <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={invoice.id} 
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group cursor-pointer"
                       >
                          <td className="py-4 px-6 font-mono text-sm font-semibold">{invoice._id.slice(-6).toUpperCase()}</td>
                          <td className="py-4 px-6 font-bold">Flat {invoice.resident?.flatNumber || 'N/A'}</td>
                          <td className="py-4 px-6">
                             <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">{invoice.description}</span>
                          </td>
                          <td className="py-4 px-6 font-bold text-foreground">₹{invoice.amount?.toLocaleString()}</td>
                          <td className="py-4 px-6 text-sm text-foreground/80 font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td className="py-4 px-6">
                             <span className={`text-xs px-2.5 py-1 border rounded-full font-bold inline-flex items-center gap-1.5 ${getStatusColor(invoice.status)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                {invoice.status}
                             </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                             {user?.role === 'Resident' && invoice.status !== 'Paid' ? (
                               <button onClick={() => handlePayBill(invoice._id)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition-colors">
                                  <DollarSign size={14} /> Pay Now
                               </button>
                             ) : (
                               <button className="pr-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity hover:underline inline-flex items-center gap-1 font-medium text-sm">
                                  <Download size={14} /> Receipt
                               </button>
                             )}
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

export default Billing;
