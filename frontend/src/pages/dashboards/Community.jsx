import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Heart, Send, BarChart2, Plus, Users, Clock } from 'lucide-react';
import api from '../../utils/api';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Community = () => {
   const { user } = useContext(AuthContext);
   const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'polls'
   const [posts, setPosts] = useState([]);
   const [polls, setPolls] = useState([]);
   const [loading, setLoading] = useState(true);
   const [expandedComments, setExpandedComments] = useState({});
   const [commentInputs, setCommentInputs] = useState({});
   
   const [newPost, setNewPost] = useState('');
   const [posting, setPosting] = useState(false);

   // Poll creation state
   const [showPollForm, setShowPollForm] = useState(false);
   const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''], validDays: 7 });

   useEffect(() => {
     fetchFeed();
   }, []);

   const fetchFeed = async () => {
     try {
       const res = await api.get('/feed');
       setPosts(res.data.posts);
       setPolls(res.data.polls);
     } catch (err) {
       console.error(err);
     } finally {
       setLoading(false);
     }
   };

   // interactions 
   const handlePost = async (e) => {
     e.preventDefault();
     if(!newPost) return;
     setPosting(true);
     try {
       const res = await api.post('/feed', { content: newPost });
       setPosts([res.data, ...posts]);
       setNewPost('');
       toast.success("Post published!");
     } catch(err) { toast.error("Failed to post"); }
     finally { setPosting(false); }
   };

   const toggleLike = async (postId) => {
     try {
       const res = await api.post(`/feed/${postId}/like`);
       setPosts(posts.map(p => p._id === postId ? res.data : p));
     } catch(err) { toast.error("Failed to like"); }
   };

   const toggleComments = (postId) => {
     setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
   };

   const handleCommentSubmit = async (e, postId) => {
     e.preventDefault();
     const text = commentInputs[postId];
     if(!text || !text.trim()) return;
     try {
        const res = await api.post(`/feed/${postId}/comments`, { text });
        setPosts(posts.map(p => p._id === postId ? res.data : p));
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
        toast.success("Reply added!");
     } catch(err) { toast.error("Failed to add reply"); }
   };

   const handleCreatePoll = async (e) => {
      e.preventDefault();
      const validOptions = newPoll.options.filter(o => o.trim() !== '');
      if (validOptions.length < 2) return toast.error("At least 2 options required");
      try {
         const res = await api.post('/feed/polls', { ...newPoll, options: validOptions });
         setPolls([res.data, ...polls]);
         setShowPollForm(false);
         setNewPoll({ question: '', options: ['', ''], validDays: 7 });
         toast.success("Poll created successfully!");
      } catch(err) { toast.error("Failed to create poll"); }
   };

   const votePoll = async (pollId, optionId) => {
     try {
       const res = await api.post(`/feed/polls/${pollId}/vote/${optionId}`);
       setPolls(polls.map(p => p._id === pollId ? res.data : p));
       toast.success("Vote recorded!");
     } catch(err) { toast.error(err.response?.data?.message || "Failed to vote"); }
   };

   const getOptionPercentage = (opt, allOptions) => {
      const total = allOptions.reduce((acc, o) => acc + o.votes.length, 0);
      return total === 0 ? 0 : Math.round((opt.votes.length / total) * 100);
   };

   if (loading) return <div className="animate-pulse h-32 w-full bg-muted rounded-2xl"></div>;

   return (
      <div className="space-y-6 max-w-4xl mx-auto">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <p className="text-muted-foreground mt-1">Engage with your society members and participate in polls.</p>
         </div>

         {/* Tabs */}
         <div className="flex gap-4 border-b border-border text-sm font-bold">
            <button 
               onClick={() => setActiveTab('feed')} 
               className={`pb-3 px-4 border-b-2 transition-all ${activeTab === 'feed' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'}`}
            >
               Feed
            </button>
            <button 
               onClick={() => setActiveTab('polls')} 
               className={`pb-3 px-4 border-b-2 transition-all ${activeTab === 'polls' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:border-muted hover:text-foreground'}`}
            >
               Polls
            </button>
         </div>

         <AnimatePresence mode="wait">
            {activeTab === 'feed' && (
               <motion.div 
                  key="feed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
               >
                  {/* Create Post input */}
                  <form onSubmit={handlePost} className="bg-card border border-border rounded-2xl p-4 shadow-sm glass relative overflow-hidden">
                     <textarea 
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="What's happening in your society?"
                        className="w-full bg-transparent border-none resize-none focus:ring-0 focus:outline-none text-foreground placeholder:text-muted-foreground min-h-[80px]"
                     />
                     <div className="flex justify-between items-center border-t border-border/50 pt-3 mt-2">
                        <div className="flex items-center gap-2 text-muted-foreground text-xs"><Users size={14}/> Visible to all residents</div>
                        <button type="submit" disabled={!newPost || posting} className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-full font-bold text-sm shadow-sm transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none">
                           <Send size={16} /> Post
                        </button>
                     </div>
                  </form>

                  {/* Feed stream */}
                  <div className="space-y-4">
                     {posts.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl">No posts yet. Be the first to start a discussion!</div>
                     ) : (
                        posts.map(post => {
                           const isLiked = user && post.likes?.includes(user._id);
                           return (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={post._id} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                                 <div className="flex gap-3 items-center mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex flex-col justify-center items-center text-xs">
                                       <span className="text-lg leading-none">{post.author?.name?.charAt(0) || '?'}</span>
                                    </div>
                                    <div>
                                       <p className="font-bold text-sm">{post.author?.name || 'Unknown User'}</p>
                                       <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()} • Flat {post.author?.flatNumber || 'N/A'}</p>
                                    </div>
                                 </div>
                                 <p className="text-sm font-medium leading-relaxed mb-4">{post.content}</p>
                                 <div className="border-t border-border pt-3 mt-2 flex gap-6 text-sm">
                                    <button onClick={() => toggleLike(post._id)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors overflow-hidden ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground hover:bg-muted/50'}`}>
                                       <Heart size={18} className={isLiked ? "fill-red-500" : ""} />
                                       <span className="font-semibold">{post.likes?.length || 0}</span>
                                    </button>
                                    <button onClick={() => toggleComments(post._id)} className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-muted-foreground hover:bg-muted/50">
                                       <MessageSquare size={18} />
                                       <span className="font-semibold">{post.comments?.length || 0}</span>
                                    </button>
                                 </div>

                                 {/* Comments Section */}
                                 <AnimatePresence>
                                    {expandedComments[post._id] && (
                                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                          <div className="pt-4 mt-2 border-t border-border space-y-4">
                                             {/* Existing Comments */}
                                             {post.comments?.length > 0 ? (
                                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                   {post.comments.map((comment, i) => (
                                                      <div key={i} className="flex gap-3 bg-muted/20 p-3 rounded-xl border border-border/50">
                                                         <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                            {comment.user?.name?.charAt(0) || '?'}
                                                         </div>
                                                         <div>
                                                            <div className="flex items-baseline gap-2">
                                                               <span className="text-sm font-bold">{comment.user?.name || 'Unknown'}</span>
                                                               <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-sm text-foreground/90 mt-0.5">{comment.text}</p>
                                                         </div>
                                                      </div>
                                                   ))}
                                                </div>
                                             ) : (
                                                <p className="text-xs text-muted-foreground text-center italic py-2">No replies yet. Start the conversation!</p>
                                             )}

                                             {/* Add Comment Input */}
                                             <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-2 relative">
                                                <input 
                                                   type="text" 
                                                   placeholder="Write a reply..." 
                                                   value={commentInputs[post._id] || ''}
                                                   onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                                                   className="flex-1 bg-background border border-border rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                />
                                                <button type="submit" disabled={!commentInputs[post._id]?.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100">
                                                   <Send size={14} className="-ml-0.5" />
                                                </button>
                                             </form>
                                          </div>
                                       </motion.div>
                                    )}
                                 </AnimatePresence>
                              </motion.div>
                           );
                        })
                     )}
                  </div>
               </motion.div>
            )}

            {activeTab === 'polls' && (
               <motion.div
                  key="polls"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
               >
                  {showPollForm ? (
                     <motion.form initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleCreatePoll} className="bg-card border border-border rounded-2xl p-6 shadow-sm glass">
                        <h3 className="font-bold mb-4">Create a new Poll</h3>
                        <div className="space-y-4">
                           <input type="text" placeholder="Poll Question" required value={newPoll.question} onChange={e => setNewPoll({...newPoll, question: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:ring-primary/50 text-sm font-medium"/>
                           
                           <div className="space-y-2 pl-4 border-l-2 border-border/50">
                              {newPoll.options.map((opt, idx) => (
                                 <input key={idx} type="text" placeholder={`Option ${idx + 1}`} value={opt} onChange={e => {
                                    const newOpts = [...newPoll.options];
                                    newOpts[idx] = e.target.value;
                                    setNewPoll({...newPoll, options: newOpts});
                                 }} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-sm transition-all" />
                              ))}
                              {newPoll.options.length < 5 && (
                                 <button type="button" onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})} className="text-xs text-primary font-bold hover:underline flex items-center gap-1">+ Add Option</button>
                              )}
                           </div>
                           
                           <div className="flex items-center gap-4 text-sm mt-4">
                              <label className="text-muted-foreground font-medium">Active for:</label>
                              <select value={newPoll.validDays} onChange={e => setNewPoll({...newPoll, validDays: Number(e.target.value)})} className="bg-background border border-border rounded-md px-3 py-1 font-mono">
                                 <option value={1}>1 Day</option><option value={3}>3 Days</option><option value={7}>1 Week</option>
                              </select>
                           </div>

                           <div className="flex gap-3 justify-end pt-4 border-t border-border">
                              <button type="button" onClick={() => setShowPollForm(false)} className="px-5 py-2 hover:bg-muted text-sm rounded-xl font-bold transition-colors">Cancel</button>
                              <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all">Publish Poll</button>
                           </div>
                        </div>
                     </motion.form>
                  ) : (
                     <div className="flex justify-end">
                        <button onClick={() => setShowPollForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm hover:scale-105 active:scale-95 transition-all">
                           <BarChart2 size={16} /> Create Poll
                        </button>
                     </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {polls.length === 0 ? (
                        <div className="col-span-full p-12 text-center text-muted-foreground border border-dashed border-border rounded-2xl">No active polls.</div>
                     ) : (
                        polls.map(poll => {
                           // Ensure safety check for user
                           const hasVoted = user && poll.options?.some(opt => opt.votes?.includes(user._id));
                           const totalVotes = poll.options?.reduce((acc, o) => acc + (o.votes?.length || 0), 0) || 0;
                           
                           return (
                              <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={poll._id} className="bg-card border border-border rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                                 <div>
                                    <div className="flex justify-between items-start mb-4">
                                       <h3 className="font-bold text-lg leading-tight break-words pr-4">{poll.question}</h3>
                                       {!poll.active ? (
                                          <span className="text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full shrink-0">Ended</span>
                                       ) : hasVoted ? (
                                          <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0 border border-primary/20">Voted</span>
                                       ) : (
                                          <span className="text-[10px] uppercase font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-full shrink-0">Active</span>
                                       )}
                                    </div>
                                    <div className="space-y-3 mt-4 mb-4">
                                       {poll.options.map((opt, i) => {
                                          const perc = getOptionPercentage(opt, poll.options);
                                          const isWinner = !poll.active && Math.max(...poll.options.map(o => o.votes.length)) === opt.votes.length && opt.votes.length > 0;
                                          const userChoseThis = user && opt.votes?.includes(user._id);
                                          
                                          return (
                                             <div key={i} className="relative">
                                                {(hasVoted || !poll.active) ? (
                                                   <div className={`relative h-10 w-full bg-muted/50 rounded-lg overflow-hidden border flex items-center px-4 z-10 transition-colors ${userChoseThis ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 'border-border/50'}`}>
                                                      <motion.div initial={{ width: 0 }} animate={{ width: `${perc}%` }} className={`absolute left-0 top-0 bottom-0 z-[-1] opacity-20 ${isWinner ? 'bg-green-500 opacity-30' : 'bg-primary'}`}></motion.div>
                                                      <div className="flex justify-between w-full font-medium text-sm">
                                                         <span className={userChoseThis ? 'font-bold text-primary flex items-center gap-1.5' : ''}>
                                                            {opt.text} {userChoseThis && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded uppercase tracking-wider ml-1">Your Vote ✓</span>}
                                                         </span>
                                                         <span className={userChoseThis ? 'font-bold text-primary text-xs' : 'text-xs'}>{opt.votes.length} ({perc}%)</span>
                                                      </div>
                                                   </div>
                                                ) : (
                                                   <button onClick={() => votePoll(poll._id, opt._id)} className="w-full text-left px-4 py-2.5 border border-border hover:border-primary/50 hover:bg-primary/5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden">
                                                      <span className="relative z-10">{opt.text}</span>
                                                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors z-0"></div>
                                                   </button>
                                                )}
                                             </div>
                                          )
                                       })}
                                    </div>
                                 </div>
                                 
                                 <div className="border-t border-border pt-4 mt-2 flex justify-between text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1 font-semibold"><Users size={12}/> {totalVotes} votes</span>
                                    {poll.active && (
                                       <span className="flex items-center gap-1"><Clock size={12} className="text-orange-500" /> Ends {new Date(poll.expiresAt).toLocaleDateString()}</span>
                                    )}
                                 </div>
                              </motion.div>
                           )
                        })
                     )}
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

export default Community;
