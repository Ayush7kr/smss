import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MoreVertical, Building } from 'lucide-react';
import api from '../../utils/api';

const Residents = () => {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await api.get('/users/residents');
      setResidents(res.data);
    } catch (error) {
      console.error('Failed to load residents', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.flatNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Residents Directory</h1>
            <p className="text-muted-foreground mt-1">Manage and view all approved residents in the society.</p>
         </div>
         <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
               type="text" 
               placeholder="Search by name or flat..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            />
         </div>
      </div>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="bg-card border border-border rounded-2xl glass shadow-sm overflow-hidden flex flex-col min-h-[500px]"
      >
        <div className="flex items-center gap-3 p-6 border-b border-border text-lg font-bold">
           <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Users size={20} />
           </div>
           Total Residents: {residents.length}
        </div>
        
        {loading ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
              <p className="text-muted-foreground font-medium">Loading residents...</p>
           </div>
        ) : filteredResidents.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Building size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No residents found</p>
              {searchTerm && <p className="text-sm">Try adjusting your search criteria</p>}
           </div>
        ) : (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-muted/30 border-b border-border text-muted-foreground text-sm">
                       <th className="py-4 px-6 font-medium">Resident Details</th>
                       <th className="py-4 px-6 font-medium">Contact Details</th>
                       <th className="py-4 px-6 font-medium">Role</th>
                       <th className="py-4 px-6 font-medium text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody>
                    {filteredResidents.map((user, idx) => (
                       <motion.tr 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          key={user._id} 
                          className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group"
                       >
                          <td className="py-4 px-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-foreground flex items-center justify-center font-bold border border-border/50 shadow-sm">
                                   {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                   <p className="font-bold">{user.name}</p>
                                   <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                      Flat: <span className="font-mono bg-muted px-1 rounded">{user.flatNumber || 'N/A'}</span>
                                   </p>
                                </div>
                             </div>
                          </td>
                          <td className="py-4 px-6">
                             <p className="text-sm font-medium">{user.email}</p>
                             <p className="text-xs text-muted-foreground mt-0.5">{user.phone || 'No phone provided'}</p>
                          </td>
                          <td className="py-4 px-6">
                             <span className="bg-primary/10 border border-primary/20 text-primary text-xs px-2.5 py-1 rounded-full font-semibold">
                                {user.role}
                             </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                             <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                                <MoreVertical size={18} />
                             </button>
                          </td>
                       </motion.tr>
                    ))}
                 </tbody>
              </table>
           </div>
        )}
      </motion.div>
    </div>
  );
};

export default Residents;
