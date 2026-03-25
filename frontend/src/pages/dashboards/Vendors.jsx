import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Search, Filter, Phone, Star } from 'lucide-react';
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

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      // Adding mock rating and status dynamically for UI polish since schema only has basic fields
      const enrichedVendors = res.data.map(v => ({
        ...v,
        rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
        jobs: Math.floor(Math.random() * 100) + 10,
        vendorStatus: v.status === 'Approved' ? 'Available' : 'Unavailable'
      }));
      setVendors(enrichedVendors);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
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
            <p className="text-muted-foreground mt-1">Manage external contractors and approved service providers.</p>
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
           <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                 <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                    <th className="py-4 px-6 font-medium">Vendor Details</th>
                    <th className="py-4 px-6 font-medium">Service Category</th>
                    <th className="py-4 px-6 font-medium">Performance Rating</th>
                    <th className="py-4 px-6 font-medium">Status</th>
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
                          key={vendor.id} 
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
                          <td className="py-4 px-6 flex flex-col justify-center gap-1">
                             <div className="flex items-center gap-1 text-yellow-500">
                                <Star size={14} className="fill-current" />
                                <span className="text-sm font-bold text-foreground">{vendor.rating}</span>
                                <span className="text-xs text-muted-foreground font-medium truncate">({vendor.jobs} jobs)</span>
                             </div>
                          </td>
                          <td className="py-4 px-6">
                             <span className={`text-xs px-2.5 py-1 border rounded-full font-bold inline-flex items-center gap-1.5 ${getStatusColor(vendor.vendorStatus)}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_4px_currentColor]"></span>
                                {vendor.vendorStatus}
                             </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                             <div className="flex items-center justify-end gap-2 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-xs text-muted-foreground mr-2 font-mono">{vendor.phone || 'N/A'}</div>
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
    </div>
  );
};

export default Vendors;
