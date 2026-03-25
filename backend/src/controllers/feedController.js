const PostSchema = require('../models/Post');
const PollSchema = require('../models/Poll');
const UserSchema = require('../models/User');

// @desc    Get society feed (posts and polls)
// @route   GET /api/feed
// @access  Private
const getFeed = async (req, res) => {
  try {
    const Post = req.tenantDb.model('Post', PostSchema);
    const Poll = req.tenantDb.model('Poll', PollSchema);
    req.tenantDb.model('User', UserSchema); // ensure User is compiled for populate
    
    const posts = await Post.find()
         .populate({ path: 'author', select: 'name flatNumber role' })
         .populate({ path: 'comments.user', select: 'name' })
         .sort({ createdAt: -1 })
         .limit(50);
         
    const polls = await Poll.find()
         .populate({ path: 'author', select: 'name flatNumber role' })
         .sort({ createdAt: -1 })
         .limit(20);
    
    // Auto-deactivate expired polls on read
    const now = new Date();
    polls.forEach(async (poll) => {
       if (poll.active && new Date(poll.expiresAt) < now) {
          poll.active = false;
          await poll.save();
       }
    });
    
    res.json({ posts, polls });
  } catch (error) {
    console.error('Feed Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const createPost = async (req, res) => {
  try {
    const Post = req.tenantDb.model('Post', PostSchema);
    req.tenantDb.model('User', UserSchema);
    const newPost = await Post.create({ author: req.user.userId, content: req.body.content });
    
    const populated = await newPost.populate({ path: 'author', select: 'name flatNumber role' });
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const toggleLikePost = async (req, res) => {
  try {
    const Post = req.tenantDb.model('Post', PostSchema);
    req.tenantDb.model('User', UserSchema);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    
    const likedIndex = post.likes.indexOf(req.user.userId);
    if(likedIndex > -1) post.likes.splice(likedIndex, 1);
    else post.likes.push(req.user.userId);
    
    await post.save();
    const populated = await post.populate([
       { path: 'author', select: 'name flatNumber role' },
       { path: 'comments.user', select: 'name' }
    ]);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const addComment = async (req, res) => {
  try {
    const Post = req.tenantDb.model('Post', PostSchema);
    req.tenantDb.model('User', UserSchema);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Not found' });
    
    post.comments.push({ user: req.user.userId, text: req.body.text });
    await post.save();
    
    const populated = await post.populate([
       { path: 'author', select: 'name flatNumber role' },
       { path: 'comments.user', select: 'name' }
    ]);
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const createPoll = async (req, res) => {
  try {
    const Poll = req.tenantDb.model('Poll', PollSchema);
    req.tenantDb.model('User', UserSchema);
    const { question, options, validDays } = req.body;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (validDays || 7));
    
    const mappedOptions = options.map(opt => ({ text: opt, votes: [] }));
    const newPoll = await Poll.create({ author: req.user.userId, question, options: mappedOptions, expiresAt });
    
    const populated = await newPoll.populate({ path: 'author', select: 'name flatNumber role' });
    res.status(201).json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

const votePoll = async (req, res) => {
  try {
    const Poll = req.tenantDb.model('Poll', PollSchema);
    req.tenantDb.model('User', UserSchema);
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: 'Not found' });
    
    if (new Date(poll.expiresAt) < new Date()) {
       poll.active = false;
       await poll.save();
       return res.status(400).json({ message: 'Poll has expired' });
    }
    
    const alreadyVoted = poll.options.some(opt => opt.votes.includes(req.user.userId));
    if (alreadyVoted) return res.status(400).json({ message: 'Already voted' });
    
    const option = poll.options.id(req.params.optionId);
    if (!option) return res.status(404).json({ message: 'Option not found' });
    
    option.votes.push(req.user.userId);
    await poll.save();
    
    const populated = await poll.populate({ path: 'author', select: 'name flatNumber role' });
    res.json(populated);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
};

module.exports = { getFeed, createPost, toggleLikePost, addComment, createPoll, votePoll };
