import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck, Wrench, Wallet, AlertCircle, Moon, Sun, Users, Activity, CreditCard, CheckCircle } from 'lucide-react';

const Landing = () => {
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
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 glass bg-background/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">SSMS</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className="p-2 text-muted-foreground hover:bg-muted focus:outline-none rounded-full transition-colors hidden sm:block"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link 
              to="/login"
              className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/50 text-sm font-medium mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            The Future of Society Management
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1]"
          >
            Manage your society with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">absolute clarity.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            A powerful, multi-tenant platform tailored for residents, security, vendors, and management. One unified dashboard.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              to="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3.5 rounded-full text-base font-semibold hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
            >
              Start for free
              <ArrowRight size={18} />
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent border border-border text-foreground px-8 py-3.5 rounded-full text-base font-semibold hover:bg-muted transition-all">
              Book a demo
            </button>
          </motion.div>
        </div>

        {/* Dashboard Preview Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-6xl mx-auto mt-20 px-6"
        >
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl glass">
            <div className="rounded-lg bg-muted/50 h-[400px] md:h-[600px] w-full border border-border overflow-hidden relative flex flex-col">
              {/* Fake browser top */}
              <div className="h-10 border-b border-border bg-background flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="flex-1 flex p-6 gap-6 bg-muted/20">
                  <div className="hidden md:flex flex-col gap-4 w-48 border-r border-border pr-4 opacity-70">
                     {[...Array(5)].map((_, i) => (
                       <div key={i} className="h-8 w-full bg-muted rounded-md border border-border"></div>
                     ))}
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                     <div className="flex gap-4 opacity-80">
                        <div className="flex-1 h-28 bg-card rounded-xl border border-border p-4 flex flex-col justify-between">
                           <div className="w-8 h-8 rounded-md bg-blue-500/20 flex items-center justify-center"><Users size={16} className="text-blue-500" /></div>
                           <div><div className="text-2xl font-bold">120+</div><div className="text-xs text-muted-foreground">Active Residents</div></div>
                        </div>
                        <div className="flex-1 h-28 bg-card rounded-xl border border-border p-4 flex flex-col justify-between">
                           <div className="w-8 h-8 rounded-md bg-green-500/20 flex items-center justify-center"><CreditCard size={16} className="text-green-500" /></div>
                           <div><div className="text-2xl font-bold">$4,500</div><div className="text-xs text-muted-foreground">Collected Dues</div></div>
                        </div>
                        <div className="flex-1 h-28 bg-card rounded-xl border border-border p-4 flex flex-col justify-between hidden sm:flex">
                           <div className="w-8 h-8 rounded-md bg-orange-500/20 flex items-center justify-center"><Activity size={16} className="text-orange-500" /></div>
                           <div><div className="text-2xl font-bold">12</div><div className="text-xs text-muted-foreground">Open Tickets</div></div>
                        </div>
                     </div>
                     <div className="flex-1 bg-card rounded-xl border border-border p-4 flex flex-col gap-3 opacity-90 overflow-hidden">
                        <div className="h-6 w-32 bg-muted rounded"></div>
                        {[...Array(4)].map((_, i) => (
                           <div key={i} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-muted"></div>
                                   <div className="space-y-1">
                                       <div className="h-3 w-24 bg-foreground/20 rounded"></div>
                                       <div className="h-2 w-16 bg-muted rounded"></div>
                                   </div>
                               </div>
                               <div className="h-6 w-16 bg-primary/10 rounded-full border border-primary/20"></div>
                           </div>
                        ))}
                     </div>
                  </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">SSMS provides dedicated portals for every user type ensuring smooth society operations.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: 'Society Admins', desc: 'Manage residents, complaints, financials and notices.' },
              { icon: ShieldCheck, title: 'Security Guards', desc: 'Track visitors with real-time resident approval.' },
              { icon: AlertCircle, title: 'Residents', desc: 'Pay bills, raise complaints, and approve visitors easily.' },
              { icon: Wrench, title: 'Vendors', desc: 'Track assigned maintenance tasks and update status.' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border p-6 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Transparent Pricing</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Simple, predictable pricing based on your society size. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: 'Free', desc: 'Up to 50 residents', features: ['Core Directory', 'Notice Board', 'Community Forums'] },
              { name: 'Pro', price: '₹2,499', desc: 'Up to 500 residents', features: ['All Starter Features', 'Complaint Management', 'Basic Billing', 'Security Gate App'], popular: true },
              { name: 'Enterprise', price: 'Custom', desc: 'Unlimited residents', features: ['Vendor Management', 'Advanced Analytics', 'Accounting Sync', '24/7 Priority Support'] }
            ].map((plan, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`flex flex-col p-8 rounded-3xl border ${plan.popular ? 'border-primary bg-primary/5 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-105' : 'border-border bg-card'}`}
              >
                {plan.popular && <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full w-fit mb-4">MOST POPULAR</span>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-6">{plan.desc}</p>
                <div className="text-4xl font-extrabold mb-8">{plan.price}<span className="text-lg text-muted-foreground font-medium">{plan.price !== 'Custom' && plan.price !== 'Free' ? '/mo' : ''}</span></div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                        <CheckCircle size={12} className="text-primary" />
                      </div>
                      <span className="font-medium text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link to="/login" className={`w-full py-3 rounded-xl font-bold text-center transition-colors ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
                  Choose {plan.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-muted/20 border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Trusted by 500+ Societies</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Hear what committee members and residents have to say about SSMS.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { quote: "SSMS has completely transformed how we handle visitor tracking and complaints. Our security guards love the new tablet app.", author: "Rajesh S.", role: "Society Secretary" },
              { quote: "Paying maintenance bills used to be a hassle. Now I get a notification and pay in 2 clicks. Everything is transparent.", author: "Priya M.", role: "Resident" },
              { quote: "The notice board feature ensures everyone is physically updated. Moving away from WhatsApp groups was the best decision.", author: "Amit K.", role: "Committee Member" },
            ].map((testi, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card glass border border-border p-8 rounded-2xl relative"
              >
                <div className="text-4xl text-primary/20 absolute top-4 right-6 font-serif">"</div>
                <p className="text-foreground/90 font-medium mb-6 relative z-10 leading-relaxed">
                  "{testi.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 font-bold flex items-center justify-center text-primary">
                    {testi.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{testi.author}</h4>
                    <p className="text-xs text-muted-foreground">{testi.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-border py-12 text-center text-muted-foreground">
         <p>© {new Date().getFullYear()} SSMS. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
