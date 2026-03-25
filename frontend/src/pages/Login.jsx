import { useState, useContext, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Shield, Users, Wrench, Building2, Crown, Loader2, CheckCircle2, ArrowLeft, Moon, Sun } from 'lucide-react';

const roles = [
  { id: 'Resident', icon: Users, label: 'Resident', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'hover:border-blue-500' },
  { id: 'Society_Admin', icon: Building2, label: 'Society Admin', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'hover:border-purple-500' },
  { id: 'Security_Guard', icon: Shield, label: 'Security Guard', color: 'text-green-500', bg: 'bg-green-500/10', border: 'hover:border-green-500' },
  { id: 'Vendor', icon: Wrench, label: 'Vendor', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'hover:border-orange-500' },
  { id: 'Super_Admin', icon: Crown, label: 'Super Admin', color: 'text-red-500', bg: 'bg-red-500/10', border: 'hover:border-red-500' },
];

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [credentials, setCredentials] = useState({ name: '', email: '', password: '', tenantId: '', flatNumber: '', phone: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      localStorage.setItem('app-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('app-theme', 'light');
    }
  }, [isDark]);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setSuccessMessage('');
    setIsRegistering(false);
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    
    try {
      if (isRegistering) {
         const res = await register({ ...credentials, role: selectedRole });
         if (res?.status === 'Pending') {
            setSuccessMessage(res.message);
            setIsRegistering(false); // Flip back to login view
         } else {
            navigate('/dashboard'); // Super_Admin skips approval
         }
      } else {
         await login({ ...credentials, role: selectedRole });
         navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || (isRegistering ? 'Registration failed. Try again.' : 'Login failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="absolute -top-16 left-0 right-0 flex justify-between items-center w-full">
          <button 
            onClick={() => navigate('/')} 
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={16} />
            Back to friendly home
          </button>
          
          <button 
            onClick={() => setIsDark(!isDark)} 
            className="p-2 text-muted-foreground hover:bg-muted focus:outline-none rounded-full transition-colors"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Log in to your SSMS account</p>
        </div>

        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl glass relative">
          
          <AnimatePresence mode="wait">
            {!selectedRole ? (
              <motion.div
                key="role-selector"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider text-center">Select your role</h3>
                <div className="grid grid-cols-2 gap-3">
                  {roles.slice(0, 4).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-border bg-background transition-all ${r.border} hover:shadow-md group`}
                    >
                      <div className={`w-10 h-10 rounded-full ${r.bg} ${r.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <r.icon size={20} />
                      </div>
                      <span className="text-sm font-medium">{r.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handleRoleSelect('Super_Admin')}
                  className="w-full mt-3 flex items-center justify-center gap-2 p-3 rounded-xl border border-border bg-background transition-all hover:border-red-500 hover:shadow-md group"
                >
                  <Crown size={16} className="text-red-500" />
                  <span className="text-sm font-medium">Super Admin Log in</span>
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                     {(() => {
                        const R = roles.find(r => r.id === selectedRole);
                        return (
                          <>
                            <R.icon size={14} className={R.color} />
                            <span className="text-xs font-semibold">{R.label}</span>
                          </>
                        )
                     })()}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedRole(null)}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Change Role
                  </button>
                </div>

                {error && (
                  <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20 text-center">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="bg-green-500/10 text-green-500 text-sm p-3 rounded-lg border border-green-500/20 text-center flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    {successMessage}
                  </div>
                )}

                {isRegistering && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={credentials.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}

                {selectedRole !== 'Super_Admin' && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Tenant / Society ID</label>
                    <input 
                      type="text" 
                      name="tenantId"
                      value={credentials.tenantId}
                      onChange={handleChange}
                      required
                      placeholder="e.g. SOC123"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <input 
                    type="email" 
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                {isRegistering && selectedRole === 'Resident' && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Flat / Villa Number</label>
                    <input 
                      type="text" 
                      name="flatNumber"
                      value={credentials.flatNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g. A-102"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}

                {isRegistering && selectedRole === 'Vendor' && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Service Provided</label>
                    <input 
                      type="text" 
                      name="serviceType"
                      value={credentials.serviceType || ''}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Plumber, Electrician"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}

                {isRegistering && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={credentials.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 890"
                      className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Password</label>
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25 active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? 'Complete Registration' : 'Sign In')}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button 
                      type="button" 
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-primary hover:underline font-medium"
                    >
                      {isRegistering ? 'Sign in' : 'Register now'}
                    </button>
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
